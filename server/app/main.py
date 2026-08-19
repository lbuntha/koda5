"""The app factory.

Routers are mounted under /v1 here and nowhere else, so the version prefix is
one string rather than a decoration on every route.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import db as database
from app import errors
from app.indexes import ensure_indexes
from app.middleware.requests import RequestContextMiddleware
from app.routers import auth, devices, health, sync
from app.settings import settings

log = logging.getLogger("koda.api")

API_PREFIX = "/v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    cfg = settings()
    if not cfg.is_dev and cfg.jwt_secret.startswith("dev-only-change-me"):
        raise RuntimeError("JWT_SECRET is still the development default — refusing to start.")

    db = database.connect()
    await ensure_indexes(db)
    log.info("connected to %s", cfg.mongodb_db)
    yield
    await database.close()


def create_app() -> FastAPI:
    cfg = settings()
    app = FastAPI(
        title="Koda API",
        version="0.1.0",
        summary="Sync, accounts and roles for Koda — see docs/BACKEND.md",
        lifespan=lifespan,
        docs_url=f"{API_PREFIX}/docs",
        openapi_url=f"{API_PREFIX}/openapi.json",
    )

    # Only needed when the app is served from another origin; same-origin
    # deployments go through the Express /v1 proxy and never preflight.
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cfg.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["Authorization", "Content-Type"],
    )

    app.add_middleware(RequestContextMiddleware)

    errors.install(app)

    for router in (health.router, auth.router, devices.router, sync.router):
        app.include_router(router, prefix=API_PREFIX)

    return app


app = create_app()
