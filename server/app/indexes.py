"""Every index in one list.

Mongo needs index management, not schema migration, so this file *is* the
migration story: it is applied on startup and by `python -m app.cli migrate`.
Creating an index that already exists is a no-op, which is what makes that safe.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, IndexModel
from pymongo.errors import OperationFailure

INDEXES: dict[str, list[IndexModel]] = {
    "users": [
        IndexModel([("email", ASCENDING)], unique=True, name="email_unique"),
    ],
    "families": [
        IndexModel([("ownerId", ASCENDING)], name="by_owner"),
    ],
    "memberships": [
        IndexModel(
            [("userId", ASCENDING), ("familyId", ASCENDING)],
            unique=True,
            name="user_family_unique",
        ),
        IndexModel([("familyId", ASCENDING)], name="by_family"),
    ],
    "learners": [
        IndexModel([("familyId", ASCENDING)], name="by_family"),
    ],
    "devices": [
        # The refresh token is looked up by its hash — the token itself is never
        # stored, so a database leak cannot be replayed as a session.
        #
        # Partial, not sparse: `sparse` only skips documents where the field is
        # *missing*, so two revoked devices both holding `null` collide on a
        # unique index. Restricting the index to actual strings is what makes
        # "revoke every session" possible at all.
        IndexModel(
            [("refreshHash", ASCENDING)],
            unique=True,
            name="refresh_unique",
            partialFilterExpression={"refreshHash": {"$type": "string"}},
        ),
        IndexModel([("familyId", ASCENDING)], name="by_family"),
    ],
    "events": [
        # The whole idempotency story: a replayed batch inserts nothing twice.
        IndexModel(
            [("familyId", ASCENDING), ("eventId", ASCENDING)],
            unique=True,
            name="event_unique",
        ),
        IndexModel(
            [("familyId", ASCENDING), ("learnerId", ASCENDING), ("serverSeq", ASCENDING)],
            name="by_learner_seq",
        ),
        # Raw detail ages out; the rollup does not. 400 days keeps "a year of
        # practice still counts" true without an unbounded collection.
        IndexModel([("receivedAt", ASCENDING)], expireAfterSeconds=400 * 24 * 3600,
                   name="ttl_400d"),
    ],
    "concept_totals": [
        IndexModel(
            [("familyId", ASCENDING), ("learnerId", ASCENDING), ("conceptKey", ASCENDING)],
            unique=True,
            name="learner_concept_unique",
        ),
    ],
}


async def ensure_indexes(database: AsyncIOMotorDatabase) -> dict[str, list[str]]:
    """Apply the list, replacing any index whose options have since changed.

    Mongo refuses to redefine an existing index with different options, which
    would otherwise mean a fix like `sparse` → `partialFilterExpression` never
    reaches a database that already ran the old version.
    """
    created: dict[str, list[str]] = {}
    for collection, models in INDEXES.items():
        if not models:
            continue
        try:
            created[collection] = await database[collection].create_indexes(models)
        except OperationFailure as exc:
            # 85 IndexOptionsConflict · 86 IndexKeySpecsConflict
            if exc.code not in (85, 86):
                raise
            for model in models:
                name = model.document["name"]
                await database[collection].drop_index(name)
            created[collection] = await database[collection].create_indexes(models)
    return created
