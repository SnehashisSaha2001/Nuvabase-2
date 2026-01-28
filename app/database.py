
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/novabase")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def set_db_tenant_context(db, tenant_id: str, user_id: str = None):
    """
    Identity Handshake: Injects tenant_id and user_id into the Postgres session.
    Forces RLS and Audit Triggers to see the correct context.
    """
    db.execute(text("SET LOCAL app.current_tenant = :tenant_id"), {"tenant_id": tenant_id})
    if user_id:
        db.execute(text("SET LOCAL app.current_user = :user_id"), {"user_id": user_id})
