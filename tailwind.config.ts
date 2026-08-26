import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // --- Candidate module (app/candidate/resume-builder) palette ---
        // Literal hex tokens, not the HR side's semantic HSL vars above —
        // kept separate on purpose since that team's own design isn't final
        // yet. Only used by components/candidate/**. `muted` was dropped
        // (their legacy string token, unused anywhere, and would have
        // collided with the HR `muted.DEFAULT/foreground` object above).
        paper: "#F7F5F1",
        ink: "#1E2A32",
        terminal: "#14191D",
        terminalline: "#26313A",
        structure: "#3D6B66",
        structuresoft: "#E4ECE9",
        attention: "#C98A3B",
        attentionsoft: "#F5E9D8",
        line: "#D8D3C8",
        // Matches the UI team's published palette exactly (Ocean Blue
        // #1A5F7A, Sync Purple #7C5CFC, Mint #A6E4D4, Cloud White #F6F9F6).
        // A prior pass here mistakenly used #0D47A1 for "ocean" — that hex is
        // actually the file prototype's --purple/--ocean-deep navy, not the
        // team's real ocean teal; #0D47A1 is still correct where it's used
        // for the navy→purple/navy→amber gradients elsewhere (cv-wizard.tsx,
        // profile-view.tsx, opengraph-image.tsx), which intentionally use the
        // deeper navy as one gradient stop, not this token.
        ocean: {
          DEFAULT: "#1A5F7A",
          50: "#EAF3F5",
          100: "#CBE1E7",
          600: "#1A5F7A",
          700: "#134A60",
        },
        "sync-purple": {
          DEFAULT: "#7C5CFC",
          50: "#F1EEFF",
          100: "#E4DEFF",
          600: "#7C5CFC",
          700: "#6642E0",
        },
        mint: {
          DEFAULT: "#A6E4D4",
          50: "#EEFBF8",
          100: "#DBF6EF",
          600: "#3FA98A",
        },
        cloud: "#F6F9F6",
        "text-dark": "#172033",
        "text-gray": "#667085",
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        heading: ["var(--font-heading)", "ui-sans-serif", "system-ui"],
        "candidate-mono": ["var(--candidate-font-mono)", "ui-monospace", "monospace"],
        "candidate-sans": ["var(--candidate-font-body)", "ui-sans-serif", "system-ui"],
        "candidate-heading": ["var(--candidate-font-heading)", "ui-sans-serif", "system-ui"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(23, 32, 51, 0.04), 0 4px 16px -4px rgba(23, 32, 51, 0.08)",
        "card-lg": "0 2px 4px 0 rgba(23, 32, 51, 0.04), 0 12px 32px -8px rgba(23, 32, 51, 0.12)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "dash-flow": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "24px 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        scan: "scan 1.4s ease-in-out infinite",
        "fade-up": "fade-up 0.35s ease-out both",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
        "dash-flow": "dash-flow 1.2s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
