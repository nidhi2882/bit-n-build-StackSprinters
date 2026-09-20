import { apiClient } from "./api";

export const serviceRequestService = {
    getAllRequests: async () => {
        try {
            const response = await apiClient.get("/service-requests");
            return response.data;
        } catch (error) {
            console.warn("Failed to get /service-requests:", error);
            return [];
        }
    },

    getIncomingRequests: async () => {
        try {
            const response = await apiClient.get("/service-requests/incoming");
            return response.data;
        } catch (error) {
            console.warn("Failed to get /service-requests/incoming:", error);
            return [];
        }
    },

    getSentRequests: async () => {
        try {
            const response = await apiClient.get("/service-requests/sent");
            return response.data;
        } catch (error) {
            console.warn("Failed to get /service-requests/sent:", error);
            return [];
        }
    },

    // Alias used by dashboards/consoles that refer to "outgoing" requests
    getOutgoingRequests: async () => {
        return serviceRequestService.getSentRequests();
    },

    createRequest: async (requestData) => {
        const response = await apiClient.post("/service-requests", requestData);
        return response.data;
    },

    acceptRequest: async (requestId, assignedUnitId) => {
        const response = await apiClient.patch(`/service-requests/${requestId}/accept`, { assignedUnitId });
        return response.data;
    },

    declineRequest: async (requestId, declineReason) => {
        const response = await apiClient.patch(`/service-requests/${requestId}/decline`, { declineReason });
        return response.data;
    },

    resolveRequest: async (requestId) => {
        const response = await apiClient.patch(`/service-requests/${requestId}/resolve`, {});
        return response.data;
    },

    // Unified status transition helper used by consoles.
    // Routes ACCEPTED/DECLINED/RESOLVED to the correct backend endpoint.
    updateStatus: async (requestId, status, extra = {}) => {
        const normalized = (status || "").toUpperCase();
        if (normalized === "ACCEPTED") {
            return serviceRequestService.acceptRequest(requestId, extra.assignedUnitId || null);
        }
        if (normalized === "DECLINED") {
            return serviceRequestService.declineRequest(requestId, extra.declineReason || "Operational units committed");
        }
        if (normalized === "RESOLVED") {
            return serviceRequestService.resolveRequest(requestId);
        }
        throw new Error(`Unsupported service request status transition: ${status}`);
    }
};
