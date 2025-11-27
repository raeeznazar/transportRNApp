import { create } from "zustand";

/**
 * Auth Store - Manages user authentication state and session data
 *
 * State:
 * - user: User object containing username and other user info
 * - sessionData: Session data including company, branch, financial year info
 * - isAuthenticated: Boolean indicating if user is logged in
 *
 * Actions:
 * - setUser: Set user data
 * - setSessionData: Set session data (from dashboard proceed)
 * - clearAuth: Clear all auth state (on logout)
 * - initializeAuth: Initialize auth state from SecureStore
 */
export const useAuthStore = create((set) => ({
  // State
  user: null,
  sessionData: null,
  isAuthenticated: false,

  // Actions
  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setSessionData: (sessionData) =>
    set({
      sessionData,
    }),

  clearAuth: () =>
    set({
      user: null,
      sessionData: null,
      isAuthenticated: false,
    }),

  initializeAuth: (credentials) =>
    set({
      user: credentials.user || null,
      sessionData: credentials.sessionData || null,
      isAuthenticated: !!(credentials.user && credentials.token),
    }),
}));

// Selector hooks for commonly accessed data
export const useUsername = () => useAuthStore((state) => state.user?.userId || state.user?.username || "");
export const useSectionData = () => useAuthStore((state) => state.sessionData);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
