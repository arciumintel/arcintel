import type { Config } from "tailwindcss";

/**
 * Arcademy palette — editorial paper + lapis ink accent.
 *
 * Rebuild of the former Stitch-violet palette around a warm-paper editorial
 * stack: cream canvas, true ink for text, lapis blue as the single saturated
 * accent. Secondary editorial accents (ochre for marks/figures, sage for
 * live/active state, indigo reserved for code syntax types) are added but
 * remain governed by the One Accent Rule — only lapis appears as primary UI
 * accent above ~30% of any screen's filled area.
 *
 * Legacy aliases (`secondary`, `secondary-container`, `brass`, `arcium-blue`)
 * are preserved and re-pointed at the lapis stack so older components keep
 * compiling without a sweeping rename.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Editorial canvas (warm paper) ────────────────────────────
        background: "#F4F0E6",          // canvas / page
        paper: "#F4F0E6",
        "paper-soft": "#EDE7D7",        // tonal step
        "paper-deep": "#FBF8EF",        // inset / card paper (lighter than canvas)
        "paper-shade": "#ECE4D0",       // code / sunken
        canvas: "#F4F0E6",
        "canvas-elevated": "#FBF8EF",
        "canvas-sunken": "#EDE7D7",
        surface: "#F4F0E6",
        "surface-bright": "#FBF8EF",
        "surface-container-lowest": "#FBF8EF",
        "surface-container-low": "#EDE7D7",
        "surface-container": "#ECE4D0",
        "surface-container-high": "#E0D8C0",
        "surface-container-highest": "#D6CEB5",
        "surface-variant": "#EDE7D7",
        "surface-tint": "#A47E2B",
        "surface-dim": "#E0D8C0",

        // ── Ink (text) ──────────────────────────────────────────────
        ink: "#1A1814",
        "ink-strong": "#000000",
        "ink-muted": "#4A4438",
        "ink-soft": "#8C8473",
        "ink-faint": "#B5AC97",
        on: "#1A1814",
        "on-background": "#1A1814",
        "on-surface": "#1A1814",
        "on-surface-variant": "#4A4438",
        "on-primary": "#FBF8EF",
        "on-secondary": "#FBF8EF",
        "on-tertiary": "#FBF8EF",
        "on-neutral": "#1A1814",
        "on-error": "#FBF8EF",
        "on-secondary-fixed": "#0F1F33",
        "on-secondary-fixed-variant": "#162B47",
        "on-primary-fixed": "#1A1814",
        "on-primary-fixed-variant": "#4A4438",
        "on-tertiary-fixed": "#3A2E1A",
        "on-tertiary-fixed-variant": "#5C4720",
        "on-secondary-container": "#0F1F33",
        "on-error-container": "#7A1010",
        "on-primary-container": "#4A4438",
        "on-tertiary-container": "#3A2E1A",
        "inverse-primary": "#D6CEB5",
        "inverse-on-surface": "#FBF8EF",
        "inverse-surface": "#1A1814",

        // ── Rule (hairlines) ────────────────────────────────────────
        rule: "#DED6C2",
        "rule-strong": "#B5AC97",
        outline: "#8C8473",
        "outline-variant": "#DED6C2",

        // ── Primary accent · Vermillion ─────────────────────────────
        // The single saturated accent. Classic editorial "second colour" of
        // printers (cf. Penguin Modern Classics covers). Warm, distinctly
        // visible on cream paper, harmonises with the ochre crop marks.
        accent: "#C5462E",
        "accent-soft": "#FBE3DA",        // tint for selections, wells
        "accent-deep": "#962F1B",         // pressed/active
        "accent-on": "#FBF8EF",           // text on accent fill

        // Stitch-legacy aliases now point at vermillion
        secondary: "#C5462E",
        "secondary-container": "#962F1B",
        "secondary-fixed": "#FBE3DA",
        "secondary-fixed-dim": "#F1C4B5",
        primary: "#1A1814",
        "primary-container": "#1A1814",
        "primary-fixed": "#E0D8C0",
        "primary-fixed-dim": "#B5AC97",
        tertiary: "#A47E2B",             // ochre — reserved for figures/marks
        "tertiary-container": "#FCEFC8",
        "tertiary-fixed": "#FCEFC8",
        "tertiary-fixed-dim": "#E8D89A",
        "arcium-blue": "#1E3A5F",
        brass: "#A47E2B",                // ochre — for crop marks, figures
        "brass-soft": "#FCEFC8",

        // ── Secondary editorial accents (used sparingly) ─────────────
        ochre: "#A47E2B",                // marks, figure captions, ornaments
        "ochre-soft": "#FCEFC8",
        sage: "#5D6E4C",                 // active/healthy state (non-celebratory)
        "sage-soft": "#DEE5D2",
        indigo: "#354766",               // reserved for code syntax types
        "indigo-soft": "#D8DEEA",
        error: "#A02929",
        "error-container": "#F5D8D8",
        proof: "#A02929",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        none: "0px",
        sm: "0.125rem",
        md: "0.25rem",
        lg: "0.25rem",
        xl: "0.375rem",
        full: "0.75rem",
        ed: "0.375rem",
      },
      spacing: {
        sm: "8px",
        md: "16px",
        xs: "4px",
        xl: "32px",
        "margin-mobile": "20px",
        "margin-desktop": "48px",
        gutter: "16px",
        lg: "24px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        masthead: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        h1: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        "h1-mobile": ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        h2: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        h3: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        body: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        "body-md": ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        "body-sm": ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        ui: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        headline: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        label: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        "label-caps": ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "label-caps": [
          "0.7rem",
          { letterSpacing: "0.14em", fontWeight: "500", lineHeight: "1.4" },
        ],
        "body-md": ["1.02rem", { lineHeight: "1.62", fontWeight: "400" }],
        "body-sm": ["0.9rem", { lineHeight: "1.55", fontWeight: "400" }],
        "h1-mobile": ["2.6rem", { lineHeight: "0.96", fontWeight: "700", letterSpacing: "-0.04em" }],
        h1: ["4.4rem", { lineHeight: "0.94", fontWeight: "700", letterSpacing: "-0.04em" }],
        h2: ["2.4rem", { lineHeight: "1.04", fontWeight: "600", letterSpacing: "-0.03em" }],
        h3: ["1.55rem", { lineHeight: "1.18", fontWeight: "600", letterSpacing: "-0.02em" }],
      },
      maxWidth: {
        prose: "65ch",
        column: "32rem",
        reading: "42rem",
      },
      boxShadow: {
        // Mute the violet glow shadow; replace with neutral ink-shadow.
        leaf: "0 1px 2px rgba(26,24,20,0.05), 0 8px 24px rgba(26,24,20,0.06)",
        stitchLift: "4px 4px 0 0 rgba(30,58,95,1)",
        rule: "inset 0 -1px 0 #DED6C2",
      },
      letterSpacing: {
        kicker: "0.16em",
        "kicker-wide": "0.22em",
      },
      borderWidth: {
        hair: "0.5px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
