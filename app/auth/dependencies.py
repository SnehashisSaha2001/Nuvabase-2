from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.auth.jwt import SECRET_KEY, ALGORITHM
from app.auth.schemas import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_tenant_context(token: str = Depends(oauth2_scheme)):
    """
    This dependency ensures the user is authenticated AND 
    provides the tenant_id for automatic query scoping.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("user_id")
        tenant_id: str = payload.get("tenant_id")
        role: str = payload.get("role")
        
        if user_id is None or tenant_id is None:
            raise credentials_exception
            
        return TokenData(user_id=user_id, tenant_id=tenant_id, role=role)
    except JWTError:
        raise credentials_exception
