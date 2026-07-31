from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database Configuration
    DATABASE_URL: str  # This will come from environment variable
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()