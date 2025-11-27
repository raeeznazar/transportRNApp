import { useState } from "react";
import apiClient from "../services/apiService";

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { method = "GET", data = null, params = null, headers = {} } = options;

      const config = {
        url: endpoint,
        method,
        data,
        params,
        headers: { "Content-Type": "application/json", ...headers },
      };

      // Debug: show exact request config being sent
      console.debug("API Request:", {
        url: config.url,
        method: config.method,
        data: config.data,
        params: config.params,
        headers: config.headers,
      });

      const response = await apiClient(config);
      setLoading(false);

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (err) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
        status: err.response?.status,
      };
    }
  };

  return {
    apiCall,
    loading,
    error,
    clearError: () => setError(null),
  };
};
