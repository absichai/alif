# ALIF — Devpost submission copy

## Elevator pitch

**Your personal journey from planning the move to feeling at home.**

## About the project

### Inspiration

Moving to Dubai can feel like opening twenty browser tabs at once. Residency,
Emirates ID, document attestation, housing, Ejari, DEWA, health insurance,
banking, transport, schools, and family sponsorship are explained by different
organizations. Advice is abundant, but the sequence is not.

The idea came from experiencing that fragmentation as a new Dubai resident. The
real problem was not a lack of checklists. It was not knowing which decision
changed everything after it, what could happen in parallel, which process was
official, or what did not apply to a particular household.

ALIF treats settling in a new city as a personal life journey instead of an
administrative to-do list.

### What it does

A user starts in one of two ways:

1. Tell ALIF their story naturally.
2. Answer five focused questions about stage, timeframe, household, residency
   path, and passport country. Income is optional.

ALIF gathers only missing mandatory context. It does not reveal personalized
steps before account creation. After Google or email/password sign-up, it
creates a dependency-aware Dubai journey across identity, home, money,
mobility, family, and daily life.

The interface emphasizes a continuous timeline, a current chapter, and what
each chapter unlocks. Government actions link to the responsible official
authority and show when the source was last verified. Non-government service
steps expose future partner opportunities without presenting paid placements as
official guidance.

Users can complete and reopen steps, see dependent chapters unlock, inspect the
profile used for personalization, and delete all ALIF data. They can also ask
the grounded ALIF assistant why a step matters or tell it that their plans
changed. The assistant may create a versioned proposal, but the journey changes
only after explicit user confirmation.

### How we built it

ALIF is a Next.js 16 and React 19 application written in TypeScript and styled
with Tailwind CSS. Clerk provides Google and email/password authentication.
Neon PostgreSQL stores owner-scoped profiles, journeys, progress, and assistant
proposals through Drizzle ORM.

The core is intentionally hybrid:

- OpenAI's Responses API converts free-form relocation context into strict Zod
  schemas and explains curated journey content.
- A deterministic engine selects applicable Dubai definitions, validates their
  dependency graph, and calculates completed, current, available, and blocked
  states.
- A versioned Dubai pack owns official URLs, applicability, prerequisites, and
  procedural copy.

AI can therefore make the experience conversational without becoming the
source of truth for immigration, housing, or government processes.

Security and privacy were designed into the MVP. Anonymous context stays in
session storage, server secrets remain request-time only, database operations
are owner-scoped, AI routes are rate-limited using HMAC identifiers, and
assistant mutations use expiring proposals applied in a single transaction.

### Challenges

The hardest product challenge was resisting the temptation to build a large
directory of Dubai information. A directory would be easier, but it would not
solve sequencing. We instead modeled stable step IDs, applicability rules, and
dependencies so the same content can produce a smaller journey for a single
resident and family-specific chapters for a married parent.

The hardest technical challenge was keeping AI useful but constrained. We
separated conversation from authority: models return structured data, citations
are filtered to selected definitions, and assistant changes are never applied
directly.

The authentication boundary also required care. Users should feel the value
before sign-up without leaking the personalized journey. ALIF gathers context
anonymously, shows only generic benefits at the gate, then persists and renders
the journey after authentication.

### What we learned

We learned that trustworthy AI products often work best when the model is not
the database and not the rules engine. The model handles ambiguity and language;
the curated pack handles facts; the deterministic engine handles state.

We also learned that relocation is better represented as chapters in a story
than tasks in a dashboard. Milestones make administrative dependencies feel
human while still giving users a concrete next action.

### What's next

The next step is to validate the Dubai pack with relocation professionals and
official-source reviews, then add carefully disclosed partners for services
such as property search, insurance, document support, telecom, and schools.

Longer term, ALIF can expand through versioned destination packs for other
cities while keeping the same journey engine, privacy model, and assistant
contract.

## Built with

`Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Clerk`, `OpenAI API`,
`OpenAI Responses API`, `GPT-5.6 Terra`, `Zod`, `Neon`, `PostgreSQL`,
`Drizzle ORM`, `Vercel`, `Vitest`, `Testing Library`, `Playwright`,
`GitHub Actions`, `Lucide`

## Links

- Source code: <https://github.com/absichai/alif>
- Live demo: add the verified preview URL before submission
