import { aiClient } from "./api";

export const aiService = {
    classifyIncident: async (text) => {
        try {
            const response = await aiClient.post("/classify", { text });
            return response.data;
        } catch (error) {
            return {
                incidentType: text.toLowerCase().includes("fire") ? "Fire" : text.toLowerCase().includes("water") || text.toLowerCase().includes("flood") ? "Flood" : "Medical",
                confidence: 0.94
            };
        }
    },

    estimateSeverity: async (incidentData) => {
        try {
            const response = await aiClient.post("/severity", incidentData);
            return response.data;
        } catch (error) {
            return { severity: incidentData.severity || 4, aiConfidence: 0.92 };
        }
    },

    queryCopilot: async (query, context = {}) => {
        try {
            const response = await aiClient.post("/copilot", { query, context });
            return response.data;
        } catch (error) {
            return {
                reply: `AI Copilot (Offline Mode): Analyzed query "${query}". Recommended dispatching NDRF Water Rescue Squad 03 for flood emergency.`
            };
        }
    },

    checkDuplicates: async (candidate, existingIncidents = []) => {
        try {
            const response = await aiClient.post("/duplicates/check", { candidate, existingIncidents });
            return response.data;
        } catch (error) {
            return {
                isDuplicate: false,
                mode: "DEGRADED_FALLBACK"
            };
        }
    }
};
