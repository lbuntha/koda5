"""The auth wire format, and the principal every route is handed."""

from pydantic import EmailStr, Field

from app.models.common import Model


class SignupIn(Model):
    email: EmailStr
    # No length rule while this is a prototype — the accounts are dev accounts
    # and a refused `123456` is friction with nothing behind it. Restore a
    # minimum here (and in AccountForm) before real families sign up; the hash
    # and the lockout are what actually protect an account, and both stay.
    password: str = Field(min_length=1, max_length=200)
    family_name: str = Field(default="My family", max_length=60, alias="familyName")
    device_name: str = Field(default="This device", max_length=60, alias="deviceName")


class LoginIn(Model):
    email: EmailStr
    password: str
    device_name: str = Field(default="This device", max_length=60, alias="deviceName")


class RefreshIn(Model):
    refresh_token: str = Field(alias="refreshToken")


class TokenPair(Model):
    access_token: str = Field(alias="accessToken")
    refresh_token: str = Field(alias="refreshToken")
    expires_in: int = Field(alias="expiresIn")
    device_id: str = Field(alias="deviceId")
    family_id: str | None = Field(default=None, alias="familyId")
    role: str
    platform_role: str = Field(default="none", alias="platformRole")


class MeOut(Model):
    user_id: str | None = Field(default=None, alias="userId")
    email: str | None = None
    # Staff belong to no family, so both are absent for them.
    family_id: str | None = Field(default=None, alias="familyId")
    family_name: str | None = Field(default=None, alias="familyName")
    role: str
    platform_role: str = Field(default="none", alias="platformRole")
    learner_id: str | None = Field(default=None, alias="learnerId")


class Principal(Model):
    """Who is calling. Built from the token, never from the request body."""

    subject_id: str
    kind: str  # "user" | "device"
    # Absent for staff: an admin is not a member of anyone's family, so there is
    # no family to scope their queries to. Family routes refuse them; admin
    # routes read across families on purpose.
    family_id: str | None = None
    role: str
    learner_id: str | None = None
    platform_role: str = "none"
    device_id: str | None = None
