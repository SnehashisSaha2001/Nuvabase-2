
from sqlalchemy import inspect
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.auto_api.models import TableMeta
from app.auto_api.engine import get_reflected_table

def validate_table_registry(db: Session, table_name: str):
    """
    Explicit Allow-list Enforcement.
    Only tables explicitly registered and marked active in 'tables_meta' are reachable. 
    """
    meta = db.query(TableMeta).filter(
        TableMeta.table_name == table_name,
        TableMeta.is_active == True
    ).first()
    
    if not meta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint not found."
        )
    return True

def sanitize_and_validate_payload(table_name: str, payload: dict, is_update: bool = False):
    """
    Strict Column-Level Allow-listing.
    Filters out any fields that are system-managed or protected.
    REJECTS requests that attempt to write to protected fields.
    """
    table = get_reflected_table(table_name)
    db_columns = {c.name: c for c in table.columns}
    
    # SYSTEM PROTECTED FIELDS: Immutable from the public API
    PROTECTED_FIELDS = [
        "tenant_id", 
        "id", 
        "user_id", 
        "created_at", 
        "updated_at", 
        "deleted_at", 
        "owner_id", 
        "is_verified",
        "version",
        "metadata",
        "hashed_password",
        "salt"
    ]
    
    sanitized_data = {}
    
    for key, value in payload.items():
        lowered_key = key.lower()
        
        # 1. Block known protected fields
        if lowered_key in PROTECTED_FIELDS:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Security Violation: Property '{key}' is system-protected and cannot be modified."
            )
            
        # 2. Block unknown columns
        if key not in db_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Property '{key}' does not exist on this resource."
            )
            
        sanitized_data[key] = value
        
    if not sanitized_data and not is_update:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payload contains no valid fields."
        )
        
    return sanitized_data
