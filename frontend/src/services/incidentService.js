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

    // Unassign resource from incident
    unassignResource: async (incidentId, resourceId) => {
        try {
            const response = await apiClient.post(`/incidents/${incidentId}/unassign-resource`, { resourceId });
            return response.data;
        } catch (error) {
            console.warn("Backend API unassign-resource unreachable.");
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
    },

    // Merge duplicate incident into master
    mergeIncidents: async (masterId, duplicateId) => {
        try {
            const response = await apiClient.post("/incidents/merge", { masterId, duplicateId });
            return response.data;
        } catch (error) {
            console.warn("Backend API /incidents/merge unreachable.");
            return { success: true, masterId, duplicateId };
        }
    },

    // Split report out of master incident
    splitReport: async (incidentId, reportId) => {
        try {
            const response = await apiClient.post(`/incidents/${incidentId}/split-report`, { reportId });
            return response.data;
        } catch (error) {
            console.warn("Backend API /incidents/split-report unreachable.");
            return { success: true, incidentId, reportId };
        }
    },

    // Get duplicate suggestions
    getDuplicateSuggestions: async () => {
        try {
            const response = await apiClient.get("/incidents/duplicate-suggestions");
            return response.data;
        } catch (error) {
            console.warn("Backend API /incidents/duplicate-suggestions unreachable.");
            return [];
        }
    },

    // Get multi-factor resource recommendations
    getRecommendations: async (incidentId) => {
        try {
            const response = await apiClient.get(`/incidents/${incidentId}/recommendations`);
            return response.data;
        } catch (error) {
            console.warn("Backend API /incidents/recommendations unreachable.");
            return [];
        }
    }
};
