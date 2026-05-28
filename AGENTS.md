# AGENTS.md

Repo-specific decisions and footguns. Short and current. Prune entries when they stop being true.

## Start here

Arcademy is **ecosystem onboarding infrastructure** for new user onboarding and developer adoption (not an education platform). Before routes, migrations, staff UI, or lesson/quiz work, read **`docs/AGENT-PLATFORM.md`**. Full engineering spec: `docs/superpowers/specs/2026-05-20-ecosystem-platform-design.md`. Human-readable overview: `docs/PLATFORM-OVERVIEW.md`.

**Phase order is strict:** Phase 0 (tenancy + database isolation) before public hub UI. Do not skip.

## Stack

| Area | Choices |
| --- | --- |
| Framework | Next.js **16** (App Router), **React 19** |
| Language | TypeScript (**strict**) |
| Styling | Tailwind CSS **3** (`tailwind.config.ts`, `darkMode: "class"`, design tokens in `theme.extend`) |
| DB | PostgreSQL via **`pg`** pooled client — `lib/db.ts` |
| Auth | **better-auth** — `lib/auth.ts`, `/api/auth/[...all]` |
| Validation | **Zod 4** — prefer `lib/validation.ts` patterns |
| Media | Cloudinary HTTPS URLs with allowlist |
| Hosting | Vercel + Neon Postgres |

## Imports

Path alias **`@/*`** maps to repo root (`tsconfig` `paths`).

## Environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| Auth secrets | Per `better-auth` setup (see `lib/auth.ts`) |

Never commit `.env` or secrets. Treat **Preview, Development, and Production** as sharing one database until infra explicitly splits them — **every migration is a production change**.

## NPM scripts that matter

- `npm run dev` — default port **3000** (or next free; see `.next/dev/logs/next-development.log`)
- `npm run build` — production build
- `npm run db:migrate` — idempotent migrations (`scripts/apply-migrations.mjs`, SQL in `db/migrations/`)

## Content storage

Lessons and quizzes live in **Postgres only** at runtime. Authoring writes go through Staff Studio (Phase 2+) or seed scripts (Phase 0 bootstrap). There is no JSON-in-git or Keystatic source of truth for lesson content.

**Published content is immutable.** Edits happen on the draft curriculum; publish creates new version snapshots. Never UPDATE published `lesson_version` / `quiz_version` rows.

## Data access rules

- All server reads/writes: `resolveTenantContext()` → scoped repository. **No raw `query()` in route handlers.**
- Quiz answer keys stay server-side (`lib/quiz/public.ts` pattern).
- Cross-tenant access must return 403/404 in tests — never leak data via empty 200s.

## Bootstrap content (Phase 0)

Launch program **Arcium** (`program.slug = arcium`) is seeded via migration/script like any other program — not a separate code path. Re-running seed scripts against a database with staff edits can overwrite content; design seeds to be idempotent and safe, and document destructive flags if any.

## Other things

- First launch program slug: **`arcium`**
- Product name: **Arcademy**
- Open engineering questions live in `docs/AGENT-PLATFORM.md` — resolve before implementing those areas
