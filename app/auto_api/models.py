from sqlalchemy import Column, String, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.sql import func
from app.database import Base
import uuid

class TableMeta(Base):
    """
    Registry for public API exposure. 
    Deny-by-default: Only tables here are accessible via /api.
    """
    __tablename__ = "tables_meta"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    table_name = Column(String, unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AuditLog(Base):
    """
    Forensic tracking for all data mutations.
    Required for enterprise trust and incident response.
    """
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String, index=True)
    user_id = Column(String, index=True)
    action = Column(String) # CREATE, UPDATE, DELETE
    table_name = Column(String)
    record_id = Column(String)
    payload = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
