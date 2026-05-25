# Paper Portfolio Ink Usage Guide

This guide explains how to use the project locally, how the public site behaves, and how to operate the admin dashboard safely.

<p>
  <img alt="Setup" src="https://img.shields.io/badge/Guide-Setup-0F172A">
  <img alt="Public" src="https://img.shields.io/badge/Surface-Public-0369A1">
  <img alt="Authentication" src="https://img.shields.io/badge/Security-Authentication-9A3412">
  <img alt="Dashboard" src="https://img.shields.io/badge/Surface-Dashboard-5B21B6">
  <img alt="Verification" src="https://img.shields.io/badge/Flow-Verification-166534">
</p>

![Usage Guide Map](./assets/usage-guide-map.svg)

## 1. Local Setup Workflow

| Step      | Command                     | Purpose                                       |
| --------- | --------------------------- | --------------------------------------------- |
| Install   | `npm install`               | Installs application and tooling dependencies |
| Configure | `cp .env.example .env`      | Creates the local auth configuration source   |
| Migrate   | `npm run db:migrate:local`  | Applies local D1 schema migrations            |
| Seed      | `npm run db:seed:test-user` | Creates a local admin account                 |
| Run       | `npm run dev`               | Starts the localized app in development mode  |

### Install and configure

```bash
npm install
cp .env.example .env
```

Set these values in `.env`:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

For standard local development, use:

- `BETTER_AUTH_URL=http://localhost:5173`

### Apply the local database

```bash
npm run db:migrate:local
```

This applies every migration in [db/migrations](../db/migrations).

### Seed a local admin user

```bash
npm run db:seed:test-user
```

Default local-only credentials:

- Email: `admin@paper-portfolio-ink.local`
- Password: `fixture-local-only-password-admin`

### Start the app

```bash
npm run dev
```

Open `http://localhost:5173`.

## 2. Public Site Guide

All public routes are localized and live under `/:locale/*`. The default locale redirect is handled automatically.

| Area       | Route group                         | Notes                                          |
| ---------- | ----------------------------------- | ---------------------------------------------- |
| Home       | `/:locale`                          | Portfolio landing page with featured content   |
| Blog       | `/:locale/blog*`                    | Feed and post detail routes                    |
| Projects   | `/:locale/projects*`                | Public project listing and progressive loading |
| UI actions | `/:locale/locale`, `/:locale/theme` | Locale and theme persistence                   |

### Home page

Route:

- `/:locale`

What it provides:

- Hero and portfolio introduction
- Featured projects
- Skill section sourced from the database
- Links into the public blog and projects surfaces

Behavior notes:

- If there are no skills in the database, the skill section is hidden.
- Theme preference is persisted server-side.

### Blog

Routes:

- `/:locale/blog`
- `/:locale/blog/feed`
- `/:locale/blog/:slug`

What it provides:

- Paginated or incremental post listing
- SEO-aware post detail pages
- Safe rich-content rendering

Behavior notes:

- Public blog content is rendered from structured document content, not raw HTML.
- External links and image sources are sanitized before rendering.

### Projects

Routes:

- `/:locale/projects`
- `/:locale/projects/feed`

What it provides:

- Public project listing
- Progressive loading for larger lists

Behavior notes:

- Only public-facing project data is exposed.
- Admin-only metadata stays inside dashboard-only slices.

### Locale and theme controls

Routes:

- `/:locale/locale`
- `/:locale/theme`

What they provide:

- Locale switching
- Theme switching

Behavior notes:

- Locale changes keep users inside the localized route system.
- Theme changes are persisted without requiring client-only state.

## 3. Authentication Guide

### Login

Route:

- `/:locale/login`

Expected flow:

1. Open the localized login page.
2. Submit email and password.
3. If the user is authorized for dashboard access, the session is created and the user is redirected to the requested dashboard route.

Important security behavior:

- Login attempts are rate-limited through D1-backed email and IP buckets.
- Invalid credentials, inactive users, and repeated failures are tracked.
- Successful login clears matching throttle state for that identity.

### Logout

Route:

- `/:locale/logout`

Behavior notes:

- Logout is handled server-side.
- Session cookies are cleared as part of the route action.

## 4. Dashboard Guide

The dashboard is mounted under `/:locale/dashboard` and protected by session and claim checks.

| Section   | Route                            | Main capability                             |
| --------- | -------------------------------- | ------------------------------------------- |
| Overview  | `/:locale/dashboard`             | Entry shell and permission-aware navigation |
| Posts     | `/:locale/dashboard/posts`       | Post CRUD with owner or any-scope authz     |
| Projects  | `/:locale/dashboard/projects`    | Project CRUD with read-write claim split    |
| Skills    | `/:locale/dashboard/skills`      | Lightweight registry management             |
| Users     | `/:locale/dashboard/users`       | User management with admin safeguards       |
| Resources | `/:locale/dashboard/resources/*` | Locale and translation administration       |
| Logging   | `/:locale/dashboard/logging*`    | Audit and error operations                  |

### Dashboard overview

Route:

- `/:locale/dashboard`

What it provides:

- The main shell for authenticated users
- Navigation into all allowed dashboard sections

Behavior notes:

- Navigation visibility is permission-aware.
- A user may be authenticated but still not see every registry or maintenance tool.

### Posts management

Route:

- `/:locale/dashboard/posts`

What it provides:

- Post listing
- Create, update, and delete flows
- Rich-text editing

Behavior notes:

- Authorization follows owner or any-scope rules depending on claim set.
- Unsupported mutation intents are rejected before action dispatch.

### Projects management

Route:

- `/:locale/dashboard/projects`

What it provides:

- Project listing
- Create, update, and delete flows

Behavior notes:

- Reads and writes are split into separate claims.
- Duplicate or conflicting writes are surfaced through typed form-state errors.

### Skills management

Route:

- `/:locale/dashboard/skills`

What it provides:

- Lightweight registry management for skill records

Behavior notes:

- Icons are selected through a controlled key registry.
- Sorting is stored in the database.

### Users management

Route:

- `/:locale/dashboard/users`

What it provides:

- User listing
- Create, update, and delete flows
- Role-aware safeguards

Behavior notes:

- The app protects against removing the last active admin.
- Reads and writes are guarded separately.

### Resources management

Routes:

- `/:locale/dashboard/resources`
- `/:locale/dashboard/resources/locales`
- `/:locale/dashboard/resources/translations`

What it provides:

- Locale registry CRUD
- Translation registry CRUD
- Permission-aware redirects between the two subsections

Behavior notes:

- Locale and translation access are authorized independently.
- A user with access to only one subsection is redirected away from unreadable sections.
- Locale changes invalidate the related cached i18n payloads.

### Logging

Routes:

- `/:locale/dashboard/logging`
- `/:locale/dashboard/logging/export`

What it provides:

- Audit log and error log views
- Keyset pagination
- Range export
- Range delete

Behavior notes:

- Export and delete actions require the matching read permission in addition to the action permission.
- Audit and error tabs are permission-aware independently.
- Export output is intended for spreadsheet-compatible workflows.

## 5. Authorization Model

The project uses claim-based authorization backed by D1.

Key principles:

- The database is the source of truth for role claims and user overrides.
- Session authz versioning exists, but role and override changes also drive a global authorization revision.
- Cross-request authorization caching is safe because cache keys include `authorization_state.revision`.

Operational impact:

- Revoking a role claim or user override invalidates future cached claim sets.
- Sensitive routes do not trust UI visibility alone; server loaders and actions enforce policy again.

## 6. Testing Workflow

### Unit and integration tests

```bash
npm test
```

### Type, lint, and formatting checks

```bash
npm run typecheck
npm run lint
npm run format:check
```

### End-to-end tests

```bash
npm run e2e:prepare
npm run e2e
```

Notes:

- `e2e:prepare` applies local migrations and seeds deterministic browser fixtures.
- The seed process also resets stateful security tables such as login rate limits.

## 7. Recommended Local Operator Flows

### When you only need the public site

1. Run migrations.
2. Start `npm run dev`.
3. Visit localized public routes such as `/tr`, `/tr/blog`, or `/tr/projects`.

### When you need dashboard access

1. Run migrations.
2. Seed the local admin user.
3. Start `npm run dev`.
4. Sign in at `/tr/login`.
5. Open `/tr/dashboard`.

### When you need realistic browser verification

1. Run `npm run e2e:prepare`.
2. Run `npm run e2e`.
3. Review Playwright failures in `test-results/` if any scenario fails.

## 8. Related Documentation

- [README](../README.md)
- [README Overview Visual](./assets/readme-hero.svg)
- [Engineering Standards](./engineering-standards.md)
- [Agent Workflow](./agent-workflow.md)
- [Roadmap](./roadmap.md)
- [Lessons Learned](./lessons.md)
