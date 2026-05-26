# What is Arcidex?

Arcidex is **onboarding infrastructure** for the Arcium ecosystem. It helps ecosystem teams turn complex protocol documentation into **guided onboarding programs**—with comprehension checks and measurable learner progress—so they can see whether users actually understood their product, not just clicked through a doc.

Learners get **one account** and a **curated catalog** of programs. Partners get governed onboarding infrastructure—without building their own LMS—and clear outcomes from structured programs and progress data (see [Why partners use Arcidex](#why-partners-use-arcidex)).

This document explains the product in plain language. For engineering detail, see the [design spec](superpowers/specs/2026-05-20-ecosystem-platform-design.md). For day-to-day agent rules, see [AGENT-PLATFORM.md](AGENT-PLATFORM.md).

---

## The idea in one sentence

Arcidex helps ecosystem teams turn complex protocol documentation into guided onboarding programs—with comprehension checks and measurable learner progress.

---

## Why partners use Arcidex

Partners are ecosystem teams (protocols, apps, tooling) who need users to **get productive**, not just read docs. Arcidex gives them a shared hub and governed program model so they can:

| Outcome | What Arcidex enables |
| --- | --- |
| **Reduce onboarding friction** | Turn scattered protocol docs into a linear, guided path—one link, one program, clear next steps. |
| **Improve activation** | Comprehension checks confirm users understood key concepts before they integrate or go deeper. |
| **Standardize education** | Structured blocks and platform-defined quizzes keep quality consistent across programs and partner teams. |
| **Identify drop-off points** | Lesson- and version-scoped progress shows where learners stall—before it shows up only in support tickets. |
| **Prepare developers before support requests** | Quizzes and progress signal who completed fundamentals; partners spend support time on real blockers, not repeat basics. |

Partners do **not** build custom courseware or run a separate LMS. Staff help new partners launch; trusted partners edit drafts under review (v1). Analytics and exports roll out in Phase 2+; the data model is designed for these outcomes from day one.

---

## Key terms

| Term | What it means |
| --- | --- |
| **Hub** | The public home page and catalog where learners discover programs (`/` and `/programs`). |
| **Program** | A complete learning path for one product or topic (e.g. “Arcium Fundamentals”). This is what learners enroll in. |
| **Organization** | The partner company that owns one or more programs. Used for permissions and analytics boundaries. |
| **Lesson** | A reading-first page in a program. May include a short quiz at the end. |
| **Track** | A group of lessons within a program (like a chapter or module). |
| **Quiz** | A comprehension check tied to a lesson. Uses fixed question types defined by the platform—not a free-form quiz builder. |
| **Draft** | Work-in-progress content authors can still edit. |
| **Publish** | Staff action that freezes a snapshot of the draft and makes it the live version learners see. Published content is not edited in place. |
| **Enrollment** | A learner’s membership in a specific program. Progress is tracked per program. |
| **Staff** | Arcidex operators who curate the hub, onboard partners, review content, and publish. |
| **Trusted partner** | A partner who passed a manual quality gate and may edit **drafts** in Partner Studio. They still cannot go live without staff approval in v1. |

---

## Who uses Arcidex?

### Learners

- Browse the hub and open programs.
- Read lessons and take quizzes.
- Keep progress with one account across programs.
- Try the first lesson as a guest, then sign up to save progress (planned for v1).

### Partners (ecosystem apps)

**What they get:** See [Why partners use Arcidex](#why-partners-use-arcidex)—lower friction onboarding, better activation, standardized education, drop-off visibility, and developers prepared before support.

**How they work with Arcidex:**

- **New partners:** Submit an intake brief (goals, outline, assets). Staff builds the first version.
- **Trusted partners (later):** Edit drafts in Partner Studio and submit for staff review.
- Configure quizzes within platform limits (pass score, retries, etc.)—not custom question formats.

### Staff

- Create organizations and programs.
- Author and publish content (especially for new partners).
- Decide what appears on the hub and what gets featured.
- Approve partner submissions before they go live.
- Grant “trusted” status after a program ships successfully.

---

## How content gets created and published

1. **Draft** — Staff (or a trusted partner later) writes lessons using structured blocks: headings, paragraphs, callouts, code, images—not arbitrary web pages.
2. **Review** — For partner content, staff checks quality (quizzes make sense, images work, accessibility basics).
3. **Publish** — Staff publishes a frozen snapshot. Learners see this version.
4. **List on hub** — Publishing alone is not enough. Staff also marks a program as **listed** or **featured** so it appears in the public catalog.

If staff publish an updated version, **existing learners stay on the version they started** unless staff manually migrate them (v1). That protects progress integrity when content changes.

---

## What learners see (routes)

| Page | Purpose |
| --- | --- |
| `/` | Hub home — featured programs, continue learning |
| `/programs` | Full catalog |
| `/programs/[name]` | Program overview and start/continue button |
| `/programs/[name]/lessons/[lesson]` | Lesson reader + quiz |
| `/account` | Your enrollments and progress across programs |

Staff and partner authoring tools live under `/staff` and `/partner` (rolled out in later build phases).

---

## What’s in the first version (v1)

**Included:**

- Curated hub and program catalog
- Reading-first lessons with platform-defined quizzes
- One global learner account
- Staff-built programs for new partners
- Arcium as the first program at launch
- Basic progress, badges/streaks (optional presets—not a full game platform)
- Staff analytics on how programs perform

**Not in v1 (on purpose):**

- Full LMS features (classrooms, SCORM imports, course marketplaces)
- Partner-built page design / marketing site builder
- Public leaderboards
- “Sign in with partner app” (partner SSO)
- Embeddable widget for partner apps
- Webhooks and billing

**Scope check we use:** Does this help verify that a user understood a partner’s product? If not, it waits.

---

## Partner journey (simplified)

```
New partner → intake form → staff builds program → staff publishes → hub listing
                                      ↓
                            (after quality gate)
                                      ↓
                     trusted partner edits drafts → staff review → staff publishes
```

Partners do **not** go live on their own in v1. Trust is earned manually after staff has shipped and reviewed at least one program with them.

---

## Build phases (plain language)

| Phase | What gets built | What “done” looks like |
| --- | --- | --- |
| **0 — Foundation** | Database structure, security isolation, first Arcium content seeded | Data model works; partners’ data can’t leak to each other |
| **1 — Learner experience** | Hub, program pages, lesson player, accounts, guest try-then-sign-up | A new visitor can try Arcium lesson 1 and save progress by signing up |
| **2 — Partner onboarding** | Intake flow, staff authoring UI, publish/rollback tools, basic analytics | A second program built entirely by staff goes live on the hub |
| **3 — Trusted partners** | Partner draft editor, review queue, trust settings | A trusted partner submits a draft; staff publishes without rewriting from scratch |
| **4 — Later** | Webhooks, SSO, embeds, leaderboards, etc. | Post–v1 backlog |

Estimated calendar time to v1: **about 12–16 weeks** with 1–2 engineers.

---

## Decisions already made

These are settled unless leadership explicitly reopens them:

- Single public hub (not separate sites per partner)
- Arcium is program #1 at launch
- Staff must approve all publishes in v1
- Published snapshots are immutable
- English-only UI for v1 (content structure supports more languages later)
- Fewer than ~10 partner programs expected in year one

---

## Open questions

| Question | When we need an answer |
| --- | --- |
| Which partner app is the first non-Arcium pilot? | Before Phase 2 |
| Does enrollment happen on “Enroll” click or first lesson activity? | Before Phase 1 |
| How long should partner preview links last? | Before Phase 2 |
| Legal terms for sharing learner progress with partners | Before Phase 2 |

---

## Related documents

| Document | Audience |
| --- | --- |
| [Design spec](superpowers/specs/2026-05-20-ecosystem-platform-design.md) | Engineering, product, partners (detailed) |
| [AGENT-PLATFORM.md](AGENT-PLATFORM.md) | AI coding agents (operational rules) |

---

## Branding

- **Product name:** Arcidex
- **First program:** Arcium Fundamentals (`arcium`)
