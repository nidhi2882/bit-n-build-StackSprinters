import { apiClient } from "./api";
import { mockIncidents } from "../mock/mockIncidents";

export const incidentService = {
    // Fetch all incidents
    getIncidents: async () => {
        try {
            const response = await apiClient.get("/incidents");
            return response.data;
        } catch (error) {
            console.warn("Backend API /incidents unreachable. Using mock data.");
            return mockIncidents;
        }
    },

    // Create incident
    createIncident: async (incidentData) => {
        try {
            const response = await apiClient.post("/incidents", incidentData);
            return response.data;
        } catch (error) {
            console.warn("Backend API /incidents create unreachable. Using mock dataset.");
            return {
                id: `INC-2026-0${Math.floor(Math.random() * 90) + 10}`,
                ...incidentData,
                reportedAt: "Just now",
                status: "Reported"
            };
        }
    },

    // Assign resource to incident
    assignResource: async (incidentId, resourceId) => {
        try {
            const response = await apiClient.post(`/incidents/${incidentId}/assign-resource`, { resourceId });
            return response.data;
        } catch (error) {
            console.warn("Backend API assign-resource unreachable.");
            return { success: true, incidentId, resourceId };
        }
    },

    // Update incident status
    updateStatus: async (incidentId, status) => {
        try {
            const response = await apiClient.patch(`/incidents/${incidentId}/status`, { status });
            return response.data;
        } catch (error) {
            console.warn("Backend API update incident status unreachable.");
            return { success: true, incidentId, status };
        }
    }
};
