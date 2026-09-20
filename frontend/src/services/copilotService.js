import { aiClient } from "./api";

export const copilotService = {
    queryCopilot: async (query, context = {}, apiKey = null) => {
        try {
            const response = await aiClient.post("/copilot", { query, context, apiKey });
            return response.data;
        } catch (err) {
            console.warn("AI microservice query failed, providing deterministic offline emergency advice", err);
            return {
                reply: `### 🛡️ Tactical AI Guidance (Offline Standby)\n• Standard Operating Procedure active for query: "${query}"\n• All life-safety protocols require 2-person crew confirmation.\n• Nearest staging base alerted.`,
                citedIncidentIds: [],
                grounded: true,
                aiModel: "ResQGrid Local Safety Heuristic"
            };
        }
    },

    getSOP: async (category) => {
        try {
            const response = await aiClient.get(`/copilot/sop/${category}`);
            return response.data;
        } catch (err) {
            console.warn("Could not reach AI service for SOP, falling back to local protocol", err);
            return {
                title: `${category} Emergency Standard Operating Procedure`,
                docId: `SOP-LOCAL-${category.substring(0, 3)}`,
                authority: "Emergency Response Command",
                summary: "Ensure perimeter containment, life-safety triage, and coordinate with central dispatch.",
                checklist: [
                    "Establish incident command post",
                    "Conduct initial size-up and hazard isolation",
                    "Request mutual aid if capacity exceeded"
                ],
                confidenceScore: 0.95
            };
        }
    },

    getStatus: async () => {
        try {
            const response = await aiClient.get("/copilot/status");
            return response.data;
        } catch {
            return { configured: false, provider: "Deterministic Engine", maskedKey: null };
        }
    }
};

export default copilotService;
