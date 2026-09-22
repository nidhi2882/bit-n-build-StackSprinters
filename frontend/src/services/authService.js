// Pre-seeded local accounts matching backend DataInitializer for standalone Vercel deployment
const SEEDED_USERS = {
    "david.chandler@resqgrid.gov": { id: "usr_super", name: "David Chandler", email: "david.chandler@resqgrid.gov", role: "Super Admin", departmentCategory: null },
    "superadmin@resqgrid.gov": { id: "usr_super2", name: "Super Admin Control", email: "superadmin@resqgrid.gov", role: "Super Admin", departmentCategory: null },
    "flood.admin@resqgrid.gov": { id: "usr_flood", name: "Commander Rajesh Rao", email: "flood.admin@resqgrid.gov", role: "Department Admin", departmentCategory: "FLOOD" },
    "fire.admin@resqgrid.gov": { id: "usr_fire", name: "Captain Suresh Kumar", email: "fire.admin@resqgrid.gov", role: "Department Admin", departmentCategory: "FIRE" },
    "medical.admin@resqgrid.gov": { id: "usr_med", name: "Dr. Sunita Patel", email: "medical.admin@resqgrid.gov", role: "Department Admin", departmentCategory: "MEDICAL" },
    "crash.admin@resqgrid.gov": { id: "usr_crash", name: "Chief Devendra Joshi", email: "crash.admin@resqgrid.gov", role: "Department Admin", departmentCategory: "CRASH" },
    "hazmat.admin@resqgrid.gov": { id: "usr_hazmat", name: "Dr. Priya Nair", email: "hazmat.admin@resqgrid.gov", role: "Department Admin", departmentCategory: "HAZMAT" },
    "collapse.admin@resqgrid.gov": { id: "usr_collapse", name: "Major Vikram Singh", email: "collapse.admin@resqgrid.gov", role: "Department Admin", departmentCategory: "COLLAPSE" },
    "cyclone.admin@resqgrid.gov": { id: "usr_cyclone", name: "Director Anil Verma", email: "cyclone.admin@resqgrid.gov", role: "Department Admin", departmentCategory: "CYCLONE" },
    "rescue.admin@resqgrid.gov": { id: "usr_rescue", name: "Captain Ankit Mehta", email: "rescue.admin@resqgrid.gov", role: "Department Admin", departmentCategory: "SEARCH_RESCUE" },
    "police.admin@resqgrid.gov": { id: "usr_police", name: "Inspector Ramesh Patel", email: "police.admin@resqgrid.gov", role: "Department Admin", departmentCategory: "POLICE" },
    "citizen@resqgrid.gov": { id: "usr_citizen1", name: "Aarav Patel", email: "citizen@resqgrid.gov", role: "Citizen", departmentCategory: null },
    "citizen@resqgrid.org": { id: "usr_citizen2", name: "Aarav Patel", email: "citizen@resqgrid.org", role: "Citizen", departmentCategory: null }
};

export const authService = {
    // Login user with email/password (with instant local fallback when backend is unreachable)
    login: async (credentials) => {
        try {
            const response = await apiClient.post("/auth/login", credentials);
            const { token, user } = response.data;
            if (token) localStorage.setItem("token", token);
            if (user) localStorage.setItem("user", JSON.stringify(user));
            return { token, user };
        } catch (error) {
            console.warn("Backend API /auth/login unreachable or timing out. Authenticating via local seed credentials.");
            
            const emailKey = (credentials?.email || "").toLowerCase().trim();
            const matched = SEEDED_USERS[emailKey];

            const fallbackUser = matched || {
                id: `usr_demo_${Date.now()}`,
                name: emailKey.split("@")[0] || "Command Operator",
                email: emailKey || "operator@resqgrid.gov",
                role: credentials?.role || "Emergency Operator",
                departmentCategory: credentials?.departmentCategory || null
            };

            const fallbackToken = `demo-token-${Date.now()}`;
            localStorage.setItem("token", fallbackToken);
            localStorage.setItem("user", JSON.stringify(fallbackUser));
            return { token: fallbackToken, user: fallbackUser };
        }
    },

    // Register new user with role selection (with instant local fallback)
    register: async (userData) => {
        try {
            const response = await apiClient.post("/auth/register", userData);
            const { token, user } = response.data;
            if (token) localStorage.setItem("token", token);
            if (user) localStorage.setItem("user", JSON.stringify(user));
            return { token, user };
        } catch (error) {
            console.warn("Backend API /auth/register unreachable. Creating local user session.");
            const registeredUser = {
                id: `usr_${Date.now()}`,
                name: userData.name || "ResQGrid User",
                email: userData.email,
                role: userData.role || "Citizen",
                departmentCategory: userData.departmentCategory || null
            };
            const mockToken = `demo-token-${Date.now()}`;
            localStorage.setItem("token", mockToken);
            localStorage.setItem("user", JSON.stringify(registeredUser));
            return { token: mockToken, user: registeredUser };
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
