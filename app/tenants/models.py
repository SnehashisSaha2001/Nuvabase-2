from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Tenant(Base):
    """
    The Tenant model represents a 'Project' in NovaBase.
    This is the top-level container for all customer data.
    """
    __tablename__ = "tenants"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

class TenantScopedModel:
    """
    A MixIn class to ensure all tenant-specific data is isolated.
    Every custom user table MUST inherit from this to prevent data leaks.
    """
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False, index=True)
