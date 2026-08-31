from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    app_name: str = "FinPilot AI"
    app_env: str = "development"
    debug: bool = False

    database_url: str

    api_prefix: str = "/api/v1"

    openai_api_key: str
    openai_chat_model: str = "gpt-4o-mini"
    openai_embedding_model: str = "text-embedding-3-small"

    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 12

    rag_top_k: int = 5
    rag_chunk_size: int = 1000
    rag_chunk_overlap: int = 150

    @property
    def sqlalchemy_database_url(self) -> str:
        url = self.database_url

        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)

        if url.startswith("postgresql://"):
            url = url.replace(
                "postgresql://",
                "postgresql+psycopg://",
                1,
            )

        return url

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()