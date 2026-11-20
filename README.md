# Vinder — lab-only dating website + SQLite demo

This is a fictional university cybersecurity project, **not a public dating service**. It keeps the original HTML homepage, login and registration designs, alongside the original React Discover Dashboard. A small Node.js API stores accounts, profile edits/photos, likes, passes, and demo messages in a local SQLite database. **Discover now displays registered, published fictional test accounts**, not the old Ethan/Maya/Noah seed records. New accounts are private by default.

## Requirements

- **Node.js 22.13+** (tested on Node 22.16); Node's built-in `node:sqlite` is used to avoid additional server dependencies. It may display an ExperimentalWarning on Node 22.
- npm and the project frontend dependencies.
- Only fictional identities/photos and unique test passwords. Do not put real customer data on this educational server.

## Run locally (Windows PowerShell / VS Code)

```powershell
npm ci
npm run dev:all
```

Open **http://127.0.0.1:5173**. It shows the **homepage first**. Choose **Create account**. Enter a *fictional* name, a *test-only email*, a unique demo password (12+ characters) and a fictional birth date between 1981 and 1996. Once registered, the browser moves to **/dashboard.html**. Log out to return to the homepage. Log in again to recover your profile, likes, and messages.

`npm run dev:all` starts Vite on localhost:5173 and the backend on localhost:3001. If you prefer two terminal windows, run `npm run server` in the first and `npm run dev` in the second. **Do not use the VS Code Live Server extension or open HTML files via `file://`**: these won't provide the `/api` endpoints.

## Where is the database?

`server/data/vinder.sqlite` is created automatically on first run. `npm run db:check` prints total registered fictional accounts and which are published, without exposing credentials.

- `users`: test account login and a JSON profile (fictional name, city, photos, interests, and `listed` flag), plus demo likes/messages.
- `sessions`: expiring sessions, stored as token hashes; HttpOnly session cookies are used.
- On an upgraded existing SQLite file, the old `member_profiles` fixture table may still exist, **but it is no longer read by Discover**. No existing account data is deleted or migrated away.

### Add fictional members yourself (not Ethan/Maya)

1. Launch with `npm ci` then `npm run dev:all`, and open `http://127.0.0.1:5173`.
2. **Create Account** with a unique fictional email such as `sam01@vinder.test`, a unique test password of 12+ characters, and a fictional birth date in 1981–1996.
3. Open **My Profile**. Set name, city, job, bio, interests, relationship goal. Upload at least one **fictional or authorised demo image** (up to six).
4. Tick **Show this fictional profile in Discover** and select **Save profile changes**. Publishing requires city, bio and a photo.
5. Log out and register a second separate fictional account. It will see the first account's profile in **Discover**. The first account never sees its own card.
6. Repeat for as many imaginary members as you need. To hide a profile, untick the visibility checkbox in that account and save.

The public `/api/profiles` response is available **only to signed-in demo users** and excludes account email, password hashes, and session tokens. Only deliberately published profile fields are returned. Account messages are personal demo notes; they do **not** reach other people's inboxes. "Verification" is intentionally false, since the site does no real identity verification; disable the demo verified-only filter to see these accounts. Distances are illustrative fictional values, not GPS or inferred from a location.

**The database and SQLite journal files are excluded from Git.** Do not commit or upload genuine personal data. Keep copies of your test data if you want to transfer registered profiles to Netlab; cloning the repository alone will create a new empty database.

## Filters

Once other accounts have published their profiles, Discover has working filters for age, city, fictional distance, interests, relationship goal, and verification flag. Since test profiles are not identity-verified, the verified-only checkbox intentionally finds none. Search also covers name, occupation, city, and interests. Sort by compatibility, distance or age. Filters apply against member profiles retrieved from the database. Distances and scores are fictional fixed examples, not real GPS matching.

## Production build and Netlab DMZ

```powershell
npm run build
npm test
```

The `dist/` output contains **four pages**: `index.html` (Homepage), `login.html`, `create.html` and `dashboard.html` (React member dashboard). **Nginx serving `dist/` by itself is NOT enough** for accounts: the local Node API must also run and its private database must be stored outside the public web root. See `deploy/vinder-nginx.conf.example` for the `/api/` reverse proxy.

1. Install Node.js 22+ and Nginx on the authorised DMZ Ubuntu VM.
2. Copy or build the site in the DMZ. Run `npm ci` and `npm run build` as your ordinary deployment user, not root.
3. Copy only `dist/` to `/var/www/vinder/`; run the API separately using `npm run server`, under a dedicated non-root service user, bound to **127.0.0.1:3001**. Keep `server/data` private. The sample systemd file is a starting template.
4. Configure Nginx to serve `/var/www/vinder/` and proxy `/api/` to `127.0.0.1:3001`.
5. Restrict inbound firewall access to approved Netlab tester clients; deny DMZ -> sensitive networks. **Use a trusted lab HTTPS hostname before sharing login credentials with other clients**, and configure `COOKIE_SECURE=1` on HTTPS.
6. Confirm website homepage, account creation, login, dashboard filters, photo edits, logout, and second-login persistence. Monitor Nginx/API logs with your team's Wazuh plan.

**Do not publish this lab prototype on the Internet.** No password recovery, email verification, trusted ID verification, real messaging, or account moderation exists. Security measures here are starter controls for an isolated demonstration, not a production security audit.

## Sharing with teammates

Commit source code (`src/`, the original HTML/CSS, `server/app.mjs`, `auth.js`, `package*.json`, `deploy/`) but **not** `node_modules/`, `dist/`, or `server/data/`. Create a feature branch and open a GitHub PR into `main` after checking conflicts with the Homepage/Dashboard branches.

## Homepage refresh and local registration fix (November 2026)

- The landing page now has a larger **Find your match.** hero and a vertically scrolling **How It Works** guide with three detailed steps and direct links. Header/hero links scroll smoothly to `#how-it-works`.
- The demo is marketed to **millennials (born 1981–1996)**. Signup enforces that birth-year range **server-side**, not just in the dropdown. All fictional seed profiles are in their 30s/40s. The profile editor limits demo ages to 29–45 for this November 2026 cohort.
- `Cross-origin request blocked` on local sign-up was caused by Vite proxying browser origin port `5173` into backend port `3001`. The API now accepts only explicit localhost Vite development origins while preserving origin checks for real deployments. **Run `npm run dev:all`** and open the `5173` URL; do not use Live Server or file://.
- Existing test accounts are preserved and private until you publish their profiles. Old static seed records are ignored by Discover.
