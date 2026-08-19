"""The §5 matrix, asserted cell by cell.

If a permission moves, this file is what says so out loud.
"""

import pytest

from app.rbac import platform_can, role_can

MATRIX = {
    "family:read": {"owner", "parent", "caregiver", "learner"},
    "family:update": {"owner", "parent"},
    "family:delete": {"owner"},
    "family:transfer": {"owner"},
    "member:invite": {"owner", "parent"},
    "member:list": {"owner", "parent", "caregiver"},
    "member:role": {"owner"},
    "member:remove": {"owner"},
    "learner:create": {"owner", "parent"},
    "learner:delete": {"owner", "parent"},
    "learner_data:read": {"owner", "parent", "caregiver", "learner"},
    # Appending is what a device does after a round; rewriting is nobody's.
    "learner_data:append": {"owner", "parent", "learner"},
    "learner_data:write": set(),
    "settings:read": {"owner", "parent", "caregiver", "learner"},
    "settings:write": {"owner", "parent"},
    "device:list": {"owner", "parent", "caregiver", "learner"},
    "device:revoke": {"owner", "parent", "learner"},
}


@pytest.mark.parametrize("permission,allowed", MATRIX.items())
def test_family_roles(permission, allowed):
    for role in ("owner", "parent", "caregiver", "learner"):
        assert role_can(role, permission) is (role in allowed), f"{role} / {permission}"


def test_a_learner_cannot_change_family_settings():
    assert not role_can("learner", "settings:write")


def test_a_caregiver_changes_nothing():
    for permission in MATRIX:
        if permission.endswith(
            (":write", ":append", ":update", ":delete", ":create", ":role", ":remove")
        ):
            assert not role_can("caregiver", permission)


def test_nobody_rewrites_a_childs_record():
    for role in ("owner", "parent", "caregiver", "learner"):
        assert not role_can(role, "learner_data:write")


def test_staff_never_read_a_childs_record_by_role_alone():
    for staff in ("support", "admin"):
        assert not platform_can(staff, "learner_data:read")
        assert not platform_can(staff, "learner_data:append")
        assert not platform_can(staff, "learner_data:write")


def test_support_is_read_only():
    assert platform_can("support", "family:read")
    assert not platform_can("support", "device:revoke")
    assert not platform_can("none", "family:read")
