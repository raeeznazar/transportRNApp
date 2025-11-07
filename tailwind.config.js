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
        alertColor: theme.colors.alertColor,
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg: ["18px", { lineHeight: "28px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "40px" }],
        "5xl": ["48px", { lineHeight: "1" }],
        "6xl": ["60px", { lineHeight: "1" }],
      },
    },
  },
  plugins: [],
};
