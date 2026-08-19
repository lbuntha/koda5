from typing import Any
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.common import now


async def create(db: AsyncIOMotorDatabase, name: str, owner_id: str) -> dict[str, Any]:
    doc = {"_id": f"f_{uuid4().hex[:20]}", "name": name, "ownerId": owner_id, "createdAt": now()}
    await db.families.insert_one(doc)
    return doc


async def by_id(db: AsyncIOMotorDatabase, family_id: str) -> dict[str, Any] | None:
    return await db.families.find_one({"_id": family_id})
