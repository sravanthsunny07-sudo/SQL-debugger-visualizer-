/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#0b1220",
        panel: "#111a2e",
        accent: "#f59e0b",
        ink: "#e5eefc",
        muted: "#8ea0bf"
      }
    }
  },
  plugins: []
};
