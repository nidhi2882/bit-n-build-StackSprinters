import { apiClient } from "./api";
import { mockResources } from "../mock/mockResources";

export const resourceService = {
    getResources: async () => {
        try {
            const response = await apiClient.get("/resources");
            return response.data;
        } catch (error) {
            return mockResources;
        }
    },

    updateStatus: async (resourceId, status) => {
        try {
            const response = await apiClient.patch(`/resources/${resourceId}/status`, { status });
            return response.data;
        } catch (error) {
            return { success: true, resourceId, status };
        }
    }
};
