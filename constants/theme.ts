export const steelBlueTheme = {
  colors: {
    // 🌤 App Background
    appBg: "#F4F6F8", // Very light steel-gray-blue
    // 🔵 Steel Blues
    primary: "#1E3A8A", // Steel Blue
    secondary: "#3F4C6E", // Muted Slate Blue
    accent: "#64748B", // Cool gray-blue
    // 🚦 Alerts
    danger: "#DC2626",
    success: "#059669",
    // 📝 Text
    headingText: "#1E293B", // Deep slate
    subHeadingText: "#334155",
    bodyText: "#475569",
    // 🧭 Header
    headerBg: "#1E293B", // Dark slate-blue
    headerText: "#FFFFFF",
    // 🔤 Inputs
    inputBg: "#FFFFFF",
    inputBorder: "#94A3B8", // Gray-blue
    inputText: "#1E293B",
    inputPlaceholder: "#64748B",
    // 🗂 Cards
    cardBg: "#FFFFFF",
    cardBorder: "#CBD5E1", // Light desaturated blue-gray
    cardHeading: "#1E293B",
    cardText: "#475569",
    // 🔘 Buttons
    buttonPrimaryBg: "#1E3A8A", // Steel Blue
    buttonPrimaryText: "#FFFFFF",

    buttonSecondaryBg: "#E2E8F0", // Soft cold gray
    buttonSecondaryText: "#334155",
    buttonSecondaryBorder: "#94A3B8",

    buttonDangerBg: "#DC2626",
    buttonDangerText: "#FFFFFF",

    buttonDisabledBg: "#CBD5E1",
    buttonDisabledText: "#FFFFFF",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};
export const modernBlueTheme = {
  colors: {
    // 🌤 App Background
    appBg: "#F3F6FA", // Light bluish-white

    // 🔵 Primary Brand Colors
    primary: "#1D4ED8", // Strong modern blue (primary)
    secondary: "#3B82F6", // Bright soft blue
    accent: "#60A5FA", // Light accent blue

    // 🔺 Alerts
    danger: "#DC2626", // Red for delete/error
    success: "#059669", // Green for success

    // 📝 Text Colors
    headingText: "#0F172A", // Dark navy (for titles)
    subHeadingText: "#1E3A8A", // Deep blue (subtitles)
    bodyText: "#475569", // Slate gray (body text)

    // 🧭 Header
    headerBg: "#1E3A8A", // Deep blue header
    headerText: "#FFFFFF",

    // 🔤 Inputs
    inputBg: "#FFFFFF",
    inputBorder: "#93C5FD", // Soft blue border
    inputText: "#0F172A",
    inputPlaceholder: "#64748B",

    // 🗂 Cards
    cardBg: "#FFFFFF",
    cardBorder: "#E2E8F0", // Light gray-blue border
    cardHeading: "#0F172A",
    cardText: "#475569",

    // 🔘 BUTTONS
    buttonPrimaryBg: "#1D4ED8", // Same as primary
    buttonPrimaryText: "#FFFFFF",

    buttonSecondaryBg: "#DBEAFE", // Light sky-blue
    buttonSecondaryText: "#1E3A8A", // Deep blue
    buttonSecondaryBorder: "#93C5FD",

    buttonDangerBg: "#DC2626",
    buttonDangerText: "#FFFFFF",

    buttonDisabledBg: "#CBD5E1", // Slate blue-gray
    buttonDisabledText: "#FFFFFF",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};
export const darkSlateTheme = {
  colors: {
    appBg: "#F1F3F5",

    primary: "#0F172A", // Deep slate navy
    secondary: "#334155", // Slate gray-blue
    accent: "#0EA5E9", // Cyan accent

    danger: "#DC2626",
    success: "#0D9488",

    headingText: "#0F172A",
    subHeadingText: "#1E293B",
    bodyText: "#334155",

    headerBg: "#0F172A",
    headerText: "#FFFFFF",

    inputBg: "#FFFFFF",
    inputBorder: "#94A3B8",
    inputText: "#0F172A",
    inputPlaceholder: "#64748B",

    cardBg: "#FFFFFF",
    cardBorder: "#DCE3EA",
    cardHeading: "#0F172A",
    cardText: "#334155",

    buttonPrimaryBg: "#0F172A",
    buttonPrimaryText: "#FFFFFF",

    buttonSecondaryBg: "#E2E8F0",
    buttonSecondaryText: "#0F172A",
    buttonSecondaryBorder: "#94A3B8",

    buttonDangerBg: "#DC2626",
    buttonDangerText: "#FFFFFF",

    buttonDisabledBg: "#CBD5E1",
    buttonDisabledText: "#FFFFFF",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};

export const themes = {
  steelBlue: steelBlueTheme,
  modernBlue: modernBlueTheme,
  darkSlate: darkSlateTheme,
};

// For backward compatibility
export const theme = steelBlueTheme;
