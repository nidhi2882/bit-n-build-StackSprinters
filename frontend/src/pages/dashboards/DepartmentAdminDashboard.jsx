import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DepartmentIncidentConsole from "../department/DepartmentIncidentConsole";

export default function DepartmentAdminDashboard({ categoryOverride = null }) {
    const { category: routeCategory } = useParams();
    const { user } = useAuth();

    // Priority: prop override > route param (:category) > user's assigned departmentCategory > "FLOOD"
    const resolvedCategory =
        categoryOverride ||
        routeCategory ||
        user?.departmentCategory ||
        "FLOOD";

    return <DepartmentIncidentConsole departmentKey={resolvedCategory} />;
}
