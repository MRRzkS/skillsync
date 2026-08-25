# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**TalentPulse** — the HR half of a two-sided recruitment platform built for a Maxy Academy hackathon ("TalentPulse & ResumeForge AI"). HR posts a job, AI generates 3 case-scenario questions from the JD, candidates answer them, AI scores the answers against the candidate's CV, and HR sees a ranked dashboard.

`.agent/memory/Hackathon Case Batch 26.pdf` is the **source of truth for scope** (FR-001..FR-004, MVP scope, out-of-scope list). Read it before adding features. `.agent/memory/erd_hackathon.jpg` has the ERD.

The **Candidate module (ResumeForge)** — the CV builder — is owned by a different team and is out of scope. Do not build `/candidate/*` screens. This repo only needs to stay compatible with the `cv_json` they produce.

## Commands

```bash
npm run dev            # dev server (note: Link prefetching is DISABLED in dev)
npm run build          # must pass clean before any change is considered done
npm start              # production server — required to actually exercise prefetching
npm run lint
npm run seed           # seed 1 candidate + job + application
npm run seed:ranking   # seed 1 job + 4 scored candidates (instant ranking demo, no AI calls)
```

There is **no test framework configured**. `npm run build` (which type-checks) is the current automated gate. Verify behavior by exercising the running app.

Env vars (`.env.local`): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`.

## Architecture

Next.js 14 App Router + TypeScript, Tailwind 3 + shadcn/ui (Radix-based), Supabase Postgres, Vercel AI SDK.

### Two Supabase clients, two jobs

This is the easiest thing to get wrong here. The service-role client has no notion of a signed-in user; the anon clients do.

| Module | Key | Use it for |
|---|---|---|
| `lib/supabase/server.ts` | service role | **All HR data reads/writes** (jobs, applications). Bypasses RLS. Server-only. |
| `lib/supabase/auth-server.ts` | anon + `cookies()` | "Who is signed in?" from Server Components (read-only) and Server Actions (`{ writable: true }` — Server Components can't set cookies and Next throws if they try). |
| `lib/supabase/client.ts` | anon, browser | Sign in / sign up / OAuth from `components/auth-form.tsx`. |
| `lib/supabase/middleware.ts` | anon + request cookies | `middleware.ts` only — refreshes the session cookie per request. |

### Auth (Supabase Auth: email/password + Google)

`middleware.ts` guards `/hr/:path*` — no session redirects to `/login?redirectTo=…`. It checks *authentication only*, deliberately: adding a role query to the middleware hot path would cost a round trip on every navigation.

**Role** lives in the `profiles` table (`id` → `auth.users.id`, `role` `'hr' | 'candidate'`), written client-side after signup under two RLS policies (`auth.uid() = id`), not by a DB trigger — signup logic stays in `auth-form.tsx` + `app/auth/callback/route.ts`. `app/hr/layout.tsx` does the role check and bounces candidates to `/candidate`. It **fails open when no profile row exists** so a half-finished signup can't lock anyone out; the sign-in path backfills the missing row.

An existing account's stored role always beats the role picker on the login form — otherwise clicking "Continue with Google" from the other login page would silently switch someone's side.

Two doors: `/login` offers the HR/Candidate toggle; `/candidate/login` pins the role (it's the candidate team's own entrance). Both sit outside `app/hr/` so `HrNav` doesn't render pre-login.

Google OAuth needs external setup that isn't in the repo: a Google Cloud OAuth client whose redirect URI is `https://<project-ref>.supabase.co/auth/v1/callback`, its ID/secret pasted into Supabase → Authentication → Providers → Google, and the app origin listed under Supabase's URL Configuration.

`/assess/[applicationId]` stays **unauthenticated** — candidates reach it by link, as designed.

**Which API routes are guarded.** Middleware only matches `/hr/:path*`, so nothing under `/api` ever reaches it, and an unguarded route handler is wide open to the internet. Route handlers therefore guard themselves with `requireHrUser()` (`lib/auth-guard.ts`), which returns a 401/403 `Response` instead of middleware's HTML redirect:

| Route | Guarded? | Why |
|---|---|---|
| `PATCH`/`DELETE /api/hr/jobs/[jobId]` | **yes** | Destructive, against a DB shared with the Candidate team. |
| `GET /api/hr/dashboard/[jobId]` | **yes** | Returns every applicant's score, transcript and full CV. |
| `POST /api/hr/jobs`, `GET`s, `/api/assess/*`, `/api/applications` | no | The documented external contract — adding auth would break the Candidate module's integration. |

Add a new HR-only route? Guard it. It will not inherit protection from anywhere.

### AI provider: OpenRouter, not OpenAI

The case study specifies OpenAI, but there's no budget for it. `lib/ai/openrouter.ts` points the AI SDK's **OpenAI provider** at `https://openrouter.ai/api/v1` with a free model. This substitution is deliberate — do not "fix" it back to OpenAI.

Free-tier models are flaky in two ways worth knowing: they occasionally return invalid JSON (handled — surfaces an error), and the connection sometimes resets mid-stream, which leaves an `applications` row stuck at `status: 'in_progress'`. Recovery is manual (resubmit). Don't build a retry queue for this.

If a model slug stops working, change `OPENROUTER_MODEL` — no code change needed. Free slugs get deprecated without warning; `https://openrouter.ai/api/v1/models` lists what's currently live.

### The streaming / non-streaming duality

Each AI feature exists **twice**, on purpose:

| Path | Consumer | Why |
|---|---|---|
| `/api/hr/jobs`, `/api/assess/[id]`, `/api/applications` | The Candidate module team | Plain request/response JSON — the documented **external contract**. Don't change these shapes without telling that team. |
| `/api/hr/jobs/stream`, `/api/assess/[id]/stream` | Our own UI only (`useObject`) | Progressive rendering so 10–30s of AI latency feels alive instead of frozen. |

Both paths share prompt builders (`buildScenarioPrompt`, `buildScoringPrompt`) and Zod schemas (`lib/ai/schemas.ts`), so output shape can't drift. **Do not collapse these into one path for "consistency."**

The streaming routes persist to Supabase inside `streamObject`'s server-side `onFinish`, not in the client. `scoringResultSchema` orders `entries` before `match_score` deliberately — per-question feedback streams in first, score reveals last.

**Only `feedback` is the model's to write.** `scoringResultSchema` also carries `question`, `focus_area` and `answer`, but nothing in the prompt makes the model echo those faithfully — a free-tier model will paraphrase or truncate a candidate's answer, and persisting that would show HR an AI-rewritten version of what someone actually said. Both scoring paths run their entries through `buildTranscriptEntries()` (`lib/ai/scoring-engine.ts`), which rebuilds each entry from the job's `scenarios` and the submitted `answers` and keeps only the model's feedback. Driving that loop off `questions` also absorbs a model that returns the wrong number of entries. Don't "simplify" it back to persisting `object.entries` directly.

### Cache correctness (this bit has bitten twice)

Next's App Router caches `fetch()` — including the calls Supabase's client makes internally. That silently served stale dashboards after a candidate finished an assessment.

Two guards, both load-bearing:

1. `lib/supabase/server.ts` forces `cache: "no-store"` on every Supabase request. **This is the actual fix** — `export const dynamic = "force-dynamic"` on pages is only defense-in-depth. New routes reading Supabase are safe automatically.
2. `next.config.js` sets `experimental.staleTimes.dynamic: 0` so the client Router Cache never replays a stale RSC payload.

Consequence for `<Link>`: `prefetch={true}` uses the **`static`** staleTime (180s), not `dynamic`. Marking a data route `prefetch={true}` would cache a ranking for 3 minutes. Only data-free routes (`/hr/new-job`) opt into it. Dynamic routes rely on their `loading.tsx` — that boundary is what makes them prefetchable at all, and it's why navigation feels instant while data stays fresh.

### Server fetch → client view pattern

Locale lives in `localStorage`, so anything rendering translated text must be a client component. Pages are therefore thin server components that query Supabase and hand data to a client view (`page.tsx` → `jobs-list.tsx` / `dashboard-view.tsx`).

### i18n

Deliberately not a routing-based framework — JSON dictionaries + `{variable}` interpolation, locale in `localStorage`.

- `lib/i18n/translate.ts` — pure, **no `"use client"`**, so server components can translate (e.g. `app/not-found.tsx`).
- `lib/i18n/index.tsx` — `"use client"`; provider + `useTranslation()`. Falls back to English outside a provider so unlocalized trees don't crash.

`LocaleProvider` wraps `/hr/*` only. Keep `en.json` and `id.json` at exact key parity.

### `cv_json` is another team's shape

`CvJson` in `lib/types.ts` has every field optional and accepts both spellings seen in the wild (`role`/`title`, `institution`/`school`, single `period` vs split `startDate`/`endDate`). `components/cv-preview.tsx` skips absent sections rather than rendering empty ones. Keep it tolerant — that team's output will change.

## Conventions and boundaries

- **`.agent/skills/code-standards/SKILL.md` is a binding contract for all code here** — read it. Key points in practice: simplicity is a hard constraint (no abstractions for hypothetical requirements), comments explain *why* in English only, and state the plan before non-trivial code.
- **`/assess/[applicationId]` is intentionally bare-bones.** It's candidate-facing; its visual ownership belongs to whichever team builds the candidate UI. Its logic (progressive draft save, streaming submit) is ours. Don't restyle or localize it — there's a code comment saying so; leave it.
- **`/hr/dev-tools` is not product.** Simulate-application and seed-ranking exist only because the Candidate module has no UI to trigger a real application. Dashed borders and a "development & demo only" label are intentional.
- **Design tokens live at the top of `app/globals.css`** — the **Skillsync** palette (primary = brand violet `265 85% 58%`, derived from `public/logo.png`; `--brand-navy`/`--brand-violet` hold the raw logo hues for the mark itself). A re-skin should only need to change values in that one file — components consume semantic names (`bg-background`, `text-muted-foreground`, …) and never hardcode a colour. The one deliberate exception is the Google "G" in `components/auth-form.tsx`, which must keep its official colours. Status is still never encoded in colour alone (outline badge + text label), so a re-skin can't break meaning.
- Brand assets live in `public/`: `logo.png` (mark, used in nav + login), `logo-horizontal.png` (lockup), `brand.png` (wordmark), `favicon.ico`.

## Data safety

The Supabase project is **shared with the Candidate module team** — it holds their real data, not just test rows.

- Never run an unscoped delete (`.delete().neq(...)`, "delete everything" patterns).
- Never touch `candidate_profiles` rows you didn't create. Three rows named **"Jordan Alvarez"** are that team's real data:
  `70d08f2e-e318-4522-8286-8b95a32b06a9`, `b64f719b-1474-45cc-a1a0-259e5bedc2e5`, `d8197a8b-ce34-4e8b-b0c4-dca759ac36ba`
- Track the ids you create so cleanup can target them exactly. The seed scripts print theirs for this reason.
- Delete order is `applications` → `candidate_profiles` → `job_vacancies` (foreign keys).
- `profiles` is unrelated to `candidate_profiles` — it holds login accounts and cascades from `auth.users`. Deleting an auth user removes their profile row; never the reverse.
- `supabase/schema.sql` is reference documentation; the DB is already provisioned.
