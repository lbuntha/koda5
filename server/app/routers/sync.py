"""What a device sends up, and what it can read back."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.deps import Db, require
from app.errors import Forbidden
from app.models.auth import Principal
from app.models.events import ProfileOut, PushIn, PushOut
from app.repos import events as events_repo
from app.repos import rollups
from app.services import sync as sync_service

router = APIRouter(prefix="/sync", tags=["sync"])

CanAppend = Annotated[Principal, Depends(require("learner_data:append"))]
CanRead = Annotated[Principal, Depends(require("learner_data:read"))]


def _family_of(principal: Principal) -> str:
    if principal.family_id is None:
        # Staff. They have no family to write into, and inventing one here is
        # how a support account starts owning a child's record.
        raise Forbidden("This account is not part of a family.", "no_family")
    return principal.family_id


@router.post("/push")
async def push(body: PushIn, db: Db, p: CanAppend) -> PushOut:
    _family_of(p)
    return await sync_service.push(db, p, body)


@router.get("/profile/{learner_id}")
async def profile(learner_id: str, db: Db, p: CanRead) -> ProfileOut:
    family_id = _family_of(p)

    # A learner device reads its own record and nobody else's. Tenancy, not
    # permission — which is why it is a filter rather than a check.
    if p.learner_id and learner_id != p.learner_id:
        raise Forbidden("That is not this device's learner.", "not_your_learner")

    concepts = await rollups.for_learner(db, family_id, learner_id)
    return ProfileOut(
        learnerId=learner_id,
        concepts=concepts,
        eventsStored=await events_repo.count_for_learner(db, family_id, learner_id),
    )
