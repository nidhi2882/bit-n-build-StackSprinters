import { apiClient } from "./api";

export const slaService = {
    getStatus: async () => {
        const response = await apiClient.get("/sla/status");
        return response.data;
    },
    triggerEvaluation: async () => {
        const response = await apiClient.post("/sla/evaluate");
        return response.data;
    }
};

export default slaService;
