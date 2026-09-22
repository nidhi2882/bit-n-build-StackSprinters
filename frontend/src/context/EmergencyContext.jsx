import React, { createContext, useContext, useState, useEffect } from "react";
import { incidentService } from "../services/incidentService";
import { resourceService } from "../services/resourceService";
import { hospitalService } from "../services/hospitalService";
import { alertService } from "../services/alertService";
import { apiClient } from "../services/api";
import { mockIncidents } from "../mock/mockIncidents";
import { mockResources } from "../mock/mockResources";
import { mockHospitals } from "../mock/mockHospitals";
import { mockAlerts } from "../mock/mockAlerts";

const EmergencyContext = createContext();

export const EmergencyProvider = ({ children }) => {
    const [incidents, setIncidents] = useState(mockIncidents);
    const [resources, setResources] = useState(mockResources);
    const [hospitals, setHospitals] = useState(mockHospitals);
    const [alerts, setAlerts] = useState(mockAlerts);
    const [userRole, setUserRole] = useState("Emergency Operator"); // 'Emergency Operator' | 'Citizen' | 'Response Team' | 'Hospital Admin' | 'Authority Admin'
    
    // UI state
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [isCopilotOpen, setIsCopilotOpen] = useState(false);
    const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("ALL");
    const [filterSeverity, setFilterSeverity] = useState("ALL");

    // Fetch live datasets from backend (MongoDB Atlas cloud)
    const refreshData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return; // Skip background polling if not authenticated

        try {
            const [incs, res, hosps, alrts] = await Promise.allSettled([
                incidentService.getIncidents(),
                resourceService.getResources(),
                hospitalService.getHospitals(),
                alertService.getActiveAlerts()
            ]);

            if (incs.status === "fulfilled" && Array.isArray(incs.value)) {
                setIncidents(incs.value);
            }
            if (res.status === "fulfilled" && Array.isArray(res.value)) {
                const liveIncs = (incs.status === "fulfilled" && Array.isArray(incs.value)) ? incs.value : incidents;
                const resolvedIncIds = new Set(
                    liveIncs.filter(i => i.status === "Resolved" || i.status === "Cancelled").map(i => i.id)
                );

                const validStatuses = ["Available", "En-Route", "On-Scene", "Returning"];
                const sanitizedRes = res.value.map(r => {
                    const st = r.status || "";
                    const isAttachedToResolved = r.assignedIncidentId && resolvedIncIds.has(r.assignedIncidentId);

                    if (isAttachedToResolved || st === "Resolved" || st === "Completed" || !validStatuses.some(vs => vs.toLowerCase() === st.toLowerCase())) {
                        return { ...r, status: "Available", assignedIncidentId: null };
                    }
                    if (r.assignedIncidentId && !resolvedIncIds.has(r.assignedIncidentId) && st.toLowerCase() === "available") {
                        return { ...r, status: "En-Route" };
                    }
                    if (st === "On-Site") {
                        return { ...r, status: "On-Scene" };
                    }
                    return r;
                });
                setResources(sanitizedRes);
            }
            if (hosps.status === "fulfilled" && Array.isArray(hosps.value)) {
                setHospitals(hosps.value);
            }
            if (alrts.status === "fulfilled" && Array.isArray(alrts.value)) {
                setAlerts(alrts.value);
            }
        } catch (err) {
            console.warn("Could not sync live data from MongoDB Atlas:", err);
        }
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 10000); // 10s live sync
        return () => clearInterval(interval);
    }, []);

    // Assign a resource unit to an incident (Operator action)
    const assignResource = async (incidentId, resourceId) => {
        setIncidents(prevIncidents => 
            prevIncidents.map(inc => {
                if (inc.id === incidentId) {
                    const currentAssigned = inc.assignedResourceIds || [];
                    if (!currentAssigned.includes(resourceId)) {
                        return {
                            ...inc,
                            status: inc.status === "Reported" ? "Assigned" : inc.status,
                            assignedResourceIds: [...currentAssigned, resourceId]
                        };
                    }
                }
                return inc;
            })
        );

        setSelectedIncident(prev => {
            if (prev && prev.id === incidentId) {
                const currentAssigned = prev.assignedResourceIds || [];
                if (!currentAssigned.includes(resourceId)) {
                    return {
                        ...prev,
                        status: prev.status === "Reported" ? "Assigned" : prev.status,
                        assignedResourceIds: [...currentAssigned, resourceId]
                    };
                }
            }
            return prev;
        });

        setResources(prevResources =>
            prevResources.map(res => {
                if (res.id === resourceId) {
                    return {
                        ...res,
                        status: "En-Route",
                        assignedIncidentId: incidentId
                    };
                }
                return res;
            })
        );

        setAlerts(prev => prev.filter(alt => alt.incidentId !== incidentId || alt.type !== "CRITICAL"));

        try {
            await incidentService.assignResource(incidentId, resourceId);
        } catch (err) {
            console.warn("Could not sync assignment to MongoDB Atlas backend:", err);
        }
    };

    // Unassign a resource unit
    const unassignResource = async (incidentId, resourceId) => {
        setIncidents(prevIncidents => 
            prevIncidents.map(inc => {
                if (inc.id === incidentId) {
                    const remainingIds = (inc.assignedResourceIds || []).filter(id => id !== resourceId);
                    let newStatus = "Reported";
                    if (remainingIds.length > 0) {
                        const remainingRes = resources.filter(r => remainingIds.includes(r.id));
                        const anyOnScene = remainingRes.some(r => {
                            const st = (r.status || "").toLowerCase();
                            return st.includes("site") || st.includes("scene") || st.includes("return");
                        });
                        const anyEnRoute = remainingRes.some(r => (r.status || "").toLowerCase().includes("route"));
                        if (anyOnScene) newStatus = "On-Scene";
                        else if (anyEnRoute) newStatus = "En-Route";
                        else newStatus = "Assigned";
                    }
                    return {
                        ...inc,
                        status: newStatus,
                        assignedResourceIds: remainingIds
                    };
                }
                return inc;
            })
        );

        setSelectedIncident(prev => {
            if (prev && prev.id === incidentId) {
                const remainingIds = (prev.assignedResourceIds || []).filter(id => id !== resourceId);
                let newStatus = "Reported";
                if (remainingIds.length > 0) {
                    const remainingRes = resources.filter(r => remainingIds.includes(r.id));
                    const anyOnScene = remainingRes.some(r => {
                        const st = (r.status || "").toLowerCase();
                        return st.includes("site") || st.includes("scene");
                    });
                    const anyEnRoute = remainingRes.some(r => (r.status || "").toLowerCase().includes("route"));
                    if (anyOnScene) newStatus = "On-Scene";
                    else if (anyEnRoute) newStatus = "En-Route";
                    else newStatus = "Assigned";
                }
                return {
                    ...prev,
                    status: newStatus,
                    assignedResourceIds: remainingIds
                };
            }
            return prev;
        });

        setResources(prevResources =>
            prevResources.map(res => {
                if (res.id === resourceId) {
                    return {
                        ...res,
                        status: "Available",
                        assignedIncidentId: null
                    };
                }
                return res;
            })
        );

        try {
            await incidentService.unassignResource(incidentId, resourceId);
        } catch (err) {
            console.warn("Could not sync unassignment to backend:", err);
        }
    };

    // Response Team action: Update team deployment status
    const updateResourceStatus = async (resourceId, newStatus) => {
        if (newStatus === "Resolved" || newStatus === "Completed") {
            alert(`Invalid Resource Status: '${newStatus}' is an incident-only status. Resource status must be Available, En-Route, On-Scene, or Returning.`);
            return;
        }

        const canonicalStatus = newStatus === "On-Site" ? "On-Scene" : newStatus;

        setResources(prev =>
            prev.map(res => {
                if (res.id === resourceId) {
                    return {
                        ...res,
                        status: canonicalStatus,
                        assignedIncidentId: canonicalStatus === "Available" ? null : res.assignedIncidentId
                    };
                }
                return res;
            })
        );

        // Update corresponding incident status if attached
        const resObj = resources.find(r => r.id === resourceId);
        if (resObj && resObj.assignedIncidentId) {
            const incId = resObj.assignedIncidentId;
            setIncidents(prev =>
                prev.map(inc => {
                    if (inc.id === incId) {
                        let incStatus = inc.status;
                        if (canonicalStatus === "On-Scene") {
                            incStatus = "On-Scene";
                        } else if (canonicalStatus === "En-Route") {
                            incStatus = "En-Route";
                        }
                        return { ...inc, status: incStatus };
                    }
                    return inc;
                })
            );
            setSelectedIncident(prev => {
                if (prev && prev.id === incId) {
                    let incStatus = prev.status;
                    if (canonicalStatus === "On-Scene") {
                        incStatus = "On-Scene";
                    } else if (canonicalStatus === "En-Route") {
                        incStatus = "En-Route";
                    }
                    return { ...prev, status: incStatus };
                }
                return prev;
            });
        }

        try {
            await resourceService.updateStatus(resourceId, canonicalStatus);
        } catch (err) {
            console.warn("Could not sync resource status to backend:", err);
            alert(err.response?.data?.message || err.message || "Failed to update resource status");
            refreshData();
        }
    };

    // Hospital Admin action: Update bed capacities
    const updateHospitalCapacity = async (hospitalId, traumaOccupied, icuOccupied, bayStatus) => {
        setHospitals(prev =>
            prev.map(h => {
                if (h.id === hospitalId) {
                    const traumaBedsOccupied = Math.max(0, Math.min(h.traumaBedsTotal, traumaOccupied));
                    const icuBedsOccupied = Math.max(0, Math.min(h.icuBedsTotal, icuOccupied));
                    const freeTrauma = h.traumaBedsTotal - traumaBedsOccupied;
                    const freeIcu = h.icuBedsTotal - icuBedsOccupied;
                    
                    let status = "Optimal";
                    if (freeTrauma <= 2 || freeIcu <= 1) status = "Near Capacity";
                    if (freeTrauma === 0 && freeIcu === 0) status = "Critical";

                    return {
                        ...h,
                        traumaBedsOccupied,
                        icuBedsOccupied,
                        ambulanceBayStatus: bayStatus || h.ambulanceBayStatus,
                        status
                    };
                }
                return h;
            })
        );

        try {
            await hospitalService.updateCapacity(hospitalId, {
                traumaBedsOccupied: traumaOccupied,
                icuBedsOccupied: icuOccupied,
                ambulanceBayStatus: bayStatus
            });
        } catch (err) {
            console.warn("Could not sync hospital capacity to MongoDB Atlas backend:", err);
        }
    };

    // Create a new emergency report
    const addNewIncident = async (formData) => {
        const newId = `INC-2026-0${incidents.length + 1}`;
        const newInc = {
            id: newId,
            title: formData.title || `${formData.type} Incident at ${formData.locationName}`,
            type: formData.type || "Medical",
            description: formData.description || "Reported emergency description.",
            severity: parseInt(formData.severity) || 3,
            status: "Reported",
            locationName: formData.locationName || "Central Area, Vadodara",
            lat: parseFloat(formData.lat) || 22.3072 + (Math.random() - 0.5) * 0.04,
            lng: parseFloat(formData.lng) || 73.1812 + (Math.random() - 0.5) * 0.04,
            reportedAt: "Just now",
            reporterRole: userRole,
            aiSummary: `AI Pre-analysis: High probability ${formData.type} emergency. Automated severity score ${formData.severity}/5. AI recommended dispatch: ${formData.type === "Flood" ? "Boat Unit" : "Response Unit"}.`,
            aiConfidence: 0.94,
            duplicateCount: 0,
            duplicateReports: [],
            requiredCapabilities: formData.type === "Flood" ? ["Water Rescue", "Boat"] : ["Emergency Medical"],
            assignedResourceIds: []
        };

        setIncidents([newInc, ...incidents]);

        if (newInc.severity >= 4) {
            setAlerts(prev => [
                {
                    id: `ALT-${Date.now()}`,
                    type: "CRITICAL",
                    title: `NEW CRITICAL: ${newInc.title}`,
                    message: `${newInc.id} reported by ${userRole} at ${newInc.locationName}. High severity (${newInc.severity}/5).`,
                    time: "Just now",
                    incidentId: newInc.id,
                    actionRequired: "Immediate Operator Triage Required"
                },
                ...prev
            ]);
        }

        try {
            const persisted = await incidentService.createIncident(newInc);
            if (persisted && persisted.id) {
                newInc.id = persisted.id;
            }
        } catch (err) {
            console.warn("Could not persist incident to MongoDB Atlas backend:", err);
        }

        return newInc;
    };

    const updateIncidentStatus = async (incidentId, newStatus) => {
        const inc = incidents.find(i => i.id === incidentId);
        const assignedIds = inc?.assignedResourceIds || [];

        if (newStatus === "Resolved") {
            const assignedRes = resources.filter(r => 
                assignedIds.includes(r.id) || r.assignedIncidentId === incidentId
            );

            if (assignedRes.length === 0 && (!inc?.assignedResourceIds || inc.assignedResourceIds.length === 0)) {
                alert("Cannot mark incident as Resolved: No response units are currently assigned.");
                return;
            }

            const anyOnScene = assignedRes.some(r => {
                const st = (r.status || "").toLowerCase();
                return st.includes("site") || st.includes("scene") || st.includes("return");
            });

            if (!anyOnScene && assignedRes.length > 0) {
                const confirmOnScene = window.confirm(
                    "Assigned unit(s) are currently marked 'En-Route'. Mark unit(s) as 'On-Scene' and resolve this incident now?"
                );
                if (confirmOnScene) {
                    // Progress assigned units to On-Scene first
                    for (const r of assignedRes) {
                        try {
                            await resourceService.updateStatus(r.id, "On-Scene");
                        } catch (e) {
                            console.warn("Could not sync resource status:", e);
                        }
                    }
                } else {
                    return;
                }
            }
        }

        // Free assigned resources if resolved or cancelled -> Automatically reset status to Available
        if (newStatus === "Resolved" || newStatus === "Cancelled") {
            setResources(prev =>
                prev.map(res => {
                    if (assignedIds.includes(res.id) || res.assignedIncidentId === incidentId) {
                        return { ...res, status: "Available", assignedIncidentId: null };
                    }
                    return res;
                })
            );
        }

        setIncidents(prev => 
            prev.map(inc => inc.id === incidentId ? { ...inc, status: newStatus } : inc)
        );
        setSelectedIncident(prev => prev && prev.id === incidentId ? { ...prev, status: newStatus } : prev);

        try {
            await incidentService.updateStatus(incidentId, newStatus);
        } catch (err) {
            console.warn("Could not sync incident status to backend:", err);
            alert(err.response?.data?.message || err.message || "Failed to update incident status.");
            refreshData();
        }
    };

    const dismissAlert = async (alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
        try {
            await apiClient.post(`/alerts/${alertId}/dismiss`);
        } catch (err) {
            console.warn("Could not sync alert dismissal to MongoDB Atlas backend:", err);
        }
    };

    // Operator Action: Merge incident B into master incident A
    const mergeIncidents = async (masterId, duplicateId) => {
        setIncidents(prev => {
            const master = prev.find(i => i.id === masterId);
            const dup = prev.find(i => i.id === duplicateId);
            if (!master || !dup) return prev;

            const newDupReports = [
                ...(master.duplicateReports || []),
                {
                    id: `REP-${Date.now()}`,
                    source: `Merged Incident ${dup.id}`,
                    text: dup.description || dup.title,
                    time: "Just now"
                }
            ];

            return prev.map(inc => {
                if (inc.id === masterId) {
                    return {
                        ...inc,
                        duplicateCount: (inc.duplicateCount || 0) + 1 + (dup.duplicateCount || 0),
                        duplicateReports: newDupReports,
                        severity: (inc.duplicateCount || 0) >= 2 ? Math.min(5, inc.severity + 1) : inc.severity
                    };
                }
                if (inc.id === duplicateId) {
                    return { ...inc, isMerged: true, status: "Merged", mergedIntoIncidentId: masterId };
                }
                return inc;
            });
        });

        try {
            await incidentService.mergeIncidents(masterId, duplicateId);
        } catch (err) {
            console.warn("Could not sync incident merge to backend:", err);
        }
    };

    // Operator Action: Split report out of master incident
    const splitReport = async (masterId, reportId) => {
        let splitInc = null;
        setIncidents(prev => {
            const master = prev.find(i => i.id === masterId);
            if (!master) return prev;

            const repToSplit = (master.duplicateReports || []).find(r => r.id === reportId);
            const remaining = (master.duplicateReports || []).filter(r => r.id !== reportId);

            splitInc = {
                id: `INC-2026-S${Math.floor(Math.random() * 90) + 10}`,
                title: repToSplit ? `Split Incident: ${repToSplit.text.substring(0, 30)}...` : `Split Report from ${masterId}`,
                type: master.type,
                description: repToSplit ? repToSplit.text : master.description,
                severity: master.severity,
                status: "Reported",
                locationName: master.locationName,
                lat: master.lat + 0.001,
                lng: master.lng + 0.001,
                reportedAt: "Just now",
                reporterRole: "Operator Split",
                aiSummary: `Standalone incident split from master incident ${masterId}.`,
                aiConfidence: 0.90,
                duplicateCount: 0,
                duplicateReports: [],
                requiredCapabilities: master.requiredCapabilities,
                assignedResourceIds: []
            };

            const updatedMaster = {
                ...master,
                duplicateCount: Math.max(0, (master.duplicateCount || 1) - 1),
                duplicateReports: remaining
            };

            return [splitInc, ...prev.map(i => i.id === masterId ? updatedMaster : i)];
        });

        try {
            await incidentService.splitReport(masterId, reportId);
        } catch (err) {
            console.warn("Could not sync report split to backend:", err);
        }
    };

    return (
        <EmergencyContext.Provider value={{
            incidents,
            resources,
            hospitals,
            alerts,
            userRole,
            setUserRole,
            selectedIncident,
            setSelectedIncident,
            isCopilotOpen,
            setIsCopilotOpen,
            isNewIncidentModalOpen,
            setIsNewIncidentModalOpen,
            searchTerm,
            setSearchTerm,
            filterType,
            setFilterType,
            filterSeverity,
            setFilterSeverity,
            assignResource,
            unassignResource,
            updateResourceStatus,
            updateHospitalCapacity,
            addNewIncident,
            updateIncidentStatus,
            dismissAlert,
            mergeIncidents,
            splitReport
        }}>
            {children}
        </EmergencyContext.Provider>
    );
};

export const useEmergency = () => {
    const context = useContext(EmergencyContext);
    if (!context) {
        throw new Error("useEmergency must be used within an EmergencyProvider");
    }
    return context;
};
