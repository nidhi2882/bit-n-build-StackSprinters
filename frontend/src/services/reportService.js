import { apiClient } from "./api";

export const reportService = {
    submitReport: async (reportData) => {
        const response = await apiClient.post("/reports", reportData);
        return response.data;
    },

    triggerSos: async (sosData) => {
        const response = await apiClient.post("/reports/sos", sosData);
        return response.data;
    },

    getMyReports: async () => {
        const response = await apiClient.get("/reports/mine");
        return response.data;
    },

    getReportById: async (id) => {
        const response = await apiClient.get(`/reports/${id}`);
        return response.data;
    }
};
