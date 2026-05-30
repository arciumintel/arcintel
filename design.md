# Arcademy design system

Agent- and developer-facing visual spec for the Arcademy UI. **Source of truth for token values:** `tailwind.config.ts` and `app/globals.css`. For product scope, routes, and data rules, see [docs/FRONTEND-GUIDELINES.md](docs/FRONTEND-GUIDELINES.md) and [docs/AGENT-PLATFORM.md](docs/AGENT-PLATFORM.md).

---

## Positioning

Arcademy is **ecosystem onboarding infrastructure**—not consumer ed-tech. The interface should feel like a **focused technical reader**: calm, credible, reading-first. Users are developers and ecosystem newcomers preparing to use or integrate a product.

| Optimize for | Avoid |
| --- | --- |
| Trust, clarity, long-form reading | Gamification, mascots, celebration overlays |
| One restrained accent on warm paper | Multiple saturated accents on one screen |
| Factual progress and quiz outcomes | “Level up”, streaks, XP, leaderboards |
| Partner metadata (title, tagline, logo) inside a shared hub frame | Per-partner fonts, arbitrary CSS, page builders |

**Scope test:** Does this help someone onboard and verify they understood the product? If not, defer.

---

## One accent rule

**Vermillion (`accent`, `#C5462E`) is the only primary saturated accent** on any view. Use it for primary CTAs, active nav emphasis, kickers, and key links—not for large background fills across most of the viewport.

Secondary editorial colors are **supporting only**:

| Token | Role |
| --- | --- |
| `ochre` / `brass` | Crop marks, figure captions, intake banners (left rule) |
| `sage` / `sage-soft` | Healthy/active state (e.g. staff sidebar selection, success toasts)—not celebratory |
| `indigo` / `arcium-blue` | Code syntax and technical labels—not general UI chrome |
| `error` / `proof` | Fail states, validation |

Legacy aliases (`secondary`, `secondary-container`, `arcium-blue`) map to the stacks above; prefer semantic names in new code.

---

## Color palette

### Canvas and surfaces (warm paper)

| Token | Hex | Use |
| --- | --- | --- |
| `background` / `paper` / `canvas` | `#F4F0E6` | Page background |
| `paper-deep` / `canvas-elevated` | `#FBF8EF` | Cards, inputs, elevated panels |
| `paper-soft` / `surface-container-low` | `#EDE7D7` | Tonal step, sidebars |
| `paper-shade` / `surface-container` | `#ECE4D0` | Sunken areas, code wells |

### Ink (text)

| Token | Hex | Use |
| --- | --- | --- |
| `ink` | `#1A1814` | Body and headings |
| `ink-muted` | `#4A4438` | Secondary copy |
| `ink-soft` | `#8C8473` | Labels, breadcrumbs, meta |
| `ink-faint` | `#B5AC97` | Disabled, placeholders |

### Structure

| Token | Use |
| --- | --- |
| `rule` / `outline-variant` | Hairline borders (`#DED6C2`) |
| `rule-strong` | Stronger dividers |

### Accent (primary)

| Token | Hex | Use |
| --- | --- | --- |
| `accent` | `#C5462E` | Primary buttons (hover), links, kickers |
| `accent-soft` | `#FBE3DA` | Selection, subtle wells |
| `accent-deep` | `#962F1B` | Pressed / active fill |
| `accent-on` | `#FBF8EF` | Text on accent backgrounds |

Do **not** hard-code hex values in components—use Tailwind tokens (`text-accent`, `bg-paper-deep`, etc.).

**Dark mode:** `darkMode: "class"` is configured in Tailwind; a full dark token set is not shipped yet. Do not add one-off `dark:` styles until product defines the dark palette.

---

## Typography

**Fonts:** Geist Sans (`font-sans`, `--font-geist-sans`) for UI and prose; Geist Mono (`font-mono`, `--font-geist-mono`) for kickers, labels, slugs, and status chips.

**Scale** (from `theme.extend.fontSize`):

| Class | Size / weight | Use |
| --- | --- | --- |
| `text-h1` | 4.4rem, bold, tight tracking | Hub heroes (desktop) |
| `text-h1-mobile` | 2.6rem | Hub heroes (mobile) |
| `text-h2` | 2.4rem | Section titles |
| `text-h3` | 1.55rem | Subsections |
| `text-body-md` | 1.02rem / 1.62 lh | Lesson body default |
| `text-body-sm` | 0.9rem | Secondary body |
| `text-label-caps` | 0.7rem, tracked caps | Rare; prefer mono kickers below |

**Kickers** (dominant pattern in hub/staff):

```tsx
<span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
  Section label
</span>
```

**Breadcrumbs / meta:**

```tsx
className="font-sans text-[0.82rem] text-ink-soft"
```

**Wordmark:** `arcademy` with a vermillion full stop: `arcademy<span className="text-accent">.</span>`

**Reading width:** `max-w-prose` (~65ch) or `max-w-reading` (~42ch) for lesson columns; hub marketing blocks may use `max-w-[52ch]` for subtitles.

**Numerals:** `num-tabular` in tables; `num-lining` for stats.

---

## Layout and spacing

| Token | Value |
| --- | --- |
| `margin-mobile` | 20px |
| `margin-desktop` | 48px |
| `gutter` | 16px |
| Border radius | Tight editorial: `rounded-sm` (2px) default; `rounded-ed` (6px) for small chips |

**Hub / catalog:** Clear featured section; program cards with title, tagline, optional logo; empty states explain system state without blaming the user.

**Lesson player:** Single main column; quiz in a separated section below; breadcrumb `Program → Lesson`.

**Staff workspace:** Top bar + optional left sidebar (~220px); see [staff program shell spec](docs/superpowers/specs/2026-05-28-staff-program-shell-design.md).

**Partner branding:** Program title, tagline, and logo from published metadata only. Global chrome (nav, fonts, hub layout) stays Arcademy-owned.

---

## Components and patterns

### Primary button (filled)

Ink fill; hover shifts to accent. Use `ui-btn-filled` + `ui-tap` from `globals.css` when appropriate.

```tsx
className="group inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-sans text-[0.9rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
```

### Text link (secondary action)

Mono caps + underline on hover:

```tsx
className="group inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
// inner: border-b border-ink-faint group-hover:border-accent
```

### Elevated card

```tsx
className="border border-ink/15 bg-paper-deep p-8 md:p-10"
```

Hairline borders preferred over heavy shadows. Shadow `shadow-leaf` is a subtle ink tint—not a violet glow.

### Status chip (staff)

```tsx
className="inline-flex items-center gap-2 rounded-sm border border-rule bg-paper-deep px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted"
```

Small dot: `accent` (internal), `sage` (draft/active), or none (muted).

### Staff sidebar — active item

`sage-soft` background + `sage` 4px left border on **Overview** / **Curriculum** nav. Settings sits in footer.

### Callouts (lesson blocks)

Render via `LessonBlockRenderer` only: `note` = subtle panel; `warning` = stronger border/background. Do not use callout styles for body paragraphs.

---

## Motion

Defined in `app/globals.css`:

| Variable | Value | Use |
| --- | --- | --- |
| `--ease-out-expo` | cubic-bezier(0.22, 1, 0.36, 1) | Default UI |
| `--d-snap` | 160ms | Micro feedback |
| `--d-default` | 220ms | Color, border, transform |
| `--d-handover` | 320ms | Handoffs |
| `--d-fold` | 480ms | Larger transitions |

**Utilities:** `ui-tap`, `ui-btn-filled`, `page-enter`, `stagger` (children fade in sequence).

**Accessibility:** All durations zero out under `prefers-reduced-motion`. Do not rely on motion alone for meaning (pass/fail needs text/icon).

---

## Focus and accessibility

- Visible focus: 2px `accent` outline, 2px offset (`:focus-visible` in `globals.css`).
- On dark nav regions: `.nav-dark` uses `accent-soft` outline.
- Skip link: `.skip-to-content` → visible on focus.
- Heading order: one page `<h1>`; lesson content uses block `heading` levels 2–3.
- Images: always render `alt` from block data.
- Quiz/pass-fail: not color-only.

---

## Voice (microcopy)

| Prefer | Avoid |
| --- | --- |
| “Continue lesson”, “Enroll”, “Sign in to save progress” | “Level up”, “Earn XP” |
| “Passed comprehension check” | Exclamation-heavy praise |
| “Arcademy account” | “Classroom”, “instructor”, “course” (LMS framing) |

Product name: **Arcademy**. First launch program: **Arcium Fundamentals** (`program.slug = arcium`). Hub listing copy comes from the database—display, don’t hard-code partner titles.

---

## Surfaces

| Surface | Path prefix | Notes |
| --- | --- | --- |
| Public hub | `app/(hub)/`, `components/hub/` | Catalog, lesson player, account |
| Portal shell | `components/portal/` | Shared nav chrome |
| Staff Studio | `app/staff/`, `components/staff/` | Same tokens; sage active nav |
| Partner Studio | Phase 3+ | Draft authoring; staff publish in v1 |

Staff and hub share this design system—no separate “admin theme.”

---

## Anti-patterns

- Second saturated accent competing with vermillion on the same view
- Large gradient heroes, glassmorphism, or consumer ed-tech card grids
- Gamification UI (streaks, XP, badges, leaderboards)
- Raw author HTML in lessons; scattered block rendering outside `LessonBlockRenderer`
- Hard-coded colors outside Tailwind tokens
- Dense dashboard charts in early staff slices without product ask

---

## Implementation checklist

- [ ] Colors from `tailwind.config.ts` tokens only
- [ ] One accent rule respected on the screen
- [ ] Reading-first layout and prose width for lessons
- [ ] Kickers in mono caps; body in Geist Sans
- [ ] `prefers-reduced-motion` respected for animations
- [ ] Hub chrome unchanged; partner differentiation via metadata only

---

## Related documents

| Document | Purpose |
| --- | --- |
| [docs/FRONTEND-GUIDELINES.md](docs/FRONTEND-GUIDELINES.md) | Routes, data access, blocks, quizzes |
| [docs/AGENT-PLATFORM.md](docs/AGENT-PLATFORM.md) | Locked product decisions, phases |
| [docs/superpowers/specs/2026-05-20-ecosystem-platform-design.md](docs/superpowers/specs/2026-05-20-ecosystem-platform-design.md) | Full platform UX spec |
| [docs/superpowers/specs/2026-05-28-staff-program-shell-design.md](docs/superpowers/specs/2026-05-28-staff-program-shell-design.md) | Staff workspace layout |
| `tailwind.config.ts` | Token definitions |
| `app/globals.css` | Motion, focus, utility classes |

When Figma or external brand assets land, add a **Design assets** subsection here with links—do not duplicate wireframes in prose.
