import React, { createContext, useContext, useState } from "react";
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

    // Assign a resource unit to an incident (Operator action)
    const assignResource = (incidentId, resourceId) => {
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
    };

    // Unassign a resource unit
    const unassignResource = (incidentId, resourceId) => {
        setIncidents(prevIncidents => 
            prevIncidents.map(inc => {
                if (inc.id === incidentId) {
                    return {
                        ...inc,
                        assignedResourceIds: (inc.assignedResourceIds || []).filter(id => id !== resourceId)
                    };
                }
                return inc;
            })
        );

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
    };

    // Response Team action: Update team deployment status
    const updateResourceStatus = (resourceId, newStatus) => {
        setResources(prev =>
            prev.map(res => {
                if (res.id === resourceId) {
                    return { ...res, status: newStatus };
                }
                return res;
            })
        );

        // Update corresponding incident status if attached
        const resObj = resources.find(r => r.id === resourceId);
        if (resObj && resObj.assignedIncidentId) {
            setIncidents(prev =>
                prev.map(inc => {
                    if (inc.id === resObj.assignedIncidentId) {
                        return { ...inc, status: newStatus };
                    }
                    return inc;
                })
            );
        }
    };

    // Hospital Admin action: Update bed capacities
    const updateHospitalCapacity = (hospitalId, traumaOccupied, icuOccupied, bayStatus) => {
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
    };

    // Create a new emergency report
    const addNewIncident = (formData) => {
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

        return newInc;
    };

    const updateIncidentStatus = (incidentId, newStatus) => {
        setIncidents(prev => 
            prev.map(inc => inc.id === incidentId ? { ...inc, status: newStatus } : inc)
        );
    };

    const dismissAlert = (alertId) => {
        setAlerts(prev => prev.filter(a => a.id !== alertId));
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
            dismissAlert
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
