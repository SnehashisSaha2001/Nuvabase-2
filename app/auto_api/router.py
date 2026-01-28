
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Any, Dict
from app.database import get_db, set_db_tenant_context
from app.auth.dependencies import get_current_tenant_context
from app.auth.schemas import TokenData
from app.auto_api.engine import CrudEngine
from app.auto_api import validators

router = APIRouter(prefix="/api", tags=["Auto-CRUD API"])

@router.get("/{table_name}")
def list_records(
    table_name: str,
    db: Session = Depends(get_db),
    context: TokenData = Depends(get_current_tenant_context)
):
    validators.validate_table_registry(db, table_name)
    set_db_tenant_context(db, context.tenant_id, context.user_id)
    return CrudEngine.read_rows(db, table_name)

@router.post("/{table_name}")
def create_record(
    table_name: str,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    context: TokenData = Depends(get_current_tenant_context)
):
    validators.validate_table_registry(db, table_name)
    set_db_tenant_context(db, context.tenant_id, context.user_id)
    clean_data = validators.sanitize_and_validate_payload(table_name, data)
    return CrudEngine.create_row(db, table_name, context.tenant_id, context.user_id, clean_data)

@router.patch("/{table_name}/{row_id}")
def update_record(
    table_name: str,
    row_id: str,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    context: TokenData = Depends(get_current_tenant_context)
):
    validators.validate_table_registry(db, table_name)
    set_db_tenant_context(db, context.tenant_id, context.user_id)
    clean_data = validators.sanitize_and_validate_payload(table_name, data, is_update=True)
    return CrudEngine.update_row(db, table_name, row_id, context.tenant_id, context.user_id, clean_data)

@router.delete("/{table_name}/{row_id}")
def delete_record(
    table_name: str,
    row_id: str,
    db: Session = Depends(get_db),
    context: TokenData = Depends(get_current_tenant_context)
):
    validators.validate_table_registry(db, table_name)
    set_db_tenant_context(db, context.tenant_id, context.user_id)
    return CrudEngine.delete_row(db, table_name, row_id, context.tenant_id, context.user_id)
