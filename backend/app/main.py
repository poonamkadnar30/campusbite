from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.middleware import LoggingAndTimingMiddleware
from app.seed import seed_database
from app.background import check_idle_orders_background_task

# Import routers
from app.routers.auth import router as auth_router
from app.routers.restaurants import router as restaurants_router
from app.routers.menu import router as menu_router
from app.routers.orders import router as orders_router
from app.routers.reviews import router as reviews_router
from app.routers.returns import router as returns_router
from app.routers.delivery import router as delivery_router
from app.routers.ai import router as ai_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context: Initializes DB schema, seeds demo records, and checks idle orders."""
    # 1. Create SQL database tables if they do not exist
    Base.metadata.create_all(bind=engine)

    # 2. Seed initial demo data (users, restaurants, menu items, orders)
    db = SessionLocal()
    try:
        seed_database(db)
        check_idle_orders_background_task(db)
    finally:
        db.close()

    yield

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="CampusBite - Full-Stack Campus Restaurant Ordering & Delivery Platform REST API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    lifespan=lifespan
)

# Add custom request logging & execution timing middleware (PRD Section 8)
app.add_middleware(LoggingAndTimingMiddleware)

# Add Cross-Origin Resource Sharing (CORS) middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers under /api prefix
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(restaurants_router, prefix=settings.API_PREFIX)
app.include_router(menu_router, prefix=settings.API_PREFIX)
app.include_router(orders_router, prefix=settings.API_PREFIX)
app.include_router(reviews_router, prefix=settings.API_PREFIX)
app.include_router(returns_router, prefix=settings.API_PREFIX)
app.include_router(delivery_router, prefix=settings.API_PREFIX)
app.include_router(ai_router, prefix=settings.API_PREFIX)

@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for Docker container and monitoring."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to CampusBite REST API",
        "docs": "/docs",
        "version": settings.VERSION
    }
