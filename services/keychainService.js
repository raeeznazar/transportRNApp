import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "app_access_token_v1";
const REFRESH_KEY = "app_refresh_token_v1";
const USER_KEY = "app_user_v1";
const SESSION_KEY = "app_session_data_v1";

// Small helpers to avoid throwing on JSON parse/stringify issues
function safeJsonParse(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (err) {
    console.error("safeJsonParse failed:", err, "value:", value);
    return null;
  }
}

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value);
  } catch (err) {
    console.error("safeJsonStringify failed:", err, "value:", value);
    return null;
  }
}

export const SecureStoreService = {
  async saveCredentials({ token, refreshToken, user, sessionData = null || sessionData }) {
    try {
      const savePromises = [];

      if (token) {
        savePromises.push(
          SecureStore.setItemAsync(ACCESS_KEY, token, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED,
          })
        );
      }

      if (refreshToken) {
        savePromises.push(
          SecureStore.setItemAsync(REFRESH_KEY, refreshToken, {
            keychainAccessible: SecureStore.WHEN_UNLOCKED,
          })
        );
      }

      if (user) {
        const userStr = safeJsonStringify(user);
        if (userStr !== null) {
          savePromises.push(
            SecureStore.setItemAsync(USER_KEY, userStr, {
              keychainAccessible: SecureStore.WHEN_UNLOCKED,
            })
          );
        } else {
          console.warn("Skipping saving user: cannot stringify user object");
        }
      }

      if (sessionData) {
        const sessionStr = safeJsonStringify(sessionData);
        if (sessionStr !== null) {
          savePromises.push(
            SecureStore.setItemAsync(SESSION_KEY, sessionStr, {
              keychainAccessible: SecureStore.WHEN_UNLOCKED,
            })
          );
        } else {
          console.warn("Skipping saving sessionData: cannot stringify sessionData");
        }
      }

      // If there is nothing to save, resolve immediately
      if (savePromises.length === 0) return true;

      await Promise.all(savePromises);
      return true;
    } catch (error) {
      console.error("Error saving credentials:", error);
      return false;
    }
  },

  async getToken() {
    try {
      return await SecureStore.getItemAsync(ACCESS_KEY);
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },

  async getRefreshToken() {
    try {
      return await SecureStore.getItemAsync(REFRESH_KEY);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  },

  async getUser() {
    try {
      const userJson = await SecureStore.getItemAsync(USER_KEY);
      return safeJsonParse(userJson);
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  },

  async getSessionData() {
    try {
      const sessionData = await SecureStore.getItemAsync(SESSION_KEY);
      return safeJsonParse(sessionData);
    } catch (error) {
      console.error("Error getting session data:", error);
      return null;
    }
  },

  async getCredentials() {
    try {
      const [token, refreshToken, userJson, sessionDataJson] = await Promise.all([
        SecureStore.getItemAsync(ACCESS_KEY),
        SecureStore.getItemAsync(REFRESH_KEY),
        SecureStore.getItemAsync(USER_KEY),
        SecureStore.getItemAsync(SESSION_KEY),
      ]);

      // Parse user/session safely so a malformed value doesn't make the whole
      // function throw — return parsed values independently.
      const user = safeJsonParse(userJson);
      const sessionData = safeJsonParse(sessionDataJson);
      console.log("Retrieved credentials:", {
        token,
        refreshToken,
        user,
        sessionData,
      });

      return {
        token: token,
        refreshToken: refreshToken,
        user,
        sessionData,
      };
    } catch (error) {
      console.error("Error getting credentials:", error);
      return {
        token: null,
        refreshToken: null,
        user: null,
        sessionData: null,
      };
    }
  },

  async clearCredentials() {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_KEY),
        SecureStore.deleteItemAsync(REFRESH_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
        SecureStore.deleteItemAsync(SESSION_KEY),
      ]);
    } catch (error) {
      console.error("Error clearing credentials:", error);
    }
  },

  async hasCredentials() {
    try {
      const token = await SecureStore.getItemAsync(ACCESS_KEY);
      return !!token;
    } catch (error) {
      console.error("Error checking credentials:", error);
      return false;
    }
  },

  async checkAutoLogin() {
    try {
      // Get stored credentials
      const credentials = await this.getCredentials();

      // Validate credentials (need at minimum token and user)
      const isValid = !!(credentials.token && credentials.user);
      if (isValid && credentials.sessionData) {
        // User has complete session data, can skip company/branch selection
        return {
          success: true,
          hasCompleteSession: true,
          data: credentials,
        };
      } else if (isValid && !credentials.sessionData) {
        // User is logged in but needs to select company/branch/financial year
        return {
          success: true,
          hasCompleteSession: false,
          data: credentials,
        };
      }

      return {
        success: false,
        hasCompleteSession: false,
        error: "No valid credentials found",
      };
    } catch (error) {
      return {
        success: false,
        hasCompleteSession: false,
        error: error.message || "Auto-login failed",
      };
    }
  },
};
