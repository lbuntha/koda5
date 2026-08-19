"""The tablets and phones signed into a family."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.deps import Db, require
from app.errors import NotFound
from app.models.auth import Principal
from app.repos import devices
from app.repos.base import scoped

router = APIRouter(prefix="/devices", tags=["devices"])

CanList = Annotated[Principal, Depends(require("device:list"))]
CanRevoke = Annotated[Principal, Depends(require("device:revoke"))]


@router.get("")
async def list_devices(db: Db, p: CanList) -> dict:
    rows = await devices.for_family(db, p.family_id)
    if p.role == "learner":
        rows = [r for r in rows if r["_id"] == p.device_id]
    return {
        "devices": [
            {
                "id": r["_id"],
                "name": r["name"],
                "kind": r["kind"],
                "lastSeenAt": r.get("lastSeenAt"),
                "revokedAt": r.get("revokedAt"),
                "current": r["_id"] == p.device_id,
            }
            for r in rows
        ]
    }


@router.delete("/{device_id}", status_code=204)
async def revoke_device(device_id: str, db: Db, p: CanRevoke) -> None:
    # Tenancy, not permission: the id is looked up inside this family's rows, so
    # an id borrowed from another family is simply not there.
    found = await db.devices.find_one(scoped(p, {"_id": device_id}))
    if not found or (p.role == "learner" and device_id != p.device_id):
        raise NotFound("No such device on this account.")
    await devices.revoke(db, device_id)
