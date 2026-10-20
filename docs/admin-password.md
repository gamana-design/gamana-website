# Changing the admin password

1. Sign in to the admin page.
2. Choose **Change password** at the top.
3. Enter your current password.
4. Enter a new password with **12 or more characters**, then type it again.
5. Press **Save new password**. You will be signed out. Sign in with the new password.

A short sentence that is easy for you to remember can make a good password. Keep it somewhere private and safe. Do not send your password in email, chat or a support request. If you forget it, ask your site administrator for help; there is no email reset link.

The website stores a protected password hash, not the password itself. Changing it signs out all older admin sessions. It does not change product information, payments or Qikink settings. For safety, change the password only on the live admin site; temporary preview pages cannot change it.

## Setup note for the maintainer

- Production migration `add_admin_password_storage` was applied on 20 October 2026. It created an empty password table with no access for browser roles. No password was changed.
- For a new installation, apply `src/lib/admin-password-schema.sql` before deploying this feature. It creates one password record with access restricted to the server-side service role. The existing `ADMIN_PASSWORD` setting remains the sign-in password until the owner changes it through this page; the changed password is stored only as a salted PBKDF2 hash in the database. Never set the owner's password in source code or print it in logs.
