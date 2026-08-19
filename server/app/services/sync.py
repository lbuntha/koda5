"""Taking a batch of events from a device.

Order matters and is the point: reserve the cursor, insert what is new, and roll
up **only what was actually inserted**. Rolling up everything sent would make a
retried batch inflate a child's totals — the one bug this whole design exists to
avoid.
"""

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.auth import Principal
from app.models.events import PushIn, PushOut
from app.repos import counters, rollups
from app.repos import events as events_repo
from app.services.rollup import increments_for


async def push(db: AsyncIOMotorDatabase, principal: Principal, body: PushIn) -> PushOut:
    family_id = principal.family_id
    assert family_id is not None  # the router's dependency guarantees it

    if not body.events:
        return PushOut(accepted=0, duplicates=0, cursor=await counters.current(db, family_id))

    # A learner device may only write its own record. Not a permission — the
    # permission is `learner_data:write`; this is whose data it may write.
    if principal.learner_id:
        for event in body.events:
            if event.learner_id != principal.learner_id:
                event.learner_id = principal.learner_id

    last_seq = await counters.next_seq(db, family_id, len(body.events))
    first_seq = last_seq - len(body.events) + 1

    documents = [
        events_repo.to_document(
            event,
            family_id=family_id,
            device_id=body.device_id or principal.device_id,
            server_seq=first_seq + index,
        )
        for index, event in enumerate(body.events)
    ]

    inserted, duplicates = await events_repo.insert_many(db, documents)

    inserted_ids = {doc["eventId"] for doc in inserted}
    increments = [
        increments_for(event, family_id=family_id)
        for event in body.events
        if event.id in inserted_ids
    ]
    await rollups.apply(db, [i for i in increments if i])

    return PushOut(accepted=len(inserted), duplicates=duplicates, cursor=last_seq)
