import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "DeployMind"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # LLM Settings
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.3-70b-versatile")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./deploymind.db")
    
    # Risk threshold
    HIGH_RISK_THRESHOLD: float = 0.70
    MEDIUM_RISK_THRESHOLD: float = 0.40

    class Config:
        case_sensitive = True

settings = Settings()
