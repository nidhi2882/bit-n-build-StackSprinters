import React, { useState, useEffect } from "react";
import { X, Copy, GitMerge, AlertCircle, CheckCircle2, ArrowRight, ShieldAlert, Split } from "lucide-react";
import { useEmergency } from "../../context/EmergencyContext";
import { incidentService } from "../../services/incidentService";

const DuplicateReviewModal = ({ isOpen, onClose }) => {
    const { incidents, mergeIncidents, splitReport } = useEmergency();
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("SUGGESTIONS"); // SUGGESTIONS | MERGED_LIST

    useEffect(() => {
        if (isOpen) {
            loadDuplicateSuggestions();
        }
    }, [isOpen, incidents]);

    const normalizeCategory = (cat) => {
        if (!cat) return "";
        return String(cat).trim().toLowerCase().replace("cat_", "").replace(/_/g, "").replace(/-/g, "");
    };

    const formatDistance = (distKm, pair) => {
        let valInKm = distKm;
        if (valInKm === undefined || valInKm === null || isNaN(valInKm)) {
            if (pair) {
                if (pair.distanceKm !== undefined && pair.distanceKm !== null) valInKm = pair.distanceKm;
                else if (pair.distanceMeters !== undefined && pair.distanceMeters !== null) valInKm = pair.distanceMeters / 1000.0;
                else if (pair.distance !== undefined && pair.distance !== null) valInKm = pair.distance > 50 ? pair.distance / 1000.0 : pair.distance;
                else if (pair.bestMatch && pair.bestMatch.distanceKm !== undefined) valInKm = pair.bestMatch.distanceKm;
                else if (pair.bestMatch && pair.bestMatch.distanceMeters !== undefined) valInKm = pair.bestMatch.distanceMeters / 1000.0;
            }
        }
        if (typeof valInKm === "string") valInKm = parseFloat(valInKm);
        if (valInKm === undefined || valInKm === null || isNaN(valInKm)) {
            return "0 m (0.00 km)";
        }
        if (valInKm > 50) {
            valInKm = valInKm / 1000.0;
        }

        const meters = Math.round(valInKm * 1000);
        if (meters < 1000) {
            return `${meters} m (${valInKm.toFixed(2)} km)`;
        }
        return `${valInKm.toFixed(2)} km`;
    };

    const loadDuplicateSuggestions = async () => {
        setLoading(true);
        try {
            const result = await incidentService.getDuplicateSuggestions();
            if (Array.isArray(result) && result.length > 0) {
                // Filter out any pair with different category/type (Hard Filter enforcement)
                const filtered = result.filter(pair => {
                    const typeA = normalizeCategory(pair.incidentA?.type);
                    const typeB = normalizeCategory(pair.incidentB?.type);
                    return !typeA || !typeB || typeA === typeB;
                });
                setSuggestions(filtered);
            } else {
                // Client-side detection fallback for local state
                const active = incidents.filter(i => !i.isMerged && i.status !== "Resolved");
                const pairs = [];
                for (let i = 0; i < active.length; i++) {
                    for (let j = i + 1; j < active.length; j++) {
                        const a = active[i];
                        const b = active[j];

                        // HARD FILTER: Incidents of different categories (e.g., Flood vs Traffic) must NEVER be duplicates
                        const typeA = normalizeCategory(a.type);
                        const typeB = normalizeCategory(b.type);
                        if (typeA && typeB && typeA !== typeB) {
                            continue;
                        }

                        const dist = calculateDist(a.lat, a.lng, b.lat, b.lng);
                        if (dist <= 1.5) {
                            pairs.push({
                                incidentA: a,
                                incidentB: b,
                                distanceKm: Math.round(dist * 1000) / 1000,
                                distanceMeters: Math.round(dist * 1000),
                                suggestedMasterId: a.id
                            });
                        }
                    }
                }
                setSuggestions(pairs);
            }
        } catch (err) {
            console.warn("Could not load duplicate suggestions:", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateDist = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 5.0;
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;

        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const clampedA = Math.min(1.0, Math.max(0.0, a));
        return R * (2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA)));
    };

    const handleMerge = async (masterId, duplicateId) => {
        await mergeIncidents(masterId, duplicateId);
        setSuggestions(prev => prev.filter(item =>
            item.incidentA.id !== duplicateId && item.incidentB.id !== duplicateId &&
            item.incidentA.id !== masterId && item.incidentB.id !== masterId
        ));
    };

    const mergedIncidents = incidents.filter(i => i.isMerged || (i.duplicateReports && i.duplicateReports.length > 0) || (i.duplicateCount && i.duplicateCount > 0));

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <div style={{ fontSize: '0.78rem', color: '#60a5fa', fontWeight: 700, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Copy size={14} />
                            <span>OPERATOR REVIEW QUEUE • 3-SIGNAL DUPLICATE CONSOLIDATION</span>
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '2px 0 0' }}>
                            Incident Consolidation & Merge Review
                        </h2>
                    </div>

                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <X size={22} />
                    </button>
                </div>

                {/* Sub-header Tabs */}
                <div style={{ display: 'flex', gap: '10px', background: '#0b1120', padding: '10px 16px', borderBottom: '1px solid #1e293b' }}>
                    <button
                        onClick={() => setActiveTab("SUGGESTIONS")}
                        style={{
                            background: activeTab === "SUGGESTIONS" ? '#3b82f6' : 'transparent',
                            color: activeTab === "SUGGESTIONS" ? '#fff' : '#94a3b8',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <GitMerge size={15} />
                        <span>Detected Potential Duplicates ({suggestions.length})</span>
                    </button>

                    <button
                        onClick={() => setActiveTab("MERGED_LIST")}
                        style={{
                            background: activeTab === "MERGED_LIST" ? '#3b82f6' : 'transparent',
                            color: activeTab === "MERGED_LIST" ? '#fff' : '#94a3b8',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Copy size={15} />
                        <span>Consolidated Master Incidents ({mergedIncidents.length})</span>
                    </button>
                </div>

                {/* Body */}
                <div className="modal-body" style={{ maxHeight: '520px', overflowY: 'auto' }}>
                    {activeTab === "SUGGESTIONS" ? (
                        <div>
                            {loading ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                                    Scanning spatial, temporal & semantic signals for duplicates...
                                </div>
                            ) : suggestions.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                    <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 10px' }} />
                                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>No Unconsolidated Duplicates Detected</div>
                                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0 0' }}>
                                        All active incident reports in the system are currently unique or already consolidated under master tickets.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    {suggestions.map((pair, idx) => {
                                        console.log(`[DuplicateReviewModal] Distance Delta raw pair #${idx} received:`, {
                                            distanceKm: pair.distanceKm,
                                            distanceMeters: pair.distanceMeters,
                                            rawPair: pair
                                        });
                                        return (
                                            <div key={idx} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <span style={{ fontSize: '0.78rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                                        Distance Delta: {formatDistance(pair.distanceKm, pair)} • High Spatial & Semantic Alignment
                                                    </span>
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                                                        Suggested Master: <strong>{pair.suggestedMasterId}</strong>
                                                    </span>
                                                </div>

                                                {/* Side by side comparison */}
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                                                    {/* Candidate A */}
                                                    <div style={{ background: '#0b1120', border: '1px solid #334155', padding: '12px', borderRadius: '8px' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>{pair.incidentA.id} (Master Candidate A)</div>
                                                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', margin: '2px 0' }}>{pair.incidentA.title}</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Type: {pair.incidentA.type} • Severity: Level {pair.incidentA.severity}</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>📍 {pair.incidentA.locationName}</div>
                                                    </div>

                                                    {/* Candidate B */}
                                                    <div style={{ background: '#0b1120', border: '1px solid #334155', padding: '12px', borderRadius: '8px' }}>
                                                        <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 700 }}>{pair.incidentB.id} (Duplicate Candidate B)</div>
                                                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', margin: '2px 0' }}>{pair.incidentB.title}</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Type: {pair.incidentB.type} • Severity: Level {pair.incidentB.severity}</div>
                                                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>📍 {pair.incidentB.locationName}</div>
                                                    </div>
                                                </div>

                                                {/* Action buttons */}
                                                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handleMerge(pair.incidentA.id, pair.incidentB.id)}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                            color: '#fff',
                                                            border: 'none',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        <GitMerge size={15} />
                                                        <span>Merge B into {pair.incidentA.id}</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleMerge(pair.incidentB.id, pair.incidentA.id)}
                                                        style={{
                                                            background: '#1e293b',
                                                            color: '#cbd5e1',
                                                            border: '1px solid #334155',
                                                            padding: '8px 16px',
                                                            borderRadius: '8px',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 700,
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px'
                                                        }}
                                                    >
                                                        <GitMerge size={15} />
                                                        <span>Merge A into {pair.incidentB.id}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {mergedIncidents.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                                    No consolidated master incidents currently stored.
                                </div>
                            ) : (
                                mergedIncidents.map(inc => (
                                    <div key={inc.id} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>{inc.title} ({inc.id})</div>
                                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    Location: {inc.locationName} • Duplicates Consolidated: <strong style={{ color: '#60a5fa' }}>{inc.duplicateCount || (inc.duplicateReports || []).length}</strong>
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: '#a7f3d0', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
                                                Master Incident Active
                                            </span>
                                        </div>

                                        {/* Consolidated reports stream */}
                                        {inc.duplicateReports && inc.duplicateReports.length > 0 && (
                                            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                                {inc.duplicateReports.map((rep, idx) => (
                                                    <div key={idx} style={{ background: '#0b1120', padding: '8px 12px', borderRadius: '6px', fontSize: '0.78rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div>
                                                            <strong style={{ color: '#60a5fa' }}>[{rep.source}]</strong> {rep.text}
                                                        </div>
                                                        <button
                                                            onClick={() => splitReport(inc.id, rep.id || `REP-${idx}`)}
                                                            style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <Split size={12} />
                                                            <span>Split Report</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DuplicateReviewModal;
