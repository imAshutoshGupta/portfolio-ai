import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // All values resolve through CSS variables set per-theme in globals.css.
        base: "rgb(var(--c-base) / <alpha-value>)",
        raise: "rgb(var(--c-raise) / <alpha-value>)",
        ink: "rgb(var(--c-ink) / <alpha-value>)",
        muted: "rgb(var(--c-muted) / <alpha-value>)",
        line: "rgb(var(--c-ink) / 0.09)",
        onaccent: "rgb(var(--c-on-accent) / <alpha-value>)",
        accent: {
          DEFAULT: "rgb(var(--c-accent) / <alpha-value>)",
          b: "rgb(var(--c-accent-b) / <alpha-value>)",
          dim: "rgb(var(--c-accent) / 0.14)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      maxWidth: {
        site: "84rem",
      },
      borderRadius: {
        card: "1.25rem",
      },
      boxShadow: {
        // Soft accent halo for hovered/primary surfaces.
        glow: "0 0 0 1px rgb(var(--c-accent) / 0.22), 0 8px 48px -16px rgb(var(--c-accent) / 0.30)",
        // Elevation cast by the site's key light — theme-aware via token.
        lift: "0 16px 48px -20px var(--shadow-elev)",
        // 1px top highlight that reads as machined glass.
        inner: "inset 0 1px 0 rgb(var(--c-ink) / 0.05)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      spacing: {
        // Section rhythm tokens — use py-section / py-section-sm, not ad-hoc values.
        section: "10rem",
        "section-sm": "7rem",
      },
    },
  },
  plugins: [],
};

export default config;
