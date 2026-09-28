import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import settings
from backend.db.database import init_db, SessionLocal
from backend.memory.hindsight_store import HindsightStore
from backend.data.seed_deployments import SEED_HINDSIGHT_MEMORIES
from backend.routers import deployments, memory, demo, webhooks

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("deploymind")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing DeployMind database...")
    init_db()
    
    # Pre-seed database if empty
    db = SessionLocal()
    try:
        store = HindsightStore(db)
        if store.get_stats()["total_memories"] == 0:
            logger.info("Seeding initial deployment memories...")
            for seed_item in SEED_HINDSIGHT_MEMORIES:
                store.retain(seed_item)
    finally:
        db.close()
        
    yield
    logger.info("DeployMind shutdown.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="DeployMind — Self-Learning DevOps Pipeline Agent powered by Hindsight Persistent Organizational Memory",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(deployments.router, prefix=settings.API_V1_STR)
app.include_router(memory.router, prefix=settings.API_V1_STR)
app.include_router(demo.router, prefix=settings.API_V1_STR)
app.include_router(webhooks.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "agent": "DeployMind Self-Learning DevOps Pipeline Agent",
        "version": settings.VERSION,
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
