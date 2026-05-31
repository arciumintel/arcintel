# Product

## Register

product

## Users

Arcademy serves two primary audiences with equal design weight:

**Learners (hub + lesson player)** — Developers and ecosystem newcomers, often arriving via a direct link from a specific organization or partner app. They are in an onboarding context: reading structured lessons, passing comprehension checks, and continuing across sessions. They need calm wayfinding, trustworthy tone, and clear progress—not gamification or marketing noise.

**Staff (Staff Studio)** — Arcademy operators and partner authors who create programs, edit draft curriculum, upload media, and publish. They work in dense tool surfaces: forms, block editors, status chips, and curriculum outlines. They need compact UI density, clear status, and fast scanning—without cold gray SaaS chrome.

## Product Purpose

Arcademy is ecosystem onboarding infrastructure for the Arcium ecosystem. It turns partner documentation into guided programs with comprehension checks and measurable progress so teams can verify users understood a product before they integrate or go deeper.

Success looks like: a learner referred by an org finishes fundamentals and feels **ready to start learning** the partner product; staff can author, validate, and publish programs without bespoke onboarding stacks.

## Brand Personality

**Calm · Credible · Educational**

The interface should feel like a focused technical reader and a precise authoring tool—not a consumer LMS, not a marketing site, not a terminal emulator.

| Surface | Reference steal | Avoid |
| --- | --- | --- |
| Learner (hub + lessons) | Stripe Docs (wayfinding, density, onboarding tone) + Stripe Press (long-form credibility) | Marketing hero noise, celebration, gamification |
| Staff Studio | Linear (compact density, neutral tool tone, clear status/forms) | Notion-gray SaaS chrome, cold neutral admin themes |

Warm paper, ink text, and vermillion as the single primary accent remain Arcademy-owned across both surfaces. Partner differentiation is metadata only (title, tagline, logo)—not per-partner fonts or arbitrary styling.

## Anti-references

Do not design toward:

- **Terminal aesthetic** — monospace-as-default UI, green-on-black, hacker cosplay
- **Notion-gray SaaS** — flat gray surfaces, borderless cards, anonymous admin chrome
- **Neon gradient tech** — purple/blue hero gradients, glassmorphism, saturated campaign landing patterns
- **Consumer ed-tech** — XP, streaks, leaderboards, mascots, “level up” copy
- **AI slop scaffolds** — eyebrow kickers on every section, numbered 01/02/03 markers, identical icon-card grids, gradient text

## Design Principles

1. **Reading-first onboarding** — Lessons are the core artifact. Optimize measure (~62–68ch), hierarchy, and block clarity before decorative layout.
2. **One accent rule** — Vermillion is the only primary saturated accent on any view. Supporting editorial colors (ochre, sage, indigo) stay subordinate.
3. **Show progress, not performance** — Factual enrollment and quiz outcomes; no engagement theater.
4. **Tool clarity for staff** — Linear-like density and status legibility on warm paper; forms and editors should feel precise, not playful.
5. **Org-referred arrival** — Many users land from a specific partner. The hub frame stays Arcademy-owned; the program context (title, org, next step) must be immediately legible.
6. **Practice what we preach** — Onboarding content and UI copy use plain, specific language; no buzzwords or LMS framing (“classroom”, “instructor”, “course”).

## Accessibility & Inclusion

**Target:** WCAG 2.1 AA where it supports real usability (contrast, focus visibility, keyboard paths, reduced motion, non-color-only states).

**Pragmatic override:** If a strict AA interpretation conflicts with the intended editorial design (e.g., muted meta labels on warm paper), prefer the documented design intent and document the exception. Do not flatten the visual system to generic high-contrast gray defaults.

**Required behaviors:**

- Visible `:focus-visible` outlines on interactive elements
- `prefers-reduced-motion`: zero out decorative durations; never gate content visibility on animation
- Quiz pass/fail and status communicated with text/icons, not color alone
- Image `alt` from block data; sensible heading order (one page `h1`, lesson blocks at h2/h3)

## Typography (learner lessons — decision pending)

Two variants under evaluation on the representative lesson page:

| Variant | Stack | Register |
| --- | --- | --- |
| **A (current default)** | Geist Sans for UI, headings, and lesson prose | Stripe Docs–like |
| **B (candidate)** | Geist Sans for UI + headings; reading serif for lesson paragraph/callout prose only | Stripe Press–like |

See `design.md` for visual tokens (Stitch-format DESIGN spec). Final default TBD after side-by-side review on live lesson blocks.
