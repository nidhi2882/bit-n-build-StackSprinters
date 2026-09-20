/**
 * ResQGrid Field Mobile - GPS Location Tracker Service
 * Transmits real-time breadcrumbs to Command Center via /api/telemetry/ping
 */
import offlineStore from "./offlineStore";

class LocationTracker {
    constructor() {
        this.interval = null;
        this.unitId = "RES-001";
        this.currentLocation = { latitude: 22.3072, longitude: 73.1812 };
        this.status = "EN_ROUTE";
    }

    startTracking(unitId = "RES-001", initialStatus = "EN_ROUTE") {
        this.unitId = unitId;
        this.status = initialStatus;

        if (this.interval) clearInterval(this.interval);

        // Emit telemetry pings every 5 seconds
        this.interval = setInterval(() => {
            // Subtle GPS jitter simulating vehicle movement
            this.currentLocation = {
                latitude: Number((this.currentLocation.latitude + (Math.random() - 0.5) * 0.0008).toFixed(6)),
                longitude: Number((this.currentLocation.longitude + (Math.random() - 0.5) * 0.0008).toFixed(6))
            };

            const payload = {
                unitId: this.unitId,
                latitude: this.currentLocation.latitude,
                longitude: this.currentLocation.longitude,
                status: this.status,
                timestamp: new Date().toISOString()
            };

            offlineStore.enqueueAction("LOCATION_PING", payload);
        }, 5000);

        console.log(`[GPS-TRACKER] Started background tracking for ${unitId}`);
    }

    updateStatus(newStatus) {
        this.status = newStatus;
        offlineStore.enqueueAction("STATUS_TRANSITION", {
            unitId: this.unitId,
            status: newStatus,
            latitude: this.currentLocation.latitude,
            longitude: this.currentLocation.longitude
        });
    }

    stopTracking() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        console.log(`[GPS-TRACKER] Stopped tracking.`);
    }
}

export const locationTracker = new LocationTracker();
export default locationTracker;
