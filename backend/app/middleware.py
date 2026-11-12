import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Configure logger
logger = logging.getLogger("campusbite.middleware")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

class LoggingAndTimingMiddleware(BaseHTTPMiddleware):
    """
    FastAPI Middleware (PRD Section 8):
    1. Logs incoming request HTTP method and API route path.
    2. Measures API response time in milliseconds.
    3. Injects 'X-Process-Time' header in the HTTP response.
    """
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        method = request.method
        path = request.url.path

        logger.info(f"Incoming Request: {method} {path}")

        try:
            response = await call_next(request)
            process_time = (time.time() - start_time) * 1000
            response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
            logger.info(f"Completed Request: {method} {path} - Status: {response.status_code} in {process_time:.2f}ms")
            return response
        except Exception as exc:
            process_time = (time.time() - start_time) * 1000
            logger.error(f"Failed Request: {method} {path} - Error: {str(exc)} after {process_time:.2f}ms")
            raise exc
