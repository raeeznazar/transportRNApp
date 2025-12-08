import { useNavigation } from "@react-navigation/native";
import { useEffect } from "react";
import { useAuthStore, useIsAuthenticated, useSectionData } from "../stores/authStore";

/**
 * Auth Guard Hook - Protects routes based on auth state
 *
 * @param {Object} options
 * @param {boolean} options.requireUser - Requires user to be logged in
 * @param {boolean} options.requireSession - Requires session data (section data)
 * @param {string} options.redirectTo - Where to redirect if requirements not met
 */
export const useAuthGuard = ({ requireUser = false, requireSession = false, redirectTo = "Login" } = {}) => {
  const navigation = useNavigation();
  const isAuthenticated = useIsAuthenticated();
  const sessionData = useSectionData();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // Check if user is required but not present
      if (requireUser && !user) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
        return;
      }

      // Check if session data is required but not present
      if (requireSession && !sessionData) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Setup" }],
        });
        return;
      }

      // If redirectTo is specified and conditions are met, redirect
      if (redirectTo && user && sessionData && (redirectTo === "Login" || redirectTo === "Setup")) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });
      }
    });

    return unsubscribe;
  }, [navigation, user, sessionData, requireUser, requireSession, redirectTo]);

  return {
    isAuthenticated,
    hasSession: !!sessionData,
    hasUser: !!user,
    canAccess: requireSession ? !!sessionData && !!user : requireUser ? !!user : true,
  };
};
