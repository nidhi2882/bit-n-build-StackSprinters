import { apiClient } from "./api";
import { mockHospitals } from "../mock/mockHospitals";

export const hospitalService = {
    getHospitals: async () => {
        try {
            const response = await apiClient.get("/hospitals");
            return response.data;
        } catch (error) {
            return mockHospitals;
        }
    },

    updateCapacity: async (hospitalId, capacityData) => {
        try {
            const response = await apiClient.put(`/hospitals/${hospitalId}/capacity`, capacityData);
            return response.data;
        } catch (error) {
            return { success: true, hospitalId, ...capacityData };
        }
    }
};
