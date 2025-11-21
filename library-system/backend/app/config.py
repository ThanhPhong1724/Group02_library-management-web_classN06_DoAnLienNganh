from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App Configuration
    app_name: str = "Library Management System"
    debug: bool = True

    # Database Configuration
    mysql_user: str = "root"
    mysql_password: str = ""
    mysql_host: str = "127.0.0.1"
    mysql_port: int = 3306
    mysql_db: str = "librarydb"

    # JWT Configuration
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expires_minutes: int = 60

    # File Upload Configuration
    upload_dir: str = "uploads"
    max_file_size: int = 5242880  # 5MB

    # Chatbot Configuration - Flexible AI Provider
    # Set to 'ollama' or 'gemini' to choose AI provider
    chatbot_provider: str = "none"
    
    # Ollama Configuration (when chatbot_provider=ollama)
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "vi-dominic/vinallama:7b"
    ollama_use_nlu: bool = True
    ollama_use_nlg: bool = True
    
    # Gemini API Configuration (when chatbot_provider=gemini)
    gemini_api_key: str = "AIzaSyCzHKXYMb5eZL2w6hO4QDJ8B6CEJYdsawM"
    gemini_model: str = "gemini-2.0-flash"
    gemini_use_nlu: bool = True
    gemini_use_nlg: bool = True

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()  # type: ignore


