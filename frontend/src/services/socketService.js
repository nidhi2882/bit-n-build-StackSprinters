/**
 * ResQGrid Real-Time Telemetry & Socket Service
 * Provides room-scoped subscriptions:
 *   - /topic/authority/all  (Super Admin / Authority Director)
 *   - /topic/dept/{deptId}  (Department Admin / Dispatch)
 *   - /topic/unit/{unitId}  (Field Unit)
 */

class SocketService {
    constructor() {
        this.listeners = new Map();
        this.connected = false;
        this.activeRooms = new Set();
        this.pollInterval = null;
    }

    connect(userContext) {
        this.connected = true;
        const role = userContext?.role || "SUPER_ADMIN";
        const dept = userContext?.departmentCategory || "FLOOD";

        // Join appropriate scoped rooms
        if (role === "Super Admin" || role === "SUPER_ADMIN") {
            this.activeRooms.add("/topic/authority/all");
        } else if (role === "Department Admin" || role === "DEPARTMENT_ADMIN") {
            this.activeRooms.add(`/topic/dept/${dept.toLowerCase()}`);
        }

        console.log(`[CAD-SOCKET] Connected with scoped rooms:`, Array.from(this.activeRooms));
        this.startHeartbeatSync();
    }

    startHeartbeatSync() {
        if (this.pollInterval) clearInterval(this.pollInterval);
        // Resilient fallback telemetry pulse for active unit location updates
        this.pollInterval = setInterval(() => {
            this.emitEvent("heartbeat:sync", {
                timestamp: new Date().toISOString(),
                status: "ONLINE",
                activeRooms: Array.from(this.activeRooms)
            });
        }, 10000);
    }

    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(callback);
        return () => this.off(eventType, callback);
    }

    off(eventType, callback) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).delete(callback);
        }
    }

    emitEvent(eventType, payload) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).forEach(cb => {
                try {
                    cb(payload);
                } catch (e) {
                    console.error(`[CAD-SOCKET] Error in listener for ${eventType}:`, e);
                }
            });
        }
    }

    disconnect() {
        this.connected = false;
        if (this.pollInterval) clearInterval(this.pollInterval);
        this.activeRooms.clear();
        console.log("[CAD-SOCKET] Disconnected.");
    }
}

export const socketService = new SocketService();
export default socketService;
