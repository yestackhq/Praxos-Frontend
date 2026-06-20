import type { Config } from "tailwindcss";

/**
 * Praxos — Enterprise LMS (B&W). Dark-only design system mirrored from Figma.
 * Tokens: color/d-* and the Geist type scale. Legacy semantic aliases
 * (background/foreground/border/card/muted-foreground/primary) map onto the
 * same palette so older primitives keep working during the rebuild.
 */
const ink = {
  bg: "#f6f5f9",
  surface: "#ffffff",
  ink: "#2b2440",
  soft: "#6e6a7d",
  faint: "#9a96a8",
  hairline: "#ececf1",
  border: "#e0dde9",
};

/* Phantom accents */
const phantom = {
  aubergine: "#3c315b",
  lav: "#e2dffe",
  peri: "#ab9ff2",
  mint: "#2ec08b",
};

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: ink.bg,
        surface: ink.surface,
        ink: ink.ink,
        soft: ink.soft,
        faint: ink.faint,
        hairline: ink.hairline,
        // legacy semantic aliases
        background: ink.bg,
        foreground: ink.ink,
        muted: ink.surface,
        "muted-foreground": ink.soft,
        border: ink.border,
        card: ink.surface,
        "card-foreground": ink.ink,
        primary: phantom.aubergine,
        "primary-foreground": "#ffffff",
        aubergine: phantom.aubergine,
        lav: phantom.lav,
        peri: phantom.peri,
        mint: phantom.mint,
      },
      borderColor: { DEFAULT: ink.hairline },
      borderRadius: {
        sm: "10px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        eyebrow: ["12px", { lineHeight: "1.2", letterSpacing: "0.16em", fontWeight: "500" }],
        caption: ["12px", { lineHeight: "1.4", letterSpacing: "0" }],
        label: ["13px", { lineHeight: "1.4", letterSpacing: "0", fontWeight: "500" }],
        "body-s": ["13px", { lineHeight: "1.5" }],
        body: ["15px", { lineHeight: "1.58" }],
        title: ["18px", { lineHeight: "1.38", letterSpacing: "-0.02em", fontWeight: "500" }],
        h3: ["22px", { lineHeight: "1.28", letterSpacing: "-0.03em", fontWeight: "500" }],
        h2: ["30px", { lineHeight: "1.16", letterSpacing: "-0.04em", fontWeight: "600" }],
        h1: ["44px", { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "600" }],
        metric: ["64px", { lineHeight: "1", letterSpacing: "-0.035em", fontWeight: "600" }],
      },
      maxWidth: { content: "1160px" },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", filter: "blur(6px)", transform: "translateY(8px)" },
          to: { opacity: "1", filter: "blur(0)", transform: "translateY(0)" },
        },
        spinslow: { to: { transform: "rotate(360deg)" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        spinslow: "spinslow 22s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
