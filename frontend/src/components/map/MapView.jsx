import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEmergency } from "../../context/EmergencyContext";

// Create custom colored DivIcons for Leaflet
const createCustomIcon = (type, severity, status) => {
    let color = "#ef4444"; // default red
    if (type === "resource") {
        color = status === "Available" ? "#10b981" : "#3b82f6"; // green available, blue en-route
    } else if (type === "hospital") {
        color = "#a855f7"; // purple hospital
    } else {
        // incident severity
        if (severity >= 5) color = "#ef4444";
        else if (severity === 4) color = "#f97316";
        else if (severity === 3) color = "#eab308";
        else color = "#10b981";
    }

    const symbol = type === "hospital" ? "🏥" : type === "resource" ? "🚑" : "🚨";

    return L.divIcon({
        className: "custom-leaflet-marker",
        html: `<div style="
            background-color: ${color};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 0 12px ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
        ">${symbol}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
    });
};

const MapView = ({ height = "520px" }) => {
    const { incidents, resources, hospitals, setSelectedIncident } = useEmergency();
    const mapCenter = [22.3072, 73.1812]; // Vadodara default coordinates

    return (
        <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: height, width: "100%", borderRadius: "10px" }}
        >
            <TileLayer
                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
            />

            {/* Render Incidents */}
            {incidents.map((incident) => (
                <Marker
                    key={incident.id}
                    position={[incident.lat, incident.lng]}
                    icon={createCustomIcon("incident", incident.severity, incident.status)}
                >
                    <Popup>
                        <div style={{ color: "#0f172a", fontFamily: "sans-serif", padding: "4px" }}>
                            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b" }}>{incident.id}</div>
                            <h4 style={{ margin: "2px 0 6px 0", fontSize: "14px" }}>{incident.title}</h4>
                            <div style={{ fontSize: "12px", marginBottom: "4px" }}>
                                <strong>Type:</strong> {incident.type} | <strong>Severity:</strong> {incident.severity}/5
                            </div>
                            <div style={{ fontSize: "12px", marginBottom: "8px" }}>
                                <strong>Status:</strong> {incident.status}
                            </div>
                            <button
                                onClick={() => setSelectedIncident(incident)}
                                style={{
                                    background: "#3b82f6",
                                    color: "#fff",
                                    border: "none",
                                    padding: "4px 10px",
                                    borderRadius: "4px",
                                    cursor: "pointer",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                    width: "100%"
                                }}
                            >
                                Dispatch & AI Analysis
                            </button>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Render Resources */}
            {resources.map((res) => (
                <Marker
                    key={res.id}
                    position={[res.lat, res.lng]}
                    icon={createCustomIcon("resource", null, res.status)}
                >
                    <Popup>
                        <div style={{ color: "#0f172a", fontFamily: "sans-serif" }}>
                            <div style={{ fontSize: "11px", fontWeight: "bold", color: "#3b82f6" }}>UNIT: {res.id}</div>
                            <h4 style={{ margin: "2px 0", fontSize: "13px" }}>{res.name}</h4>
                            <div style={{ fontSize: "11px" }}>Status: {res.status}</div>
                            <div style={{ fontSize: "11px" }}>Lead: {res.unitLead}</div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Render Hospitals */}
            {hospitals.map((hosp) => (
                <Marker
                    key={hosp.id}
                    position={[hosp.lat, hosp.lng]}
                    icon={createCustomIcon("hospital")}
                >
                    <Popup>
                        <div style={{ color: "#0f172a", fontFamily: "sans-serif" }}>
                            <h4 style={{ margin: "0 0 4px 0", fontSize: "13px" }}>{hosp.name}</h4>
                            <div style={{ fontSize: "11px" }}>
                                Trauma Beds Free: <strong>{hosp.traumaBedsTotal - hosp.traumaBedsOccupied}</strong>
                            </div>
                            <div style={{ fontSize: "11px" }}>
                                ICU Beds Free: <strong>{hosp.icuBedsTotal - hosp.icuBedsOccupied}</strong>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapView;
