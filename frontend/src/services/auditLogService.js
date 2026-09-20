import { apiClient } from "./api";

export const auditLogService = {
    getAuditLogs: async () => {
        try {
            const response = await apiClient.get("/audit-log");
            return response.data;
        } catch (error) {
            console.warn("Failed to fetch /audit-log:", error);
            return [];
        }
    }
};
