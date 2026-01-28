from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.sql import func
from app.database import Base
import uuid
import enum

class UserRole(str, enum.Enum):
    OWNER = "owner"
    ADMIN = "admin"
    DEVELOPER = "developer"

class User(Base):
    __tablename__ = "users_auth" # Renamed to avoid collision with tenant data table

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users_auth.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Membership(Base):
    __tablename__ = "memberships"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users_auth.id"), nullable=False)
    tenant_id = Column(String, ForeignKey("tenants.id"), nullable=False)
    role = Column(String, default=UserRole.OWNER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
