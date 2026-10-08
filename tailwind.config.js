/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          50: "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36abf7",
          500: "#0c8ee9",
          600: "#0171c7",
          700: "#025aa2",
          800: "#064c85",
          900: "#0b406f",
          950: "#082849",
        },
        upi: {
          green: "#0f8e5b",
          orange: "#ed6c02",
          blue: "#1a56db",
        }
      },
    },
  },
  plugins: [],
};
