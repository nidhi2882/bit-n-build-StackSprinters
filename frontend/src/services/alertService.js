import { apiClient } from "./api";

/**
 * Alert / notification service.
 * Backend returns department-scoped active alerts (see AlertService.getScopedActiveAlerts),
 * so each admin only receives notifications routed to their own department.
 */
export const alertService = {
    getActiveAlerts: async () => {
        try {
            const response = await apiClient.get("/alerts");
            return response.data || [];
        } catch (error) {
            console.warn("Backend API /alerts unreachable.", error);
            return [];
        }
    },

    dismissAlert: async (alertId) => {
        try {
            const response = await apiClient.post(`/alerts/${alertId}/dismiss`);
            return response.data;
        } catch (error) {
            console.warn("Backend API dismiss alert unreachable.", error);
            return { success: false };
        }
    }
};

/**
 * Maps a backend Alert entity to the NotificationPanel UI shape and its tab category.
 */
export function mapAlertToNotification(alert) {
    const type = (alert.type || "").toUpperCase();

    let uiType = "system";
    let icon = "notifications";

    if (type.includes("CRITICAL") || type === "ESCALATION" || type === "CRITICAL_ESCALATION") {
        uiType = "critical";
        icon = "priority_high";
    } else if (type.includes("SERVICE_REQUEST") || type.includes("MUTUAL")) {
        uiType = "requests";
        icon = "swap_horiz";
    } else if (type.includes("SLA")) {
        uiType = "sla";
        icon = "timer";
    } else if (type === "NEW_INCIDENT") {
        uiType = "critical";
        icon = "warning";
    } else if (type === "RECLASSIFIED_INCIDENT") {
        uiType = "system";
        icon = "tune";
    }

    return {
        id: alert.id,
        type: uiType,
        title: alert.title || "Operational Alert",
        body: alert.message || alert.actionRequired || "",
        time: alert.time || "Recent",
        cad: alert.incidentId || alert.targetDepartment || "CAD",
        location: alert.targetDepartment || "CAD Core",
        icon,
        unread: alert.active !== false
    };
}

export default alertService;
