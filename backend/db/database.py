import os
import datetime
from sqlalchemy import create_engine, Column, String, Boolean, Float, Integer, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "deploymind.db"))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DeploymentRecord(Base):
    __tablename__ = "deployments"

    id = Column(String, primary_key=True, index=True)
    service = Column(String, index=True)
    version = Column(String)
    commit_sha = Column(String)
    environment = Column(String, default="production")
    files_changed = Column(Integer, default=0)
    database_change = Column(Boolean, default=False)
    redis_change = Column(Boolean, default=False)
    infra_change = Column(Boolean, default=False)
    status = Column(String, default="PENDING")  # PENDING, APPROVED, SUCCESS, FAILED, PREVENTED
    risk_level = Column(String, default="UNKNOWN")  # LOW, MEDIUM, HIGH
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class HindsightMemory(Base):
    __tablename__ = "hindsight_memories"

    id = Column(String, primary_key=True, index=True)  # e.g., DEP-017
    service = Column(String, index=True)
    version = Column(String)
    commit_sha = Column(String)
    environment = Column(String)
    changes_summary = Column(Text)
    database_change = Column(Boolean, default=False)
    redis_change = Column(Boolean, default=False)
    infra_change = Column(Boolean, default=False)
    status = Column(String)  # SUCCESS, FAILED
    failure_type = Column(String, nullable=True)  # MIGRATION_LOCK, CONFIG_MISMATCH, MEMORY_LEAK, etc.
    symptoms = Column(Text, nullable=True)
    root_cause = Column(Text, nullable=True)
    resolution = Column(Text, nullable=True)
    lessons = Column(Text, nullable=True)
    tags = Column(String, index=True)  # comma separated e.g. "database,migration,payment"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
