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
        base: "#0A0A0B",
        raise: "#121214",
        ink: "#EDEDEF",
        muted: "#8A8A93",
        line: "rgba(237, 237, 239, 0.08)",
        accent: {
          DEFAULT: "#E2B25A",
          dim: "rgba(226, 178, 90, 0.14)",
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
        glow: "0 0 0 1px rgba(226, 178, 90, 0.22), 0 8px 48px -16px rgba(226, 178, 90, 0.28)",
        // Neutral elevation for lifted cards.
        lift: "0 16px 48px -20px rgba(0, 0, 0, 0.65)",
        // 1px top highlight that reads as machined glass.
        inner: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
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
