import { apiClient } from "./api";
import { mockResources } from "../mock/mockResources";

export const resourceService = {
    getResources: async (department = null) => {
        try {
            const url = department ? `/units?department=${encodeURIComponent(department)}` : "/units";
            const response = await apiClient.get(url);
            return response.data;
        } catch (error) {
            console.warn("API /units failed, falling back to mockResources:", error);
            return mockResources;
        }
    },

    getUnits: async (department = null) => {
        return resourceService.getResources(department);
    },

    createUnit: async (unitData) => {
        const response = await apiClient.post("/units", unitData);
        return response.data;
    },

    updateUnit: async (id, unitData) => {
        const response = await apiClient.put(`/units/${id}`, unitData);
        return response.data;
    },

    deleteUnit: async (id) => {
        const response = await apiClient.delete(`/units/${id}`);
        return response.data;
    },

    updateStatus: async (resourceId, status) => {
        try {
            const response = await apiClient.patch(`/units/${resourceId}/status`, { status });
            return response.data;
        } catch (error) {
            // Also try /resources
            const response = await apiClient.patch(`/resources/${resourceId}/status`, { status });
            return response.data;
        }
    }
};
