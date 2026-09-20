import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const storedUser = authService.getCurrentUser();
            const storedToken = localStorage.getItem("token");
            if (storedUser && storedToken && !storedToken.startsWith("demo-token-") && !storedToken.startsWith("mock-jwt-")) {
                setUser(storedUser);
                setToken(storedToken);
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                setToken(null);
            }
            setLoading(false);
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

        const result = await authService.login({ email, password, role: newRole });
        setUser(result.user);
        setToken(result.token);
        return result.user;
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
