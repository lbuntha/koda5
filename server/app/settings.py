"""Configuration, read once from the environment.

Everything the service needs to run is here and nowhere else: no module reads
`os.environ` on its own, so "what does this deployment need?" has one answer.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "koda"

    # Dev default so `make dev-local` works out of the box. Production supplies
    # a real one; `main.py` refuses to start with this value outside dev.
    jwt_secret: str = "dev-only-change-me-not-a-real-secret-32b"
    jwt_algorithm: str = "HS256"
    access_ttl_minutes: int = 15
    refresh_ttl_days: int = 60

    cors_origins: list[str] = ["http://localhost:3001", "http://localhost:3002"]
    environment: str = "development"

    @property
    def is_dev(self) -> bool:
        return self.environment == "development"


@lru_cache
def settings() -> Settings:
    return Settings()
