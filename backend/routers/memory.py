from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.db.database import get_db, HindsightMemory
from backend.memory.hindsight_store import HindsightStore
from backend.data.seed_deployments import SEED_HINDSIGHT_MEMORIES

router = APIRouter(prefix="/memory", tags=["memory"])

@router.get("/")
def get_memories(
    service: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    store = HindsightStore(db)
    return store.get_all_memories(service=service, status=status)

@router.get("/stats")
def get_memory_stats(db: Session = Depends(get_db)):
    store = HindsightStore(db)
    return store.get_stats()

@router.post("/seed")
def seed_memories(db: Session = Depends(get_db)):
    store = HindsightStore(db)
    count = 0
    for mem_data in SEED_HINDSIGHT_MEMORIES:
        store.retain(mem_data)
        count += 1
    return {"message": f"Successfully seeded {count} deployment memories into Hindsight store.", "total": store.get_stats()["total_memories"]}

@router.delete("/clear")
def clear_memories(db: Session = Depends(get_db)):
    db.query(HindsightMemory).delete()
    db.commit()
    return {"message": "Hindsight memory store cleared cleanly.", "total_memories": 0}
