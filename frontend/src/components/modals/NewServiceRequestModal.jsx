import React, { useState } from "react";
import { serviceRequestService } from "../../services/serviceRequestService";
import { useAuth } from "../../context/AuthContext";

export default function NewServiceRequestModal({ incident, onClose, onSuccess }) {
    const { user } = useAuth();
    const [targetDept, setTargetDept] = useState("FIRE");
    const [urgency, setUrgency] = useState("CRITICAL");
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const departments = [
        { code: "FLOOD", name: "Flood & Water Rescue Command" },
        { code: "FIRE", name: "Fire & Rescue Department" },
        { code: "MEDICAL", name: "SSG Emergency Medical Services (EMS)" },
        { code: "CRASH", name: "Highway Patrol & Extrication" },
        { code: "HAZMAT", name: "Industrial Hazmat Response Wing" },
        { code: "COLLAPSE", name: "USAR Structural Collapse Wing" },
        { code: "CYCLONE", name: "Cyclone Emergency Command" },
        { code: "SEARCH_RESCUE", name: "Wilderness & Drone SAR Command" },
        { code: "POLICE", name: "Metro Police & Tactical Operations" }
    ];

    const currentDept = user?.departmentCategory || "FLOOD";
    const availableTargets = departments.filter(d => d.code !== currentDept);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMsg("");

        try {
            await serviceRequestService.createRequest({
                incidentId: incident?.id || "INC-2026-001",
                requestedDepartment: targetDept,
                reason,
                urgency
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to create mutual aid request", err);
            setErrorMsg(err.response?.data?.message || "Failed to dispatch mutual aid request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="p-space-lg border-b border-surface-container-high flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                        <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                            <span className="material-symbols-outlined text-2xl">handshake</span>
                        </div>
                        <div>
                            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                                Request Inter-Agency Mutual Aid
                            </h3>
                            <p className="font-label-xs text-label-xs text-on-surface-variant">
                                Authorizes target agency read-access to this incident upon acceptance
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant"
                    >
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-space-lg space-y-space-md">
                    {errorMsg && (
                        <div className="p-3 bg-error-container text-on-error-container rounded-lg text-xs font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">warning</span>
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    {/* Attached Incident Preview */}
                    <div className="p-3 bg-surface-container-low rounded-xl border border-surface-container-high flex items-center justify-between">
                        <div>
                            <span className="font-label-xs text-label-xs text-on-surface-variant uppercase font-semibold block">
                                Attached CAD Incident
                            </span>
                            <span className="font-label-md text-label-md text-on-surface font-bold">
                                {incident?.id || "INC-2026-001"} • {incident?.title || "Active Incident"}
                            </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-code-tabular text-xs font-bold">
                            {incident?.category || incident?.type || "FLOOD"}
                        </span>
                    </div>

                    {/* Target Agency Dropdown */}
                    <div>
                        <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1.5">
                            Target Department / Agency
                        </label>
                        <select
                            value={targetDept}
                            onChange={(e) => setTargetDept(e.target.value)}
                            className="w-full h-11 px-3 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {availableTargets.map((d) => (
                                <option key={d.code} value={d.code}>
                                    {d.name} ({d.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Urgency Level Selector */}
                    <div>
                        <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1.5">
                            Urgency & Escalation Tier
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { level: "CRITICAL", desc: "Auto-escalates in 5m", color: "text-error border-error" },
                                { level: "HIGH", desc: "Priority dispatch", color: "text-secondary border-secondary" },
                                { level: "NORMAL", desc: "Standard standby", color: "text-primary border-primary" },
                            ].map((u) => (
                                <button
                                    key={u.level}
                                    type="button"
                                    onClick={() => setUrgency(u.level)}
                                    className={`p-2.5 rounded-lg border text-left transition-all ${
                                        urgency === u.level
                                            ? `bg-surface-container-high ${u.color} font-bold ring-2 ring-primary/40`
                                            : "border-surface-container-high bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                                    }`}
                                >
                                    <span className="font-label-sm text-xs font-bold block">{u.level}</span>
                                    <span className="text-[10px] text-on-surface-variant leading-none">{u.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reason Textarea */}
                    <div>
                        <label className="font-label-sm text-label-sm font-semibold text-on-surface block mb-1.5">
                            Operational Justification & Equipment Needed
                        </label>
                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Specify equipment, personnel count, or tactical support needed from target department..."
                            required
                            className="w-full p-3 bg-surface-container-low text-on-surface font-body-sm text-body-sm rounded-lg border border-surface-container-high focus:outline-none focus:ring-2 focus:ring-primary"
                        ></textarea>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-space-sm pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-space-md py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-space-lg py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-md text-label-md font-bold shadow-md transition-all flex items-center gap-2"
                        >
                            {submitting ? (
                                <span>Transmitting CAD Request...</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">send</span>
                                    <span>Dispatch Mutual Aid Request</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
