"""The permission table — the only place a role is named.

Roles are checked nowhere else in the service: routers ask for a permission and
`deps.require()` looks it up here. That is what keeps `docs/BACKEND.md` §5 and
the running code the same thing.
"""

from typing import Literal

FamilyRole = Literal["owner", "parent", "caregiver", "learner"]
PlatformRole = Literal["none", "support", "admin"]

# Verb-on-resource. "own" restrictions — a learner reading their own record — are
# tenancy rather than permission, and are enforced by the query filter in repos.
PERMISSIONS = {
    "family:read",
    "family:update",
    "family:delete",
    "family:transfer",
    "member:invite",
    "member:list",
    "member:role",
    "member:remove",
    "learner:create",
    "learner:read",
    "learner:update",
    "learner:delete",
    "learner_data:read",
    # Two different acts, and conflating them is what made a parent's own tablet
    # unable to record a round. `append` is a device adding events for a round
    # just played; `write` is rewriting a record that already exists — which
    # nobody holds, because an adult editing what a child answered would make
    # the record fiction.
    "learner_data:append",
    "learner_data:write",
    "settings:read",
    "settings:write",
    "device:list",
    "device:revoke",
}

ROLE_PERMISSIONS: dict[str, set[str]] = {
    # Everything in the family — except writing a child's learning record, which
    # nobody but that child's own device does. An adult editing what a child
    # answered would make the record fiction.
    "owner": PERMISSIONS - {"learner_data:write"},
    "parent": PERMISSIONS
    - {"family:delete", "family:transfer", "member:role", "member:remove", "learner_data:write"},
    "caregiver": {
        "family:read",
        "member:list",
        "learner:read",
        "learner_data:read",
        "settings:read",
        "device:list",
    },
    # The child's device: reads family settings, writes only its own record —
    # which is why Plugins and Art are parent-only on a kid's tablet.
    "learner": {
        "family:read",
        "learner:read",
        "learner_data:read",
        "learner_data:append",
        "settings:read",
        "device:list",
        "device:revoke",
    },
}

PLATFORM_PERMISSIONS: dict[str, set[str]] = {
    "none": set(),
    "support": {"family:read", "member:list", "device:list"},
    "admin": {
        "family:read",
        "family:delete",
        "family:transfer",
        "member:list",
        "member:role",
        "member:remove",
        "learner:read",
        "learner:delete",
        "device:list",
        "device:revoke",
    },
}

# Staff never hold these, whatever their platform role says. Reaching a child's
# record takes a time-boxed grant (P2.5), never a role.
GRANT_ONLY = {"learner_data:read", "learner_data:append", "learner_data:write"}


def role_can(role: str, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, set())


def platform_can(platform_role: str, permission: str) -> bool:
    if permission in GRANT_ONLY:
        return False
    return permission in PLATFORM_PERMISSIONS.get(platform_role, set())
