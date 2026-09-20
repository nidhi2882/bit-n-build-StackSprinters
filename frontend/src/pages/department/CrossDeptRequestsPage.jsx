import React, { useState, useEffect } from "react";
import { serviceRequestService } from "../../services/serviceRequestService";
import { resourceService } from "../../services/resourceService";
import { useAuth } from "../../context/AuthContext";
import TacticalSidebar from "../../components/layout/TacticalSidebar";
import TacticalHeader from "../../components/layout/TacticalHeader";

export default function CrossDeptRequestsPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("incoming");
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    // Accept / Decline modal state
    const [acceptingReq, setAcceptingReq] = useState(null);
    const [decliningReq, setDecliningReq] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState("");
    const [declineReason, setDeclineReason] = useState("");
    const [actionMsg, setActionMsg] = useState("");

    const currentDept = user?.departmentCategory || "FLOOD";

    const loadData = async () => {
        setLoading(true);
        try {
            const [inData, sentData, unitData] = await Promise.all([
                serviceRequestService.getIncomingRequests(),
                serviceRequestService.getSentRequests(),
                resourceService.getResources(currentDept),
            ]);
            setIncomingRequests(inData || []);
            setSentRequests(sentData || []);
            setUnits(unitData || []);
            if (unitData && unitData.length > 0) {
                setSelectedUnit(unitData[0].id);
            }
        } catch (err) {
            console.error("Failed to load cross-department requests", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [currentDept]);

    const handleAccept = async (e) => {
        e.preventDefault();
        if (!acceptingReq) return;
        try {
            await serviceRequestService.acceptRequest(acceptingReq.id, selectedUnit);
            setActionMsg(`Accepted mutual aid request REQ-${acceptingReq.id} and assigned unit ${selectedUnit}.`);
            setAcceptingReq(null);
            loadData();
        } catch (err) {
            console.error("Accept failed", err);
            setActionMsg(err.response?.data?.message || "Failed to accept request");
        }
    };

    const handleDecline = async (e) => {
        e.preventDefault();
        if (!decliningReq) return;
        try {
            await serviceRequestService.declineRequest(decliningReq.id, declineReason || "Operational units committed");
            setActionMsg(`Declined mutual aid request REQ-${decliningReq.id}.`);
            setDecliningReq(null);
            setDeclineReason("");
            loadData();
        } catch (err) {
            console.error("Decline failed", err);
            setActionMsg(err.response?.data?.message || "Failed to decline request");
        }
    };

    return (
        <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
            <TacticalSidebar />

            <div className="pl-64">
                <TacticalHeader />

                <main className="w-full pt-16 min-h-screen px-space-lg py-space-lg">
                    <div className="flex flex-col w-full gap-space-lg max-w-[1920px] mx-auto">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-surface-container-high">
                            <div>
                                <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                                    Cross-Department Mutual Aid Coordination
                                </h1>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                    Manage inbound assistance requests and outbound mutual-aid dispatches for {currentDept} Sector
                                </p>
                            </div>

                            <button
                                onClick={loadData}
                                className="inline-flex items-center gap-space-xs px-space-md py-2 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold rounded-lg shadow-sm transition-colors"
                            >
                                <span className="material-symbols-outlined text-base">refresh</span>
                                <span>Refresh Telemetry</span>
                            </button>
                        </div>

                        {actionMsg && (
                            <div className="p-3 rounded-lg bg-primary-container text-on-primary-container text-xs font-semibold flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">info</span>
                                <span>{actionMsg}</span>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex items-center gap-2 border-b border-surface-container-high pb-2">
                            <button
                                onClick={() => setActiveTab("incoming")}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                    activeTab === "incoming"
                                        ? "bg-primary text-on-primary shadow-sm"
                                        : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high"
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">move_to_inbox</span>
                                <span>Incoming Aid Requests ({incomingRequests.length})</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("sent")}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                    activeTab === "sent"
                                        ? "bg-primary text-on-primary shadow-sm"
                                        : "bg-surface-container-lowest text-on-surface hover:bg-surface-container border border-surface-container-high"
                                }`}
                            >
                                <span className="material-symbols-outlined text-sm">outbox</span>
                                <span>Outbound Sent Requests ({sentRequests.length})</span>
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-container-high overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-body-sm font-body-sm">
                                    <thead className="bg-surface-container-low text-on-surface-variant font-label-xs text-label-xs uppercase tracking-wider border-b border-surface-container-high">
                                        <tr>
                                            <th className="p-3">CAD Request ID</th>
                                            <th className="p-3">Attached Incident</th>
                                            <th className="p-3">{activeTab === "incoming" ? "Requesting Department" : "Target Department"}</th>
                                            <th className="p-3">Urgency</th>
                                            <th className="p-3">Justification / Equipment Required</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Assigned Unit</th>
                                            {activeTab === "incoming" && <th className="p-3 text-right">Actions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-surface-container-high">
                                        {(activeTab === "incoming" ? incomingRequests : sentRequests).length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="p-8 text-center text-on-surface-variant">
                                                    No {activeTab} mutual-aid requests on file.
                                                </td>
                                            </tr>
                                        ) : (
                                            (activeTab === "incoming" ? incomingRequests : sentRequests).map((r) => (
                                                <tr key={r.id} className="hover:bg-surface-container-low/60 transition-colors">
                                                    <td className="p-3 font-code-tabular font-bold text-primary">
                                                        REQ-{r.id}
                                                    </td>
                                                    <td className="p-3 font-code-tabular font-bold text-on-surface">
                                                        {r.incidentId}
                                                    </td>
                                                    <td className="p-3 font-semibold text-xs text-on-surface">
                                                        {activeTab === "incoming" ? r.requestedByDepartment : r.requestedDepartment}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2 py-0.5 rounded font-code-tabular text-xs font-bold ${
                                                                r.urgency === "CRITICAL"
                                                                    ? "bg-error-container text-error"
                                                                    : r.urgency === "HIGH"
                                                                    ? "bg-secondary-container text-secondary"
                                                                    : "bg-surface-container text-on-surface-variant"
                                                            }`}
                                                        >
                                                            {r.urgency}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-xs text-on-surface-variant max-w-sm">
                                                        {r.reason || "Equipment assistance requested"}
                                                    </td>
                                                    <td className="p-3">
                                                        <span
                                                            className={`px-2.5 py-0.5 rounded-full font-code-tabular text-xs font-bold ${
                                                                r.status === "ACCEPTED"
                                                                    ? "bg-secondary-container text-secondary"
                                                                    : r.status === "PENDING"
                                                                    ? "bg-error-container text-error"
                                                                    : "bg-surface-container text-on-surface-variant"
                                                            }`}
                                                        >
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 font-code-tabular text-xs">
                                                        {r.assignedUnitId || "--"}
                                                    </td>
                                                    {activeTab === "incoming" && (
                                                        <td className="p-3 text-right">
                                                            {r.status === "PENDING" ? (
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <button
                                                                        onClick={() => setAcceptingReq(r)}
                                                                        className="px-2.5 py-1 bg-secondary text-on-secondary rounded text-xs font-bold shadow-sm hover:bg-secondary/90 transition-colors"
                                                                    >
                                                                        Accept & Dispatch
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setDecliningReq(r)}
                                                                        className="px-2.5 py-1 bg-error-container text-on-error-container rounded text-xs font-bold hover:bg-error-container/80 transition-colors"
                                                                    >
                                                                        Decline
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-on-surface-variant font-code-tabular font-medium">
                                                                    Processed
                                                                </span>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Accept Modal */}
            {acceptingReq && (
                <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Accept Mutual Aid & Dispatch Unit
                        </h3>
                        <p className="text-xs text-on-surface-variant">
                            Select an available {currentDept} unit to assign to incident {acceptingReq.incidentId}.
                        </p>

                        <form onSubmit={handleAccept} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-on-surface block mb-1">Select Dispatch Unit</label>
                                <select
                                    value={selectedUnit}
                                    onChange={(e) => setSelectedUnit(e.target.value)}
                                    className="w-full h-10 px-3 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                >
                                    {units.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.callSign || u.id} - {u.name} ({u.status})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setAcceptingReq(null)}
                                    className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 rounded-lg bg-secondary text-on-secondary text-xs font-bold shadow-md"
                                >
                                    Confirm Assignment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Decline Modal */}
            {decliningReq && (
                <div className="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl border border-surface-container-high p-6 space-y-4">
                        <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold text-error">
                            Decline Mutual Aid Request
                        </h3>
                        <p className="text-xs text-on-surface-variant">
                            Please document the operational constraint or lack of available units for requesting agency.
                        </p>

                        <form onSubmit={handleDecline} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-on-surface block mb-1">Decline Justification</label>
                                <textarea
                                    rows={3}
                                    required
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    placeholder="All units currently committed to critical local flood incident..."
                                    className="w-full p-2 bg-surface-container-low rounded-lg text-sm border border-surface-container-high"
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setDecliningReq(null)}
                                    className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 rounded-lg bg-error text-on-error text-xs font-bold shadow-md"
                                >
                                    Confirm Decline
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
