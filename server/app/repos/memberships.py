from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.common import now


async def add(db: AsyncIOMotorDatabase, user_id: str, family_id: str, role: str) -> dict[str, Any]:
    doc = {"userId": user_id, "familyId": family_id, "role": role, "createdAt": now()}
    await db.memberships.insert_one(doc)
    return doc


async def for_user(db: AsyncIOMotorDatabase, user_id: str) -> list[dict[str, Any]]:
    return await db.memberships.find({"userId": user_id}).to_list(length=20)


async def role_in(db: AsyncIOMotorDatabase, user_id: str, family_id: str) -> str | None:
    doc = await db.memberships.find_one({"userId": user_id, "familyId": family_id})
    return doc["role"] if doc else None
