from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import schemas, models, jwt
from app.auth.dependencies import get_current_tenant_context
from app.tenants.models import Tenant
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=schemas.Token)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # 1. Check if user exists
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # 2. Create User (Hashed password!)
    new_user = models.User(
        email=user_in.email,
        hashed_password=jwt.get_password_hash(user_in.password),
        full_name=user_in.full_name
    )
    db.add(new_user)
    db.flush() # Get user ID before committing

    # 3. Create Tenant (Project)
    new_tenant = Tenant(
        name=user_in.workspace_name,
        slug=user_in.workspace_name.lower().replace(" ", "-") + "-" + str(uuid.uuid4())[:4]
    )
    db.add(new_tenant)
    db.flush()

    # 4. Create Membership (Owner role)
    new_membership = models.Membership(
        user_id=new_user.id,
        tenant_id=new_tenant.id,
        role="owner"
    )
    db.add(new_membership)
    db.commit()

    # 5. Issue Token with Tenant Context
    access_token = jwt.create_access_token(
        data={"user_id": new_user.id, "tenant_id": new_tenant.id, "role": "owner"}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not jwt.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Find their primary/first workspace
    membership = db.query(models.Membership).filter(models.Membership.user_id == user.id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="No workspace found for user")

    access_token = jwt.create_access_token(
        data={"user_id": user.id, "tenant_id": membership.tenant_id, "role": membership.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me")
def get_me(current_user: schemas.TokenData = Depends(get_current_tenant_context)):
    return current_user