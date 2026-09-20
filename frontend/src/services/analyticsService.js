import { apiClient } from "./api";

export const analyticsService = {
    getOverview: async () => {
        const response = await apiClient.get("/analytics/overview");
        return response.data;
    },
    getDepartmentAnalytics: async (dept) => {
        const response = await apiClient.get("/analytics/department", {
            params: dept ? { department: dept } : {}
        });
        return response.data;
    },
    getPercentiles: async () => {
        const response = await apiClient.get("/analytics/percentiles");
        return response.data;
    },
    getHeatmaps: async () => {
        const response = await apiClient.get("/analytics/heatmaps");
        return response.data;
    }
};

export default analyticsService;
