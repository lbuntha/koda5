async def test_signup_creates_family_and_returns_tokens(client, signup_body):
    r = await client.post("/auth/signup", json=signup_body())
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["role"] == "owner"
    assert body["accessToken"] and body["refreshToken"] and body["deviceId"]


async def test_email_is_taken_once(client, signup_body):
    await client.post("/auth/signup", json=signup_body())
    r = await client.post("/auth/signup", json=signup_body())
    assert r.status_code == 409
    assert r.json()["error"]["code"] == "email_taken"


async def test_login_wrong_password_says_nothing_useful(client, signup_body):
    await client.post("/auth/signup", json=signup_body())
    r = await client.post("/auth/login", json={"email": "parent@example.com", "password": "nope!!"})
    assert r.status_code == 401
    assert r.json()["error"]["message"] == "That email and password do not match."


async def test_refresh_rotates_and_kills_the_old_token(client, signup_body):
    first = (await client.post("/auth/signup", json=signup_body())).json()

    second = await client.post("/auth/refresh", json={"refreshToken": first["refreshToken"]})
    assert second.status_code == 200
    assert second.json()["refreshToken"] != first["refreshToken"]

    replay = await client.post("/auth/refresh", json={"refreshToken": first["refreshToken"]})
    assert replay.status_code == 401


async def test_me_needs_a_token(client, signup_body):
    tokens = (await client.post("/auth/signup", json=signup_body())).json()
    assert (await client.get("/auth/me")).status_code == 401

    r = await client.get("/auth/me", headers={"Authorization": f"Bearer {tokens['accessToken']}"})
    assert r.status_code == 200
    assert r.json()["familyName"] == "The Riveras"
    assert r.json()["role"] == "owner"


async def test_logout_revokes_the_device(client, signup_body):
    tokens = (await client.post("/auth/signup", json=signup_body())).json()
    auth = {"Authorization": f"Bearer {tokens['accessToken']}"}

    assert (await client.post("/auth/logout", headers=auth)).status_code == 204
    replay = await client.post("/auth/refresh", json={"refreshToken": tokens["refreshToken"]})
    assert replay.status_code == 401


async def test_two_devices_can_both_be_revoked(client, signup_body):
    """A null refreshHash used to collide on the unique index — see indexes.py."""
    first = (await client.post("/auth/signup", json=signup_body())).json()
    second = (
        await client.post("/auth/login", json={"email": "parent@example.com",
                                               "password": "correct horse battery"})
    ).json()

    for tokens in (first, second):
        r = await client.post("/auth/logout",
                              headers={"Authorization": f"Bearer {tokens['accessToken']}"})
        assert r.status_code == 204

    for tokens in (first, second):
        replay = await client.post("/auth/refresh", json={"refreshToken": tokens["refreshToken"]})
        assert replay.status_code == 401


async def test_staff_sign_in_without_a_family(client, db):
    """An admin has no membership — the platform role is what lets them in."""
    from app.repos import users
    from app.services import passwords

    await users.create(db, "admin@example.com", passwords.hash_password("123456"),
                       platform_role="admin")

    r = await client.post("/auth/login", json={"email": "admin@example.com", "password": "123456"})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["role"] == "admin"
    assert body["platformRole"] == "admin"
    assert body["familyId"] is None

    me = await client.get("/auth/me",
                          headers={"Authorization": f"Bearer {body['accessToken']}"})
    assert me.status_code == 200
    assert me.json()["familyId"] is None
    assert me.json()["platformRole"] == "admin"


async def test_staff_cannot_reach_family_routes_by_accident(client, db):
    """No family means no family-scoped query — never an unscoped one."""
    from app.repos import users
    from app.services import passwords

    await users.create(db, "support@example.com", passwords.hash_password("123456"),
                       platform_role="support")
    tokens = (
        await client.post("/auth/login",
                          json={"email": "support@example.com", "password": "123456"})
    ).json()

    r = await client.delete("/devices/d_whatever",
                            headers={"Authorization": f"Bearer {tokens['accessToken']}"})
    assert r.status_code in (403, 404)
