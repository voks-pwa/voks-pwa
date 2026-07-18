# Admin User Detail Data Audit

Status

Hotfix

---

Goal

Determine why User Detail always returns:

User not found

even though the user exists.

---

Audit Flow

STEP 1

Inspect Admin User List.

Log:

user.id

user.user_id

user.auth_user_id

user.email

Determine which field is used when navigating.

---

STEP 2

Inspect navigation.

Print:

navigate("/admin/users/" + ???)

Verify which identifier is passed.

---

STEP 3

Inspect UserDetailPage.

Print:

params.id

---

STEP 4

Before Supabase query.

Print:

Searching profile:

params.id

---

STEP 5

Print query result.

rows returned

If zero rows:

determine why.

---

STEP 6

Verify the UUID matches:

profiles.id

NOT

auth.users.id

NOT

user_id

NOT

email

---

STEP 7

If Admin List comes from a View,

verify the View exposes the canonical profile UUID.

---

Verification

Opening a user from Admin List must query exactly one profile row.

Update AI/17_CHANGELOG.md