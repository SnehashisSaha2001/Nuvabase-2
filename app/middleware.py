import time
import uuid
import json
import logging
from fastapi import Request, Response, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from typing import Callable, Dict

# Configure Structured Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("novabase.sre")

# In-memory rate limiter (In prod, use Redis)
RATE_LIMIT_STORAGE: Dict[str, list] = {}
RATE_LIMIT_WINDOW = 60 # seconds
MAX_REQUESTS_PER_IP = 100
MAX_REQUESTS_PER_TENANT = 500

class OperationalMiddleware(BaseHTTPMiddleware):
    """
    SaaS Operational Layer: Handles Request Tracing, Rate Limiting, and Safety.
    """
    async def dispatch(self, request: Request, call_next: Callable):
        request_id = str(uuid.uuid4())
        start_time = time.time()
        client_ip = request.client.host if request.client else "unknown"
        
        # 1. Per-IP Rate Limiting
        now = time.time()
        ip_history = RATE_LIMIT_STORAGE.get(client_ip, [])
        ip_history = [t for t in ip_history if now - t < RATE_LIMIT_WINDOW]
        RATE_LIMIT_STORAGE[client_ip] = ip_history + [now]
        
        if len(ip_history) >= MAX_REQUESTS_PER_IP:
            return JSONResponse(
                status_code=429, 
                content={
                    "error": "Rate limit exceeded", 
                    "request_id": request_id,
                    "retry_after": RATE_LIMIT_WINDOW
                }
            )

        # 2. Safety: Payload Size Limit (5MB)
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 5 * 1024 * 1024:
            return JSONResponse(status_code=413, content={"error": "Payload too large"})

        # 3. Process Request
        try:
            response: Response = await call_next(request)
        except Exception as e:
            logger.error(f"Unhandled Exception: {str(e)}", extra={"request_id": request_id})
            return JSONResponse(
                status_code=500, 
                content={"error": "Internal platform error", "trace_id": request_id}
            )
        
        # 4. Telemetry Generation
        process_time = (time.time() - start_time) * 1000
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        # 5. Structured Log Entry
        log_entry = {
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "latency_ms": f"{process_time:.2f}",
            "ip": client_ip,
        }
        logger.info(json.dumps(log_entry))
        
        return response
