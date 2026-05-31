---
name: Arcademy
description: Ecosystem onboarding infrastructure — warm paper, ink type, vermillion accent
colors:
  accent: "#C5462E"
  accent-deep: "#962F1B"
  accent-soft: "#FBE3DA"
  accent-on: "#FBF8EF"
  paper: "#F4F0E6"
  paper-deep: "#FBF8EF"
  paper-soft: "#EDE7D7"
  paper-shade: "#ECE4D0"
  ink: "#1A1814"
  ink-muted: "#4A4438"
  ink-soft: "#8C8473"
  ink-faint: "#B5AC97"
  rule: "#DED6C2"
  ochre: "#A47E2B"
  sage: "#5D6E4C"
  sage-soft: "#DEE5D2"
  error: "#A02929"
typography:
  display:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 6vw, 4.8rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.4rem"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  title:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.55rem"
    fontWeight: 600
    lineHeight: 1.18
    letterSpacing: "-0.02em"
  body:
    fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  label:
    fontFamily: "var(--font-geist-mono), ui-monospace, monospace"
    fontSize: "0.66rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.18em"
rounded:
  sm: "2px"
  md: "4px"
  ed: "6px"
  full: "12px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  margin-mobile: "20px"
  margin-desktop: "48px"
  gutter: "16px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-deep}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.paper-deep}"
    rounded: "{rounded.sm}"
    padding: "14px 24px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    padding: "8px 0"
  card-elevated:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "32px 40px"
  chip-status:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
  input-field:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px"
---

# Design System: Arcademy

## 1. Overview

**Creative North Star: "The Technical Reader"**

Arcademy looks like a focused technical reader and a precise authoring tool on warm editorial paper—not a consumer LMS, not a marketing site, and not a terminal emulator. Learners get Stripe Docs–like wayfinding and measure; staff get Linear-like density on the same token stack. The system rejects engagement theater, cold gray SaaS chrome, and neon gradient tech campaigns.

Surfaces share one frame: cream canvas, true ink text, vermillion as the single saturated accent. Partner programs differentiate through metadata (title, tagline, logo) inside Arcademy-owned chrome. Depth comes from tonal paper steps and hairline rules, not ghost-card shadows or glass panels.

**Key Characteristics:**

- Warm paper canvas with ink hierarchy and one vermillion accent
- Geist Sans for UI and lesson prose (Variant A default); Geist Mono for kickers, labels, and status
- Tight editorial radii (2–6px); hairline borders over wide drop shadows
- Reading measure ~62–68ch on lessons; single main column + separated quiz
- Responsive motion with `prefers-reduced-motion` zeroing all decorative duration
- Hub and Staff Studio share tokens; sage marks staff active nav only

## 2. Colors: The Warm Paper Palette

Editorial warm neutrals carry the page; vermillion punctuates. Supporting ochre, sage, and indigo never compete as primary UI accents.

### Primary

- **Editorial Vermillion** (`#C5462E`): Primary saturated accent. Kickers, active links, nav emphasis, primary button hover, selection wells. Never fill most of the viewport with this color.

- **Vermillion Deep** (`#962F1B`): Pressed and active accent states.

- **Vermillion Soft** (`#FBE3DA`): Text selection, subtle accent wells, focus-adjacent tints.

### Secondary

- **Figure Ochre** (`#A47E2B`): Crop marks, figure captions, note callout left rules—not general CTA chrome.

- **Healthy Sage** (`#5D6E4C` / `#DEE5D2`): Staff sidebar active state and non-celebratory success—never gamification green.

### Tertiary

- **Syntax Indigo** (`#354766` / `#1E3A5F`): Code syntax and technical labels only—not nav or button fills.

- **Proof Red** (`#A02929`): Validation and fail states with text/icon, never color-only quiz feedback.

### Neutral

- **Warm Paper** (`#F4F0E6`): Page canvas and default surface.

- **Elevated Paper** (`#FBF8EF`): Cards, inputs, quiz panels, elevated panels.

- **Soft Paper** (`#EDE7D7`): Sidebars, tonal steps.

- **Sunken Paper** (`#ECE4D0`): Code wells and inset regions.

- **True Ink** (`#1A1814`): Headings and body copy.

- **Muted Ink** (`#4A4438`): Secondary prose and de-emphasized UI copy.

- **Soft Ink** (`#8C8473`): Breadcrumbs, meta labels, mono kickers at rest.

- **Faint Ink** (`#B5AC97`): Disabled and placeholder text—documented exception to strict AA when editorial intent requires softer meta.

- **Hairline Rule** (`#DED6C2`): Borders and dividers at 15% ink opacity where semantic tokens are not used.

### Named Rules

**The One Accent Rule.** Vermillion is the only primary saturated accent on any view. It appears on kickers, links, hover fills, and emphasis—not as large background fields across the screen.

**The Warm Paper Rule.** Canvas stays warm editorial paper, not Notion-gray or terminal black. Secondary colors support reading; they do not replace the paper + ink foundation.

## 3. Typography

**Display Font:** Geist Sans (`var(--font-geist-sans)`)

**Body Font:** Geist Sans (Variant A default for all lesson prose)

**Label/Mono Font:** Geist Mono (`var(--font-geist-mono)`) for kickers, breadcrumbs, status chips, and code

**Character:** Technical and credible—Stripe Docs density with optional Stripe Press warmth later (Variant B serif prose remains under evaluation in PRODUCT.md). Hierarchy comes from scale and weight contrast, not decorative display type.

### Hierarchy

- **Display** (800, `clamp(2.4rem, 6vw, 4.8rem)`, lh 0.92, tracking −0.04em): Lesson and hub page titles. Max clamp ≤ 4.8rem; never exceed 6rem.

- **Headline** (600, 2.4rem, lh 1.04, tracking −0.03em): Hub section titles, quiz section heading.

- **Title** (600, 1.55rem, lh 1.18, tracking −0.02em): Lesson block h2/h3, staff panel titles.

- **Body** (400, 1.02–1.08rem, lh 1.62–1.65): Lesson paragraphs, quiz prompts. Cap line length at `max-w-prose` (~65ch) or `max-w-reading` (~42ch) for intros.

- **Label** (500 mono, 0.62–0.66rem, tracking 0.16–0.18em, uppercase): Track kickers, breadcrumbs, lesson numbers, staff status—never on every section as reflex scaffolding.

### Named Rules

**The Kicker Rule.** Mono uppercase kickers carry section identity. One kicker per major region is voice; an eyebrow on every block is AI grammar.

**The Docs Body Rule.** Lesson prose stays Geist Sans until Variant B is explicitly approved. Do not introduce a reading serif without a scoped lesson-prose change.

## 4. Elevation

This system is **flat-by-default with tonal layering**. Surfaces step through paper, paper-deep, paper-soft, and paper-shade. Hairline borders (`border-ink/15`) define cards and panels. Shadows are rare and subtle—never paired with 1px decorative borders on the same element.

### Shadow Vocabulary

- **Leaf shadow** (`0 1px 2px rgba(26,24,20,0.05), 0 8px 24px rgba(26,24,20,0.06)`): Skip link focus, collapsed nav tooltips—ambient ink tint only.

- **Rule inset** (`inset 0 -1px 0 #DED6C2`): Hairline separators where a full border is heavy.

### Named Rules

**The No Ghost Card Rule.** Never pair `border: 1px solid` with a wide soft drop shadow (blur ≥ 16px) on the same element. Pick hairline border OR a tight shadow, not both as decoration.

**The Tonal Depth Rule.** Elevation is conveyed by paper step and border, not floating gray cards. Nested cards are forbidden.

## 5. Components

Components feel **refined and restrained**—tactile through ink-to-accent hover shifts, not bounce or glow.

### Buttons

- **Shape:** Slightly squared corners (2px / `rounded-sm` or `rounded-[2px]`).

- **Primary:** Ink fill (`#1A1814`), paper-deep text, semibold sans 0.86–0.9rem, padding ~14px 24px. Use `ui-btn-filled` + `ui-tap` from `globals.css`.

- **Hover / Focus:** Background shifts to vermillion; 2px accent `:focus-visible` outline with 2px offset. Active: scale 0.98 via `ui-tap`.

- **Secondary / Ghost:** Mono caps link with underline on hover; ink-muted → accent on hover. Verb + object labels ("Submit answers", "Enroll").

### Chips

- **Style:** `rounded-sm`, `border-rule`, `bg-paper-deep`, mono 0.62rem uppercase.

- **State:** Sage dot + sage-soft background for staff active/draft; accent dot for internal; muted when inactive.

### Cards / Containers

- **Corner Style:** 2px (`rounded-sm`).

- **Background:** `paper-deep` on `paper` canvas.

- **Shadow Strategy:** None at rest; optional `shadow-leaf` only for skip/tooltip overlays.

- **Border:** `border-ink/15` hairline.

- **Internal Padding:** 24–32px mobile, 32–40px desktop (`p-6 md:p-8` or `p-8 md:p-10`).

### Inputs / Fields

- **Style:** `bg-paper-deep`, `border-ink/15`, 2px radius, sans body size.

- **Focus:** Border shifts to accent; global `:focus-visible` ring on interactive elements.

- **Error / Disabled:** `error` token with text message; placeholders use `ink-soft/60`.

### Navigation

- **Portal spine:** Collapsible left nav (~260px / 56px collapsed), paper-soft background, ink icons, accent on active emphasis.

- **Staff sidebar:** Sage-soft active row with 4px sage left border on Overview/Curriculum.

- **Breadcrumbs:** Mono 0.62rem uppercase, ink-soft, slash dividers.

- **Mobile:** Bottom padding for thumb reach; spine collapses at md breakpoint.

### Lesson blocks (signature)

Render only through `LessonBlockRenderer`: heading, paragraph, callout (ochre or accent left rule), code (paper-shade well + mono header), image (hairline border + mono caption), divider (short ink rule). Quiz lives in `HubQuizSection` below a strong top border—never inline in prose.

## 6. Do's and Don'ts

### Do:

- **Do** use Tailwind semantic tokens (`text-ink`, `bg-paper-deep`, `text-accent`)—never hard-coded hex in components.

- **Do** keep one vermillion accent per view and reading measure ~62–68ch on lesson body.

- **Do** use mono kickers for wayfinding and factual progress copy ("Enrolled", "Comprehension check").

- **Do** respect `prefers-reduced-motion`: zero decorative duration; never hide content behind animation gates.

- **Do** keep staff and hub on warm paper—Linear density, not Notion-gray chrome.

### Don't:

- **Don't** use a **terminal aesthetic**—monospace-as-default UI, green-on-black, hacker cosplay.

- **Don't** ship **Notion-gray SaaS**—flat anonymous gray surfaces, borderless card stacks, cold admin themes.

- **Don't** use **neon gradient tech**—purple/blue hero gradients, glassmorphism, saturated campaign landing patterns.

- **Don't** add **consumer ed-tech** patterns—XP, streaks, leaderboards, mascots, "level up" copy.

- **Don't** use **AI slop scaffolds**—tracked uppercase eyebrows on every section, numbered 01/02/03 markers, identical icon-card grids, gradient text.

- **Don't** pair 1px borders with wide soft shadows on the same card or button.

- **Don't** use border-left greater than 1px as a colored stripe on callouts beyond the existing 2px note/warning rule in `LessonBlockRenderer`.

- **Don't** add per-partner fonts or arbitrary CSS; partner branding is metadata only.

- **Don't** add one-off `dark:` styles until product defines a full dark palette.

---

**Implementation source of truth:** `tailwind.config.ts`, `app/globals.css`. **Strategic context:** `PRODUCT.md`. **Sidecar:** `.impeccable/design.json` (Impeccable live panel). **Engineering routes:** [docs/FRONTEND-GUIDELINES.md](docs/FRONTEND-GUIDELINES.md).
