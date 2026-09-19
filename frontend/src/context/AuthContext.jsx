import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = authService.getCurrentUser();
        const storedToken = localStorage.getItem("token");
        if (storedUser && storedToken) {
            setUser(storedUser);
            setToken(storedToken);
        } else {
            // Default demo login as Emergency Operator if none exists
            const defaultDemo = {
                id: "USR-001",
                name: "Command Operator",
                email: "operator@resqgrid.org",
                role: "Emergency Operator"
            };
            setUser(defaultDemo);
            setToken("demo-token-operator");
            localStorage.setItem("user", JSON.stringify(defaultDemo));
            localStorage.setItem("token", "demo-token-operator");
        }
        setLoading(false);
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

    // Quick demo role switcher
    const switchRoleDemo = (newRole) => {
        if (!user) return;
        const updated = {
            ...user,
            role: newRole,
            unitName: newRole === "Response Team" ? "NDRF Squad 03" : null,
            hospitalId: newRole === "Hospital Admin" ? "HOSP-001" : null
        };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
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
