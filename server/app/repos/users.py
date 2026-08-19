from datetime import datetime
from typing import Any
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.common import now


async def by_email(db: AsyncIOMotorDatabase, email: str) -> dict[str, Any] | None:
    return await db.users.find_one({"email": email.lower()})


async def by_id(db: AsyncIOMotorDatabase, user_id: str) -> dict[str, Any] | None:
    return await db.users.find_one({"_id": user_id})


async def create(
    db: AsyncIOMotorDatabase, email: str, password_hash: str, platform_role: str = "none"
) -> dict[str, Any]:
    doc = {
        "_id": f"u_{uuid4().hex[:20]}",
        "email": email.lower(),
        "passwordHash": password_hash,
        "platformRole": platform_role,
        "totpSecret": None,
        "createdAt": now(),
        "lastLoginAt": None,
    }
    await db.users.insert_one(doc)
    return doc


async def touch_login(db: AsyncIOMotorDatabase, user_id: str, at: datetime | None = None) -> None:
    await db.users.update_one({"_id": user_id}, {"$set": {"lastLoginAt": at or now()}})
