/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        "surface-muted": token("surface-muted"),
        border: token("border"),
        text: token("text"),
        "text-secondary": token("text-secondary"),
        primary: token("primary"),
        "primary-text": token("primary-text"),
        "on-primary": token("on-primary"),
        danger: token("danger"),
        warning: token("warning"),
        success: token("success"),
      },
      fontFamily: {
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: { card: "16px" },
      boxShadow: {
        card: "0 1px 2px rgb(var(--shadow) / 0.06), 0 8px 24px rgb(var(--shadow) / 0.07)",
        glow: "0 20px 60px -20px rgb(var(--primary) / 0.45)",
      },
    },
  },
  plugins: [],
};
