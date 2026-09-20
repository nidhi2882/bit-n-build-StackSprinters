import { apiClient } from "./api";

export const authService = {
    // Login user with email/password
    login: async (credentials) => {
        try {
            const response = await apiClient.post("/auth/login", credentials);
            const { token, user } = response.data;
            if (token) localStorage.setItem("token", token);
            if (user) localStorage.setItem("user", JSON.stringify(user));
            return { token, user };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Authentication failed. Please check your credentials.";
            throw new Error(errorMsg);
        }
    },

    // Register new user with role selection
    register: async (userData) => {
        try {
            const response = await apiClient.post("/auth/register", userData);
            const { token, user } = response.data;
            if (token) localStorage.setItem("token", token);
            if (user) localStorage.setItem("user", JSON.stringify(user));
            return { token, user };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data?.error || "Registration failed. Please try again.";
            throw new Error(errorMsg);
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    // Get current stored user
    getCurrentUser: () => {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    }
};
