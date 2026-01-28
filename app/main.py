
from fastapi import FastAPI, Depends
from app.database import engine, Base
from app.auth import routes as auth_routes
from app.auto_api import router as auto_api_routes
from app.middleware import OperationalMiddleware

# Register all models
from app.tenants import models as tenant_models
from app.auth import models as auth_models
from app.auto_api import models as auto_models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NovaBase API Engine",
    description="High-Performance Multi-Tenant BaaS Backend",
    version="1.0.0"
)

# Operational & Safety Middleware (Registered first to wrap everything)
app.add_middleware(OperationalMiddleware)

app.include_router(auth_routes.router)
app.include_router(auto_api_routes.router)

@app.get("/")
async def root():
    return {
        "status": "NovaBase Core Online",
        "phase": 5,
        "readiness": "Public SaaS Ready",
        "reliability": "RLS + SRE Guardrails Active"
    }
