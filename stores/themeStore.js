import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { themes } from "../constants/theme";

const THEME_KEY = "app_theme_preference";

/**
 * Theme Store - Manages app theme and appearance settings
 *
 * State:
 * - currentTheme: Current theme name ('light', 'dark', 'blue')
 * - theme: Complete theme object with colors, spacing, etc.
 *
 * Actions:
 * - setTheme: Change theme and persist to storage
 * - loadTheme: Load saved theme from storage on app start
 */
export const useThemeStore = create((set) => ({
  // State
  currentTheme: "steelBlue",
  theme: themes.steelBlue,

  // Actions
  setTheme: async (themeName) => {
    try {
      await SecureStore.setItemAsync(THEME_KEY, themeName);
      set({
        currentTheme: themeName,
        theme: themes[themeName],
      });
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  },

  loadTheme: async () => {
    try {
      const savedTheme = await SecureStore.getItemAsync(THEME_KEY);
      if (savedTheme && themes[savedTheme]) {
        set({
          currentTheme: savedTheme,
          theme: themes[savedTheme],
        });
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  },
}));

// Selector hooks
export const useCurrentTheme = () => useThemeStore((state) => state.theme);
export const useThemeName = () => useThemeStore((state) => state.currentTheme);
