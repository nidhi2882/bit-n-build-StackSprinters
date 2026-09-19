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
            console.warn("Backend API unreachable. Falling back to mock auth login.");
            // Mock authentication fallback based on role selected or email
            const mockUser = {
                id: "USR-001",
                name: credentials.email ? credentials.email.split("@")[0] : "Demo User",
                email: credentials.email || "operator@resqgrid.org",
                role: credentials.role || "Emergency Operator", // 'Citizen' | 'Emergency Operator' | 'Response Team' | 'Hospital Admin' | 'Authority Admin'
                unitName: credentials.role === "Response Team" ? "NDRF Squad 03" : null,
                hospitalId: credentials.role === "Hospital Admin" ? "HOSP-001" : null
            };
            const mockToken = "mock-jwt-token-" + Date.now();
            localStorage.setItem("token", mockToken);
            localStorage.setItem("user", JSON.stringify(mockUser));
            return { token: mockToken, user: mockUser };
        }
    },

    // Register new user with role selection
    register: async (userData) => {
        try {
            const response = await apiClient.post("/auth/register", userData);
            return response.data;
        } catch (error) {
            console.warn("Backend API unreachable. Falling back to mock auth registration.");
            const newUser = {
                id: `USR-${Date.now()}`,
                name: userData.name,
                email: userData.email,
                role: userData.role || "Citizen",
                unitName: userData.unitName || null,
                hospitalId: userData.hospitalId || null
            };
            const mockToken = "mock-jwt-token-" + Date.now();
            localStorage.setItem("token", mockToken);
            localStorage.setItem("user", JSON.stringify(newUser));
            return { token: mockToken, user: newUser };
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
