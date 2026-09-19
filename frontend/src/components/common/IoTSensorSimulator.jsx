import React, { useState } from "react";
import { Activity, AlertOctagon, CheckCircle2, Zap, ArrowUpRight, Flame, Droplets, Wind } from "lucide-react";
import { apiClient } from "../../services/api";

const PRESET_SENSORS = [
    {
        id: "NODE-WATER-04",
        name: "Subhanpura River Gauge",
        type: "WATER_LEVEL",
        icon: Droplets,
        color: "#3b82f6",
        unit: "meters",
        normalVal: 1.8,
        breachVal: 4.4,
        threshold: 3.0,
        locationName: "Subhanpura Riverbank Node-4, Vadodara",
        lat: 22.3120,
        lng: 73.1750
    },
    {
        id: "SENSOR-AMMONIA-02",
        name: "GIDC Industrial Gas Sensor",
        type: "GAS_PPM",
        icon: Wind,
        color: "#a855f7",
        unit: "ppm",
        normalVal: 8.0,
        breachVal: 92.0,
        threshold: 25.0,
        locationName: "GIDC Industrial Area Chemical Plant",
        lat: 22.2580,
        lng: 73.1980
    },
    {
        id: "SMOKE-WAREHOUSE-07",
        name: "Makarpura Heat Sensor",
        type: "SMOKE_HEAT",
        icon: Flame,
        color: "#ef4444",
        unit: "°C",
        normalVal: 28.0,
        breachVal: 88.5,
        threshold: 55.0,
        locationName: "Makarpura Textile Logistics Warehouse",
        lat: 22.2540,
        lng: 73.1920
    }
];

function IoTSensorSimulator({ onSensorIncidentTriggered }) {
    const [activeBreach, setActiveBreach] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resultMessage, setResultMessage] = useState("");

    const handleTrigger = async (sensor, isBreach) => {
        setLoading(true);
        const payload = {
            sensorId: sensor.id,
            sensorType: sensor.type,
            metricName: sensor.type === "WATER_LEVEL" ? "water_depth_meters" : sensor.type === "GAS_PPM" ? "ammonia_ppm" : "temperature_celsius",
            metricValue: isBreach ? sensor.breachVal : sensor.normalVal,
            threshold: sensor.threshold,
            unit: sensor.unit,
            locationName: sensor.locationName,
            lat: sensor.lat,
            lng: sensor.lng
        };

        try {
            const res = await apiClient.post("/ingest/sensor", payload);
            if (isBreach) {
                setActiveBreach(sensor.id);
                setResultMessage(`🚨 Automated Threshold Breach detected on ${sensor.id}! Incident created and Level-5 Critical SLA timer started.`);
                if (onSensorIncidentTriggered && res.data.incident) {
                    onSensorIncidentTriggered(res.data.incident);
                }
            } else {
                if (activeBreach === sensor.id) setActiveBreach(null);
                setResultMessage(`✓ Telemetry normalized for ${sensor.id} (${sensor.normalVal} ${sensor.unit}).`);
            }
        } catch (e) {
            setResultMessage(`Sensor event simulated: ${sensor.id} at ${isBreach ? sensor.breachVal : sensor.normalVal} ${sensor.unit}.`);
        } finally {
            setLoading(false);
            setTimeout(() => setResultMessage(""), 5000);
        }
    };

    return (
        <div className="card" style={{ padding: "18px", border: "1px solid #334155" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Activity size={18} style={{ color: "#38bdf8" }} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#fff", margin: 0 }}>
                        IoT Telemetry Sensor Ingestion Simulator
                    </h3>
                </div>
                <span style={{ fontSize: "0.75rem", background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", padding: "2px 8px", borderRadius: "4px", fontWeight: 700 }}>
                    Phase 3 Webhook Gateway
                </span>
            </div>

            {resultMessage && (
                <div style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    marginBottom: "12px",
                    background: resultMessage.includes("🚨") ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)",
                    border: `1px solid ${resultMessage.includes("🚨") ? "#ef4444" : "#10b981"}`,
                    color: resultMessage.includes("🚨") ? "#fca5a5" : "#a7f3d0"
                }}>
                    {resultMessage}
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                {PRESET_SENSORS.map(sensor => {
                    const Icon = sensor.icon;
                    const isBreached = activeBreach === sensor.id;
                    return (
                        <div key={sensor.id} style={{
                            background: "#0f172a",
                            border: `1px solid ${isBreached ? "#ef4444" : "#1e293b"}`,
                            borderRadius: "8px",
                            padding: "14px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <div style={{ background: `${sensor.color}20`, padding: "6px", borderRadius: "6px", color: sensor.color }}>
                                        <Icon size={16} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{sensor.name}</div>
                                        <div style={{ fontSize: "0.72rem", color: "#94a3b8", fontFamily: "monospace" }}>{sensor.id}</div>
                                    </div>
                                </div>
                                <span style={{
                                    fontSize: "0.7rem",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontWeight: 800,
                                    background: isBreached ? "rgba(239, 68, 68, 0.25)" : "rgba(16, 185, 129, 0.2)",
                                    color: isBreached ? "#ef4444" : "#10b981"
                                }}>
                                    {isBreached ? "CRITICAL BREACH" : "NORMAL"}
                                </span>
                            </div>

                            <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                                Threshold: <strong style={{ color: "#fff" }}>{sensor.threshold} {sensor.unit}</strong> • Location: {sensor.locationName}
                            </div>

                            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                                <button
                                    onClick={() => handleTrigger(sensor, true)}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        background: "rgba(239, 68, 68, 0.2)",
                                        border: "1px solid #ef4444",
                                        color: "#fca5a5",
                                        padding: "6px 8px",
                                        borderRadius: "6px",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "4px"
                                    }}
                                >
                                    <Zap size={13} />
                                    <span>Simulate Breach ({sensor.breachVal} {sensor.unit})</span>
                                </button>
                                <button
                                    onClick={() => handleTrigger(sensor, false)}
                                    disabled={loading}
                                    style={{
                                        background: "#1e293b",
                                        border: "1px solid #334155",
                                        color: "#94a3b8",
                                        padding: "6px 10px",
                                        borderRadius: "6px",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        cursor: "pointer"
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default IoTSensorSimulator;
