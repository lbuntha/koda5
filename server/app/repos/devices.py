"""Devices, and the refresh tokens attached to them.

The token itself is never stored — only its SHA-256 — so a leaked database
cannot be replayed as a session. Rotation replaces the hash in place, which is
also how "sign out that tablet" works: clear the hash and the token is dead.
"""

from typing import Any
from uuid import uuid4

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.common import now


async def register(
    db: AsyncIOMotorDatabase,
    family_id: str,
    name: str,
    kind: str,
    refresh_hash: str,
    user_id: str | None = None,
    learner_id: str | None = None,
) -> dict[str, Any]:
    doc = {
        "_id": f"d_{uuid4().hex[:20]}",
        "familyId": family_id,
        "name": name,
        "kind": kind,
        "userId": user_id,
        "learnerId": learner_id,
        "refreshHash": refresh_hash,
        "createdAt": now(),
        "lastSeenAt": now(),
        "revokedAt": None,
    }
    await db.devices.insert_one(doc)
    return doc


async def by_refresh_hash(db: AsyncIOMotorDatabase, refresh_hash: str) -> dict[str, Any] | None:
    return await db.devices.find_one({"refreshHash": refresh_hash, "revokedAt": None})


async def rotate(db: AsyncIOMotorDatabase, device_id: str, refresh_hash: str) -> None:
    await db.devices.update_one(
        {"_id": device_id},
        {"$set": {"refreshHash": refresh_hash, "lastSeenAt": now()}},
    )


async def revoke(db: AsyncIOMotorDatabase, device_id: str) -> None:
    # `$unset` rather than a null: the unique index is partial on strings, and
    # an absent field is the honest way to say "this session no longer exists".
    await db.devices.update_one(
        {"_id": device_id}, {"$set": {"revokedAt": now()}, "$unset": {"refreshHash": ""}}
    )


async def revoke_all_for_user(db: AsyncIOMotorDatabase, user_id: str) -> int:
    """End every session an account holds — what a password change must do."""
    result = await db.devices.update_many(
        {"userId": user_id, "revokedAt": None}, {"$unset": {"refreshHash": ""}}
    )
    return result.modified_count


async def for_family(db: AsyncIOMotorDatabase, family_id: str) -> list[dict[str, Any]]:
    cursor = db.devices.find({"familyId": family_id}, {"refreshHash": 0})
    return await cursor.to_list(length=100)
