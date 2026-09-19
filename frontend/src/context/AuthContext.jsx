import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedUser = authService.getCurrentUser();
            const storedToken = localStorage.getItem("token");
            if (storedUser && storedToken && !storedToken.startsWith("demo-token-") && !storedToken.startsWith("mock-jwt-")) {
                setUser(storedUser);
                setToken(storedToken);
                setLoading(false);
            } else {
                try {
                    const result = await authService.login({
                        email: "operator@resqgrid.gov",
                        password: "operator123",
                        role: "Emergency Operator"
                    });
                    setUser(result.user);
                    setToken(result.token);
                } catch (e) {
                    const defaultDemo = {
                        id: "USR-001",
                        name: "Command Operator",
                        email: "operator@resqgrid.gov",
                        role: "Emergency Operator"
                    };
                    setUser(defaultDemo);
                } finally {
                    setLoading(false);
                }
            }
        };
        initAuth();
    }, []);

    const login = async (credentials) => {
        const result = await authService.login(credentials);
        setUser(result.user);
        setToken(result.token);
        return result.user;
    };

    const register = async (userData) => {
        const result = await authService.register(userData);
        setUser(result.user);
        setToken(result.token);
        return result.user;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setToken(null);
    };

    // Role switcher authenticating directly with seeded real users
    const switchRoleDemo = async (newRole) => {
        let email = "operator@resqgrid.gov";
        let password = "operator123";
        if (newRole === "Response Team") {
            email = "responder@ndrf.gov";
            password = "responder123";
        } else if (newRole === "Hospital Admin") {
            email = "hospital@ssg.org";
            password = "hospital123";
        } else if (newRole === "Authority Admin") {
            email = "authority@vadodara.gov";
            password = "authority123";
        } else if (newRole === "Citizen") {
            email = "citizen@resqgrid.org";
            password = "citizen123";
        }

        try {
            const result = await authService.login({ email, password, role: newRole });
            setUser(result.user);
            setToken(result.token);
        } catch (err) {
            const updated = {
                ...(user || {}),
                role: newRole,
                email,
                unitName: newRole === "Response Team" ? "NDRF Squad 03" : null,
                hospitalId: newRole === "Hospital Admin" ? "HOSP-001" : null
            };
            setUser(updated);
            localStorage.setItem("user", JSON.stringify(updated));
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout,
            switchRoleDemo
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
