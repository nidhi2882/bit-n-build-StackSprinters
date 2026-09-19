export const mockIncidents = [
    {
        id: "INC-2026-001",
        type: "Flood",
        title: "Flash Flood & Trapped Citizens",
        description: "Water levels reached 4 feet following dam release. 14 residents stranded on rooftop in Subhanpura.",
        severity: 5, // Critical
        status: "Reported",
        locationName: "Subhanpura Sector 4, Vadodara",
        lat: 22.3120,
        lng: 73.1750,
        reportedAt: "10 mins ago",
        reporterRole: "Citizen & Water Sensor Node-4",
        aiSummary: "High priority flash flood emergency. Trapped civilian casualties suspected. Immediate inflatable motor boat and diving team required.",
        aiConfidence: 0.96,
        duplicateCount: 3,
        duplicateReports: [
            { id: "REP-901", source: "112 Hotline", time: "12 mins ago", text: "Water entering houses on Main Street" },
            { id: "REP-904", source: "Citizen App", time: "10 mins ago", text: "People stuck on roof near Krishna Temple" },
            { id: "REP-909", source: "IoT Sensor", time: "8 mins ago", text: "Water level exceed 1.2m threshold" }
        ],
        requiredCapabilities: ["Water Rescue", "Inflatable Boat", "Medical Evacuation"],
        assignedResourceIds: []
    },
    {
        id: "INC-2026-002",
        type: "Fire",
        title: "Commercial Building Structure Fire",
        description: "Heavy smoke and visible flames on 3rd floor of textile warehouse. Electrical short circuit suspected.",
        severity: 4, // High
        status: "Assigned",
        locationName: "GIDC Industrial Estate, Makarpura",
        lat: 22.2580,
        lng: 73.1980,
        reportedAt: "22 mins ago",
        reporterRole: "Industrial Security",
        aiSummary: "Structure fire in high-density industrial zone. Moderate risk of fire spreading to adjacent chemical storage unit.",
        aiConfidence: 0.91,
        duplicateCount: 1,
        duplicateReports: [
            { id: "REP-882", source: "Factory Guard", time: "22 mins ago", text: "Smoke coming out of floor 3 window" }
        ],
        requiredCapabilities: ["Fire Engine", "Foam Tender", "Hazmat Shield"],
        assignedResourceIds: ["RES-002"]
    },
    {
        id: "INC-2026-003",
        type: "Hazardous",
        title: "Ammonia Gas Leak at Processing Plant",
        description: "Pipe rupture reported during maintenance. Strong chemical odor affecting 300m radius.",
        severity: 4, // High
        status: "Classified",
        locationName: "Alkapuri Transport Hub",
        lat: 22.3100,
        lng: 73.1880,
        reportedAt: "35 mins ago",
        reporterRole: "Gas Sensor Array",
        aiSummary: "Toxic inhalant hazard detected. Perimeter evacuation advised. Hazmat neutralization squad dispatched.",
        aiConfidence: 0.94,
        duplicateCount: 2,
        duplicateReports: [
            { id: "REP-702", source: "Sensors", time: "35 mins ago", text: "NH3 concentration > 50ppm" }
        ],
        requiredCapabilities: ["Hazmat Squad", "Breathing Apparatus", "Evacuation Bus"],
        assignedResourceIds: ["RES-005"]
    },
    {
        id: "INC-2026-004",
        type: "Accident",
        title: "Multi-Vehicle Highway Collision",
        description: "Bus and two heavy trucks collided on Express Highway. Multiple injuries reported, traffic blocked.",
        severity: 3, // Medium
        status: "En-Route",
        locationName: "NH-48 Bypass Flyover",
        lat: 22.2850,
        lng: 73.2200,
        reportedAt: "45 mins ago",
        reporterRole: "Highway Patrol Patrol-09",
        aiSummary: "Traffic bottleneck with physical extrication needed for driver. 6 injured transported to SSG Hospital.",
        aiConfidence: 0.89,
        duplicateCount: 4,
        duplicateReports: [],
        requiredCapabilities: ["Cutter & Extrication", "ALS Ambulance", "Traffic Control"],
        assignedResourceIds: ["RES-003", "RES-004"]
    },
    {
        id: "INC-2026-005",
        type: "Medical",
        title: "Mass Food Poisoning at Community Event",
        description: "Over 25 attendees experiencing severe acute gastroenteritis and dehydration.",
        severity: 3, // Medium
        status: "On-Site",
        locationName: "Sayajibaug Community Center",
        lat: 22.3020,
        lng: 73.1910,
        reportedAt: "1 hour ago",
        reporterRole: "Health Inspector",
        aiSummary: "Cluster medical emergency. Field triage unit setup on site. 8 patients transferred to Civil Hospital.",
        aiConfidence: 0.95,
        duplicateCount: 0,
        duplicateReports: [],
        requiredCapabilities: ["Field Medical Triage", "Ambulance Fleet"],
        assignedResourceIds: ["RES-007"]
    },
    {
        id: "INC-2026-006",
        type: "Flood",
        title: "Underpass Submerged & Vehicle Trapped",
        description: "SUV stalled in 3 feet deep submerged underpass near railway station.",
        severity: 2, // Low
        status: "Resolved",
        locationName: "Station Road Underpass",
        lat: 22.3050,
        lng: 73.1810,
        reportedAt: "2 hours ago",
        reporterRole: "Citizen App",
        aiSummary: "Submerged roadway cleared. Driver rescued safely by local municipal pump team.",
        aiConfidence: 0.98,
        duplicateCount: 1,
        duplicateReports: [],
        requiredCapabilities: ["Drainage Pump", "Tow Truck"],
        assignedResourceIds: ["RES-008"]
    }
];