"""Signing in: parents by password, devices by refresh token.

A child never appears here — they arrive with a join code (P2), which mints the
same device row this module does.
"""

from fastapi import APIRouter, status

from app.deps import CurrentPrincipal, Db
from app.errors import Conflict, Unauthorized
from app.models.auth import LoginIn, MeOut, Principal, RefreshIn, SignupIn, TokenPair
from app.repos import devices, families, memberships, users
from app.services import passwords, tokens

router = APIRouter(prefix="/auth", tags=["auth"])


async def _issue(db, family_id: str | None, role: str, *, user_id=None, learner_id=None,
                 device_name="This device", device_id=None, platform_role="none") -> TokenPair:
    refresh, refresh_hash = tokens.new_refresh_token()

    if device_id is None:
        device = await devices.register(
            db,
            family_id=family_id,
            name=device_name,
            kind="user" if user_id else "learner",
            refresh_hash=refresh_hash,
            user_id=user_id,
            learner_id=learner_id,
        )
        device_id = device["_id"]
    else:
        await devices.rotate(db, device_id, refresh_hash)

    principal = Principal(
        subject_id=user_id or device_id,
        kind="user" if user_id else "device",
        family_id=family_id,
        role=role,
        learner_id=learner_id,
        device_id=device_id,
        platform_role=platform_role,
    )
    access, expires_in = tokens.issue_access(principal)
    return TokenPair(
        accessToken=access,
        refreshToken=refresh,
        expiresIn=expires_in,
        deviceId=device_id,
        familyId=family_id,
        role=role,
        platformRole=platform_role,
    )


@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(body: SignupIn, db: Db) -> TokenPair:
    if await users.by_email(db, body.email):
        raise Conflict("That email already has an account. Sign in instead.", "email_taken")

    user = await users.create(db, body.email, passwords.hash_password(body.password))
    family = await families.create(db, body.family_name, owner_id=user["_id"])
    await memberships.add(db, user["_id"], family["_id"], role="owner")

    return await _issue(db, family["_id"], "owner", user_id=user["_id"],
                        device_name=body.device_name)


@router.post("/login")
async def login(body: LoginIn, db: Db) -> TokenPair:
    user = await users.by_email(db, body.email)
    # Same message either way: which half was wrong is not the caller's business.
    if not user or not passwords.verify_password(user["passwordHash"], body.password):
        raise Unauthorized("That email and password do not match.", "bad_credentials")

    await users.touch_login(db, user["_id"])
    rows = await memberships.for_user(db, user["_id"])
    platform_role = user.get("platformRole", "none")

    if rows:
        # A member of a family: the membership row decides what they can do.
        membership = rows[0]
        return await _issue(db, membership["familyId"], membership["role"],
                            user_id=user["_id"], device_name=body.device_name,
                            platform_role=platform_role)

    if platform_role != "none":
        # Staff. No family, so the role *is* the platform role — they see across
        # families through the admin routes rather than into one through the
        # family routes.
        return await _issue(db, None, platform_role, user_id=user["_id"],
                            device_name=body.device_name, platform_role=platform_role)

    raise Unauthorized("That account is not part of a family yet.", "no_family")


@router.post("/refresh")
async def refresh(body: RefreshIn, db: Db) -> TokenPair:
    device = await devices.by_refresh_hash(db, tokens.hash_refresh(body.refresh_token))
    if not device:
        raise Unauthorized("Please sign in again.", "refresh_invalid")

    role = "learner"
    platform_role = "none"
    if device.get("userId"):
        user = await users.by_id(db, device["userId"])
        platform_role = (user or {}).get("platformRole", "none")
        if device.get("familyId"):
            role = await memberships.role_in(db, device["userId"], device["familyId"]) or "parent"
        else:
            role = platform_role

    # Rotation: the presented token dies as the new one is written.
    return await _issue(db, device.get("familyId"), role, user_id=device.get("userId"),
                        learner_id=device.get("learnerId"), device_id=device["_id"],
                        platform_role=platform_role)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(p: CurrentPrincipal, db: Db) -> None:
    if p.device_id:
        await devices.revoke(db, p.device_id)


@router.get("/me")
async def me(p: CurrentPrincipal, db: Db) -> MeOut:
    family = await families.by_id(db, p.family_id) if p.family_id else None
    user = await users.by_id(db, p.subject_id) if p.kind == "user" else None
    return MeOut(
        userId=user["_id"] if user else None,
        email=user["email"] if user else None,
        familyId=p.family_id,
        familyName=family["name"] if family else None,
        role=p.role,
        platformRole=p.platform_role,
        learnerId=p.learner_id,
    )
