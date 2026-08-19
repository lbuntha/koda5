"""What a router asks for: who is calling, and whether they may.

Two layers, and the second is the one that matters — see `repos/base.py`.
"""

from typing import Annotated

from fastapi import Depends, Header
from motor.motor_asyncio import AsyncIOMotorDatabase

from app import db as database
from app import rbac
from app.errors import Forbidden, Unauthorized
from app.models.auth import Principal
from app.services import tokens


def get_db() -> AsyncIOMotorDatabase:
    return database.db()


Db = Annotated[AsyncIOMotorDatabase, Depends(get_db)]


async def principal(authorization: Annotated[str | None, Header()] = None) -> Principal:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise Unauthorized()
    return tokens.read_access(authorization.split(" ", 1)[1].strip())


CurrentPrincipal = Annotated[Principal, Depends(principal)]


def require(*permissions: str):
    """Dependency: every listed permission, or 403.

    A permission comes from the caller's family role, or — for staff, and never
    for a child's record — from their platform role.
    """
    for permission in permissions:
        if permission not in rbac.PERMISSIONS:
            raise ValueError(f"Unknown permission: {permission}")

    async def _check(p: CurrentPrincipal) -> Principal:
        for permission in permissions:
            if rbac.role_can(p.role, permission):
                continue
            if rbac.platform_can(p.platform_role, permission):
                continue
            raise Forbidden(f"This account cannot {permission.replace(':', ' ')}.")
        return p

    return _check
