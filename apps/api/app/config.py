from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Pharmacy Intelligence API"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://postgres:postgres@db:5432/pharmacy_chatbot"
    llm_provider: str = "openai"
    openai_api_key: str = ""
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    gemini_api_key: str = ""
    gemini_chat_model: str = "gemini-2.0-flash"
    gemini_embedding_model: str = "gemini-embedding-001"
    embedding_dimensions: int = 1536
    retrieval_candidates: int = 20
    retrieval_top_k: int = 6
    upload_dir: str = "uploads"
    cors_origins: str = "http://localhost:3000"
    jwt_secret_key: str = "development-only-change-this-secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    admin_username: str = "admin"
    admin_email: str = "admin@example.com"
    admin_password: str = "change-this-admin-password"
    max_upload_size_mb: int = 25

    model_config = SettingsConfigDict(env_file=".env", extra="ignore", case_sensitive=False)

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
