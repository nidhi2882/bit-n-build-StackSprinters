import React, { useState, useEffect } from "react";

export default function TacticalCommandMap({
    incidents = [],
    units = [],
    selectedIncident = null,
    onSelectIncident = () => {},
    departmentCategory = null
}) {
    const [layerFilter, setLayerFilter] = useState("ALL"); // ALL, CRITICAL, UNITS, FLOOD, FIRE
    const [activeMarker, setActiveMarker] = useState(null);
    const [mapZoom, setMapZoom] = useState(13);
    const [centerCoord, setCenterCoord] = useState({ lat: 22.3072, lng: 73.1812 }); // Vadodara default

    // Set center coordinate if an incident is selected
    useEffect(() => {
        if (selectedIncident && selectedIncident.lat && selectedIncident.lng) {
            setCenterCoord({ lat: selectedIncident.lat, lng: selectedIncident.lng });
            setActiveMarker(selectedIncident);
        }
    }, [selectedIncident]);

    const filteredIncidents = incidents.filter(inc => {
        if (layerFilter === "CRITICAL") return inc.severity >= 4;
        if (layerFilter === "FLOOD") return inc.category === "FLOOD" || inc.type?.toLowerCase().includes("flood");
        if (layerFilter === "FIRE") return inc.category === "FIRE" || inc.type?.toLowerCase().includes("fire");
        return true;
    });

    const getSeverityRing = (sev) => {
        if (sev >= 5) return "border-red-500 bg-red-500/20 text-red-400 animate-ping";
        if (sev === 4) return "border-orange-500 bg-orange-500/20 text-orange-400";
        if (sev === 3) return "border-amber-500 bg-amber-500/20 text-amber-400";
        return "border-emerald-500 bg-emerald-500/20 text-emerald-400";
    };

    return (
        <div className="relative w-full h-[520px] rounded-xl border border-border-dark bg-[#0a0f18] overflow-hidden shadow-2xl flex flex-col">
            {/* Top Tactical Map HUD Controls */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 bg-[#121927]/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-border-dark text-xs text-text-muted shadow-lg">
                    <span className="flex items-center gap-1.5 text-primary font-mono font-bold tracking-wider uppercase text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        GIS RADAR LIVE
                    </span>
                    <span className="text-border-light">|</span>
                    <span className="font-mono text-text-main">3D Vector Canvas</span>
                    <span className="text-border-light">|</span>
                    <span className="font-mono text-text-muted">Active Pings: {filteredIncidents.length + units.length}</span>
                </div>

                {/* Layer Filters */}
                <div className="pointer-events-auto flex items-center gap-1 bg-[#121927]/90 backdrop-blur-md p-1 rounded-lg border border-border-dark text-xs">
                    {["ALL", "CRITICAL", "UNITS", "FLOOD", "FIRE"].map(f => (
                        <button
                            key={f}
                            onClick={() => setLayerFilter(f)}
                            className={`px-2.5 py-1 rounded text-[11px] font-mono tracking-wide transition-all ${
                                layerFilter === f
                                    ? "bg-primary text-white font-bold shadow-sm"
                                    : "text-text-muted hover:text-text-main hover:bg-surface-elevated"
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Canvas with GIS Vector Simulation Grid */}
            <div className="relative w-full flex-1 overflow-hidden select-none bg-gradient-to-b from-[#0b1320] via-[#080d14] to-[#05080d]">
                {/* SVG Tactical Grid Lines & Coordinate Vectors */}
                <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="tactical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2a3b5c" strokeWidth="0.5" />
                            <circle cx="0" cy="0" r="1.5" fill="#3b82f6" opacity="0.6" />
                        </pattern>
                        <pattern id="tactical-dots" width="80" height="80" patternUnits="userSpaceOnUse">
                            <circle cx="40" cy="40" r="1" fill="#64748b" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#tactical-grid)" />
                    <rect width="100%" height="100%" fill="url(#tactical-dots)" />
                    {/* Simulated River / Sector Vectors */}
                    <path d="M -50 300 Q 300 240 600 350 T 1200 280 T 1800 400" fill="none" stroke="#0ea5e9" strokeWidth="18" opacity="0.15" />
                    <path d="M -50 300 Q 300 240 600 350 T 1200 280 T 1800 400" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
                </svg>

                {/* Radar Sweep Animation */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                    <div className="w-[800px] h-[800px] rounded-full border border-primary/20 absolute -top-[200px] left-1/4 animate-[spin_20s_linear_infinite]"
                         style={{ background: 'conic-gradient(from 0deg at 50% 50%, rgba(14, 165, 233, 0.15) 0deg, transparent 60deg, transparent 360deg)' }} />
                </div>

                {/* Render Unit Markers */}
                {(layerFilter === "ALL" || layerFilter === "UNITS") && units.map((unit, idx) => {
                    const posX = 15 + ((idx * 27) % 70);
                    const posY = 20 + ((idx * 31) % 65);
                    return (
                        <div
                            key={`unit-${unit.id || idx}`}
                            style={{ left: `${posX}%`, top: `${posY}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
                            onClick={() => setActiveMarker({ type: "UNIT", ...unit })}
                        >
                            <div className="relative flex items-center justify-center">
                                <span className="absolute w-7 h-7 rounded-full bg-blue-500/20 animate-ping" />
                                <div className="w-8 h-8 rounded-lg bg-surface-dark border border-blue-500/70 shadow-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-[18px]">directions_car</span>
                                </div>
                            </div>
                            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-surface-darker/90 border border-border-dark text-[10px] font-mono text-blue-300 whitespace-nowrap shadow">
                                {unit.callSign || `UNIT-${unit.id}`}
                            </span>
                        </div>
                    );
                })}

                {/* Render Incident Markers */}
                {(layerFilter !== "UNITS") && filteredIncidents.map((inc, idx) => {
                    // Spread coordinates logically on tactical canvas
                    const posX = 20 + ((idx * 23 + 11) % 68);
                    const posY = 15 + ((idx * 19 + 7) % 72);
                    const isSelected = selectedIncident?.id === inc.id;

                    return (
                        <div
                            key={`inc-${inc.id || idx}`}
                            style={{ left: `${posX}%`, top: `${posY}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
                            onClick={() => {
                                setActiveMarker({ type: "INCIDENT", ...inc });
                                onSelectIncident(inc);
                            }}
                        >
                            {/* Glowing rings for Level 4 and 5 */}
                            {inc.severity >= 4 && (
                                <span className={`absolute w-10 h-10 -inset-1 rounded-full ${getSeverityRing(inc.severity)}`} />
                            )}
                            <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-xl transition-transform ${
                                isSelected ? "scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background-dark" : "group-hover:scale-110"
                            } ${
                                inc.severity >= 4 ? "bg-red-950/80 border-red-500 text-red-300" :
                                inc.severity === 3 ? "bg-amber-950/80 border-amber-500 text-amber-300" :
                                "bg-emerald-950/80 border-emerald-500 text-emerald-300"
                            }`}>
                                <span className="material-symbols-outlined text-[16px]">
                                    {inc.category === "FIRE" ? "local_fire_department" :
                                     inc.category === "FLOOD" ? "flood" :
                                     inc.category === "MEDICAL" ? "medical_services" :
                                     inc.category === "HAZMAT" ? "warning" : "emergency"}
                                </span>
                            </div>

                            {/* Badge Label */}
                            <div className="absolute top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-[#101726]/95 border border-border-dark whitespace-nowrap shadow-lg flex items-center gap-1">
                                <span className="text-[10px] font-mono font-bold text-text-main">
                                    {inc.trackingId || inc.title?.substring(0, 16) || `INC-${inc.id}`}
                                </span>
                                <span className={`text-[9px] px-1 rounded font-bold ${
                                    inc.severity >= 4 ? "bg-red-500/20 text-red-400" : "bg-primary/20 text-primary"
                                }`}>
                                    L{inc.severity || 3}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Tactical Marker Popover Inspection Modal */}
                {activeMarker && (
                    <div className="absolute bottom-4 left-4 z-30 w-80 bg-surface-dark/95 backdrop-blur-xl border border-border-light/40 rounded-xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-start justify-between gap-2 border-b border-border-dark pb-2 mb-2">
                            <div>
                                <span className="text-[10px] font-mono tracking-wider uppercase text-primary font-bold">
                                    {activeMarker.type === "UNIT" ? "FIELD ASSET TELEMETRY" : "CAD INCIDENT INSPECTION"}
                                </span>
                                <h4 className="text-sm font-bold text-text-main leading-tight">
                                    {activeMarker.callSign || activeMarker.title || `Asset #${activeMarker.id}`}
                                </h4>
                            </div>
                            <button
                                onClick={() => setActiveMarker(null)}
                                className="text-text-muted hover:text-text-main p-1"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>

                        {activeMarker.type === "UNIT" ? (
                            <div className="space-y-1.5 text-xs text-text-muted font-mono">
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span className="text-emerald-400 font-bold">{activeMarker.status || "AVAILABLE"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Department:</span>
                                    <span className="text-text-main">{activeMarker.departmentCategory || "GENERAL"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Call Sign:</span>
                                    <span className="text-text-main">{activeMarker.callSign || "UNIT-RES"}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-xs text-text-muted line-clamp-2">
                                    {activeMarker.description || "Operational emergency reported. Unit deployment recommended."}
                                </p>
                                <div className="flex items-center justify-between text-xs pt-1 font-mono">
                                    <span className="text-text-muted">Status: <strong className="text-text-main">{activeMarker.status}</strong></span>
                                    <span className="text-text-muted">Severity: <strong className="text-red-400">L{activeMarker.severity}</strong></span>
                                </div>
                                <button
                                    onClick={() => onSelectIncident(activeMarker)}
                                    className="w-full mt-2 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold tracking-wide flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    DISPATCH / OPEN CAD DRAWER
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Map Status Bar */}
            <div className="h-8 bg-[#090d15] border-t border-border-dark px-4 flex items-center justify-between text-[11px] font-mono text-text-muted">
                <div className="flex items-center gap-3">
                    <span>SECTOR: <strong>NW QUADRANT</strong></span>
                    <span>LAT: <strong>{centerCoord.lat.toFixed(4)}°N</strong></span>
                    <span>LNG: <strong>{centerCoord.lng.toFixed(4)}°E</strong></span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>OSRM ROUTING ENGINE: <strong className="text-emerald-400">SYNCED (34ms)</strong></span>
                </div>
            </div>
        </div>
    );
}
