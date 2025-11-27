import { SecureStoreService } from "../services/keychainService";
import { useAuthStore } from "./authStore";

/**
 * Initialize the Zustand store with data from SecureStore
 * This should be called once when the app starts
 *
 * @returns {Promise<{success: boolean, hasCompleteSession: boolean}>}
 */
export const initializeAuthStore = async () => {
  try {
    // Get credentials from secure storage
    const credentials = await SecureStoreService.getCredentials();

    // Initialize the store with the credentials
    useAuthStore.getState().initializeAuth(credentials);

    // Check if we have a complete session
    const hasCompleteSession = !!(credentials.token && credentials.user && credentials.sessionData);

    return {
      success: true,
      hasCompleteSession,
      isAuthenticated: !!(credentials.token && credentials.user),
    };
  } catch (error) {
    console.error("Error initializing auth store:", error);
    return {
      success: false,
      hasCompleteSession: false,
      isAuthenticated: false,
    };
  }
};
