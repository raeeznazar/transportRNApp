/** @type {import('tailwindcss').Config} */
const { theme } = require("./constants/theme");
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.js", "./src/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primaryBg: theme.colors.background,
        background: theme.colors.background,
        error: theme.colors.error,
        primary: theme.colors.primary,
        buttonBackground: theme.colors.buttonBackground,
        buttonText: theme.colors.buttonText,
        cardBg: theme.colors.cardBg,
        textPrimary: theme.colors.textPrimary,
        textSecondary: theme.colors.textSecondary,
        borderDark: theme.colors.borderDark,
        borderLight: theme.colors.borderLight,
        inputBackground: theme.colors.inputBackground,
        inputText: theme.colors.inputText,
      },
    },
  },
  plugins: [],
};
