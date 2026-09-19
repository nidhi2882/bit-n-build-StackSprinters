import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div style={{ color: "#fff", padding: "40px", textAlign: "center" }}>Loading Authentication Context...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their assigned default dashboard if role not allowed
        switch (user.role) {
            case "Citizen":
                return <Navigate to="/report" replace />;
            case "Response Team":
                return <Navigate to="/resources" replace />;
            case "Hospital Admin":
                return <Navigate to="/hospitals" replace />;
            case "Authority Admin":
                return <Navigate to="/analytics" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
