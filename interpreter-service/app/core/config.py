from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application
    app_name: str = "OptiLang Interpreter Service"
    version: str = "1.0.0"
    debug: bool = True
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    
    # MongoDB Atlas
    mongodb_uri: str = "mongodb+srv://username:password@cluster.mongodb.net/optilang?retryWrites=true&w=majority"
    database_name: str = "optilang"
    
    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
    ]
    
    # Code Execution Limits
    max_execution_time: int = 5  # seconds
    max_code_length: int = 10000  # characters
    max_memory_mb: int = 128  # megabytes
    
    # Rate Limiting
    rate_limit_per_minute: int = 30
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
