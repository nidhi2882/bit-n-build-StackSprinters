import { apiClient } from "./api";

export const notificationService = {
    dispatchAlert: async (payload) => {
        const response = await apiClient.post("/notifications/dispatch", payload);
        return response.data;
    },
    getChannelStatus: async () => {
        const response = await apiClient.get("/notifications/channels");
        return response.data;
    }
};

export default notificationService;
