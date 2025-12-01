import { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useThemeStore } from "../stores/themeStore";

// ---------- Base tokens (fallbacks if theme misses values) ----------
const defaultSpacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
const defaultRadius = {
  sm: 4,
  md: 8,
  lg: 12,
};
const fontSizeScale = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  "2xl": 20,
  "3xl": 24,
  "4xl": 28,
};

// Common colors available in all themes
const commonColors = {
  transparent: "transparent",
  white: "#ffffff",
  black: "#000000",
  // Neutral gray scale
  "gray-50": "#f9fafb",
  "gray-100": "#f3f4f6",
  "gray-200": "#e5e7eb",
  "gray-300": "#d1d5db",
  "gray-400": "#9ca3af",
  "gray-500": "#6b7280",
  "gray-600": "#4b5563",
  "gray-700": "#374151",
  "gray-800": "#1f2937",
  "gray-900": "#111827",
};

// ---------- Static, non-theme base utilities ----------
const base = {
  // Layout / Flex
  flex: { flex: 1 },
  "flex-1": { flex: 1 },
  "flex-none": { flex: 0 },
  "flex-row": { flexDirection: "row" },
  "flex-col": { flexDirection: "column" },
  "flex-wrap": { flexWrap: "wrap" },

  "items-start": { alignItems: "flex-start" },
  "items-center": { alignItems: "center" },
  "items-end": { alignItems: "flex-end" },
  "items-stretch": { alignItems: "stretch" },

  "justify-start": { justifyContent: "flex-start" },
  "justify-center": { justifyContent: "center" },
  "justify-end": { justifyContent: "flex-end" },
  "justify-between": { justifyContent: "space-between" },
  "justify-around": { justifyContent: "space-around" },
  "justify-evenly": { justifyContent: "space-evenly" },

  "self-start": { alignSelf: "flex-start" },
  "self-center": { alignSelf: "center" },
  "self-end": { alignSelf: "flex-end" },
  "self-stretch": { alignSelf: "stretch" },

  // Display
  hidden: { display: "none" },
  block: { display: "flex" },

  // Text alignment & decoration
  "text-left": { textAlign: "left" },
  "text-center": { textAlign: "center" },
  "text-right": { textAlign: "right" },

  underline: { textDecorationLine: "underline" },
  "line-through": { textDecorationLine: "line-through" },
  "no-underline": { textDecorationLine: "none" },

  // Font weight
  "font-thin": { fontWeight: "100" },
  "font-extralight": { fontWeight: "200" },
  "font-light": { fontWeight: "300" },
  "font-normal": { fontWeight: "400" },
  "font-medium": { fontWeight: "500" },
  "font-semibold": { fontWeight: "600" },
  "font-bold": { fontWeight: "700" },
  "font-extrabold": { fontWeight: "800" },
  "font-black": { fontWeight: "900" },

  // Line height helpers
  "leading-none": { lineHeight: 1 },
  "leading-tight": { lineHeight: 1.1 },
  "leading-snug": { lineHeight: 1.2 },
  "leading-normal": { lineHeight: 1.4 },
  "leading-relaxed": { lineHeight: 1.6 },

  // Width / Height
  "w-full": { width: "100%" },
  "h-full": { height: "100%" },

  // Position
  relative: { position: "relative" },
  absolute: { position: "absolute" },

  // Shadows
  "shadow-sm": {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  "shadow-lg": {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },

  // Border widths
  "border-0": { borderWidth: 0 },
  border: { borderWidth: 1 },
  "border-2": { borderWidth: 2 },
  "border-4": { borderWidth: 4 },
  "border-b": { borderBottomWidth: 1 },
  "border-t": { borderTopWidth: 1 },
  "border-l": { borderLeftWidth: 1 },
  "border-r": { borderRightWidth: 1 },
};

// Map theme color keys to friendly tokens (bg-*, text-*, border-*)
const themeColorTokenMap: Record<string, string> = {
  appBg: "app",
  primary: "primary",
  secondary: "secondary",
  accent: "accent",
  danger: "danger",
  success: "success",

  headingText: "heading",
  subHeadingText: "subHeading",
  bodyText: "body",

  headerBg: "header",
  headerText: "headerText",

  inputBg: "input",
  inputBorder: "inputBorder",
  inputText: "inputText",
  inputPlaceholder: "inputPlaceholder",

  cardBg: "card",
  cardBorder: "cardBorder",
  cardHeading: "cardHeading",
  cardText: "cardText",

  buttonPrimaryBg: "buttonPrimary",
  buttonPrimaryText: "buttonPrimaryText",
  buttonSecondaryBg: "buttonSecondary",
  buttonSecondaryText: "buttonSecondaryText",
  buttonSecondaryBorder: "buttonSecondaryBorder",
  buttonDangerBg: "buttonDanger",
  buttonDangerText: "buttonDangerText",
  buttonDisabledBg: "buttonDisabled",
  buttonDisabledText: "buttonDisabledText",
};

// Build spacing utilities (numeric and semantic keys)
function buildSpacing(dynamic: Record<string, any>, spacing: Record<string, number>) {
  // Numeric scale (tailwind-ish) – keep a compact set
  const numberScale: Record<string, number> = {
    "0": 0,
    "0.5": 2,
    "1": 4,
    "1.5": 6,
    "2": 8,
    "2.5": 10,
    "3": 12,
    "3.5": 14,
    "4": 16,
    "5": 20,
    "6": 24,
    "7": 28,
    "8": 32,
    "9": 36,
    "10": 40,
  };

  const addSpaceKey = (key: string, val: number) => {
    dynamic[`p-${key}`] = { padding: val };
    dynamic[`px-${key}`] = { paddingHorizontal: val };
    dynamic[`py-${key}`] = { paddingVertical: val };
    dynamic[`pt-${key}`] = { paddingTop: val };
    dynamic[`pr-${key}`] = { paddingRight: val };
    dynamic[`pb-${key}`] = { paddingBottom: val };
    dynamic[`pl-${key}`] = { paddingLeft: val };

    dynamic[`m-${key}`] = { margin: val };
    dynamic[`mx-${key}`] = { marginHorizontal: val };
    dynamic[`my-${key}`] = { marginVertical: val };
    dynamic[`mt-${key}`] = { marginTop: val };
    dynamic[`mr-${key}`] = { marginRight: val };
    dynamic[`mb-${key}`] = { marginBottom: val };
    dynamic[`ml-${key}`] = { marginLeft: val };
  };

  // Numeric
  Object.entries(numberScale).forEach(([k, v]) => addSpaceKey(k, v));
  // Semantic from theme: p-xs, p-sm, ...
  Object.entries(spacing).forEach(([k, v]) => addSpaceKey(k, v as number));
}

// Build radius utilities from theme
function buildRadius(dynamic: Record<string, any>, radius: Record<string, number>) {
  const scale = {
    none: 0,
    ...radius,
    xl: Math.max(radius.lg ?? 12, 16),
    "2xl": Math.max(radius.lg ?? 12, 20),
    full: 9999,
  };

  Object.entries(scale).forEach(([name, r]) => {
    dynamic[`rounded-${name}`] = { borderRadius: r as number };
    dynamic[`rounded-t-${name}`] = { borderTopLeftRadius: r as number, borderTopRightRadius: r as number };
    dynamic[`rounded-b-${name}`] = { borderBottomLeftRadius: r as number, borderBottomRightRadius: r as number };
    dynamic[`rounded-l-${name}`] = { borderTopLeftRadius: r as number, borderBottomLeftRadius: r as number };
    dynamic[`rounded-r-${name}`] = { borderTopRightRadius: r as number, borderBottomRightRadius: r as number };
  });
}

// Build font-size utilities
function buildFontSizes(dynamic: Record<string, any>) {
  Object.entries(fontSizeScale).forEach(([name, size]) => {
    dynamic[`text-${name}`] = { fontSize: size as number };
  });
}

// Build color utilities from theme + common colors
function buildColors(dynamic: Record<string, any>, themeColors: Record<string, string>) {
  // Map theme semantic keys to concise tokens
  const themed: Record<string, string> = {};
  Object.entries(themeColorTokenMap).forEach(([themeKey, token]) => {
    if (themeColors[themeKey]) {
      themed[token] = themeColors[themeKey];
    }
  });

  // Merge order: themed -> theme raw keys (expose both) -> common
  const merged: Record<string, string> = {
    ...themed,
    ...themeColors, // allows bg-primary if theme has primary, etc.
    ...commonColors,
  };

  Object.entries(merged).forEach(([name, value]) => {
    dynamic[`bg-${name}`] = { backgroundColor: value };
    dynamic[`text-${name}`] = { color: value };
    dynamic[`border-${name}`] = { borderColor: value };
  });
}

// Create a StyleSheet for a given theme object
function createDesignSystem(theme: any) {
  const dynamic: Record<string, any> = { ...base };

  const spacing = theme?.spacing ?? defaultSpacing;
  const radius = theme?.borderRadius ?? defaultRadius;
  const colors = theme?.colors ?? {};

  buildSpacing(dynamic, spacing);
  buildRadius(dynamic, radius);
  buildFontSizes(dynamic);
  buildColors(dynamic, colors);

  const ds = StyleSheet.create(dynamic);

  function tw(classes: string | string[], extraStyle?: any) {
    const list = Array.isArray(classes) ? classes : String(classes).split(/\s+/).filter(Boolean);

    const out: any[] = [];
    for (const key of list) {
      const style = (ds as any)[key];
      if (!style) {
        if (__DEV__) {
          console.warn(`[tw] Unknown style key: "${key}"`);
        }
        continue;
      }
      out.push(style);
    }
    if (extraStyle) out.push(extraStyle);
    return out;
  }

  return { ds, tw };
}

// Public hook to consume the current themed DS
export function useDesignSystem() {
  const theme = useThemeStore((s: any) => s.theme);
  const name = useThemeStore((s: any) => s.currentTheme);

  return useMemo(() => createDesignSystem(theme), [name, theme]);
}

// Convenience export when you need only tw()
export function useTW() {
  const { tw } = useDesignSystem();
  return tw;
}
