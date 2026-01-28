
from sqlalchemy import Table, MetaData, select, insert, update, delete, exc
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.database import engine as db_engine
from app.auto_api.models import AuditLog

metadata = MetaData()

def get_reflected_table(table_name: str):
    """
    Retrieves the table schema directly from the database engine using reflection.
    """
    try:
        local_metadata = MetaData()
        table = Table(table_name, local_metadata, autoload_with=db_engine)
        return table
    except exc.NoSuchTableError:
        raise HTTPException(status_code=404, detail=f"Table '{table_name}' not found.")

def log_mutation(db: Session, tenant_id: str, user_id: str, action: str, table: str, rec_id: str, data: dict = None):
    """
    Creates an immutable audit log for every mutation.
    """
    log = AuditLog(
        tenant_id=tenant_id,
        user_id=user_id,
        action=action,
        table_name=table,
        record_id=rec_id,
        payload=data
    )
    db.add(log)

class CrudEngine:
    @staticmethod
    def read_rows(db: Session, table_name: str):
        table = get_reflected_table(table_name)
        # RLS SECURITY: We do not add a WHERE clause here. 
        # The Postgres session GUC 'app.current_tenant' (set in middleware)
        # causes the database to transparently filter rows for us.
        query = select(table)
        try:
            return db.execute(query).mappings().all()
        except exc.InternalError as e:
            # Usually triggered if the RLS variable isn't set
            raise HTTPException(status_code=403, detail="Unauthorized: Security Context Missing.")

    @staticmethod
    def create_row(db: Session, table_name: str, tenant_id: str, user_id: str, sanitized_data: dict):
        table = get_reflected_table(table_name)
        
        # CORE SECURITY: Overwrite/Inject the system-validated tenant_id.
        # This prevents any possibility of a user masquerading as another tenant.
        sanitized_data["tenant_id"] = tenant_id 
        
        # Inject user context if the column exists
        if "user_id" in table.columns:
            sanitized_data["user_id"] = user_id
        
        query = insert(table).values(**sanitized_data).returning(table)
        try:
            result = db.execute(query)
            row = result.mappings().first()
            
            # Identify the primary key for the audit log
            pk_val = str(row.get('id') or row.get('user_id') or 'unknown')
            log_mutation(db, tenant_id, user_id, "CREATE", table_name, pk_val, sanitized_data)
            
            db.commit()
            return row
        except exc.IntegrityError as e:
            db.rollback()
            raise HTTPException(status_code=400, detail="Database integrity violation. Please check unique constraints or foreign keys.")

    @staticmethod
    def update_row(db: Session, table_name: str, row_id: str, tenant_id: str, user_id: str, sanitized_data: dict):
        table = get_reflected_table(table_name)
        
        # Ensure 'tenant_id' is NOT in the update payload to prevent cross-tenant migration
        sanitized_data.pop("tenant_id", None)
        
        # Postgres RLS will automatically block this update if the row_id doesn't 
        # belong to the active 'app.current_tenant'.
        query = update(table).where(table.c.id == row_id).values(**sanitized_data).returning(table)
        
        try:
            result = db.execute(query)
            row = result.mappings().first()
            if not row:
                raise HTTPException(status_code=404, detail="Resource not found or access denied.")
            
            log_mutation(db, tenant_id, user_id, "UPDATE", table_name, row_id, sanitized_data)
            db.commit()
            return row
        except exc.DBAPIError:
            db.rollback()
            raise HTTPException(status_code=400, detail="Failed to update record.")

    @staticmethod
    def delete_row(db: Session, table_name: str, row_id: str, tenant_id: str, user_id: str):
        table = get_reflected_table(table_name)
        
        # RLS prevents deletion of other tenant's rows.
        query = delete(table).where(table.c.id == row_id).returning(table.c.id)
        
        result = db.execute(query)
        res = result.fetchone()
        if not res:
            raise HTTPException(status_code=404, detail="Resource not found or access denied.")
        
        log_mutation(db, tenant_id, user_id, "DELETE", table_name, row_id)
        db.commit()
        return {"status": "success", "message": f"Record {row_id} deleted."}
