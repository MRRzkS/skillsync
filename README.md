# Skillsync

**Where CVs and job needs finally sync.**

Skillsync is a two-sided AI recruitment platform. Candidates turn raw experience into an ATS-friendly CV in minutes; HR posts a job and gets an AI-generated 3-question case assessment for every applicant, scored automatically against their CV — so a ranked, evidence-backed shortlist exists before anyone picks up the phone.

Built by two teams into one Next.js app: the **HR module** (job posting, AI scenario generation, scoring, dashboards) and the **Candidate module — ResumeForge** (CV builder, job browsing, applications).

## Features

**For HR**
- Paste a job description → AI generates 3 adaptive case-scenario questions
- Every applicant gets scored 0–100 against their CV and case answers, with an AI pitch summary
- Ranked candidate dashboard, candidate directory, and read-only assessment transcripts
- Full bilingual UI (English / Indonesian)

**For Candidates**
- Turn raw, unstructured experience into a polished, ATS-friendly CV
- AI STAR-method (Situation/Task/Action/Result) review of your CV, computed in the background and cached — not regenerated every time you look at it
- Multiple CV templates, PDF export
- Browse open roles and apply in one click; the case assessment follows automatically

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Database & Auth:** Supabase (PostgreSQL, Supabase Auth — email/password + Google OAuth)
- **AI:** Vercel AI SDK, OpenRouter (primary) with a Gemini fallback for reliability

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A free [OpenRouter](https://openrouter.ai/keys) API key
- A free [Google AI Studio](https://aistudio.google.com/apikey) API key (fallback provider)

### Setup

```bash
git clone https://github.com/MRRzkS/skillsync.git
cd skillsync
npm install
cp .env.local.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (**server-only — never expose this to the browser**) |
| `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) |
| `OPENROUTER_MODEL` | A free model slug from [openrouter.ai/models](https://openrouter.ai/api/v1/models) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | e.g. `gemini-2.0-flash` |

Provision the database — run `supabase/schema.sql` against your Supabase project (SQL Editor, or `psql`).

```bash
npm run dev
```

Visit `http://localhost:3000`.

> **Google OAuth** (optional): requires a Google Cloud OAuth client with redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`, configured under Supabase → Authentication → Providers → Google.

### Available Scripts

```bash
npm run dev      # start the dev server (note: Link prefetching is disabled in dev mode)
npm run build    # production build — must pass before any change is considered done
npm run start    # run the production build (needed to actually exercise prefetching)
npm run lint     # ESLint
```

There is no automated test suite; `npm run build` (which type-checks) is the project's correctness gate.

## Architecture Notes

- **Two Supabase clients:** a service-role client for all HR-side data access (bypasses RLS, server-only), and an anon client for candidate-facing auth. Mixing these up is the easiest mistake to make in this codebase.
- **Every AI feature has a streaming and a non-streaming path.** The non-streaming routes are the documented contract the two modules use to talk to each other; the streaming routes exist purely so the UI feels alive during 10–30s of AI latency. They share the same prompts and schemas, so the two can't drift.
- **AI provider is OpenRouter, not OpenAI** — the case study specifies OpenAI, but this substitution is deliberate (no budget for a paid provider). A Gemini fallback covers OpenRouter's free-tier rate limits.
- **The Candidate module has its own design system** (separate color tokens, fonts, and UI kit from the HR side) — this is intentional isolation, not an oversight.

## Deployment

This app is a standard Next.js 14 project — deploy it anywhere that supports Node.js server-side rendering (Vercel is the natural fit). Set all the environment variables above in your hosting platform's dashboard; none of them should be committed to the repository.

## License

Private / unpublished. Built for the Maxy Academy Hackathon (Batch 26).
