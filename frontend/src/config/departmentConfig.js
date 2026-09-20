/**
 * ResQGrid Centralized Department Console Configurations
 * Defines visual theme, sector designations, dynamic KPIs, and operational actions
 * for every department console.
 */

export const DEPARTMENT_CONSOLE_CONFIGS = {
    FLOOD: {
        id: "FLOOD",
        departmentCode: "DISASTER_RESPONSE",
        title: "Flood & Water Infrastructure Command",
        subtitle: "Tactical Sector 4 • NDRF Water Rescue Division",
        sectorCode: "CAD-S4",
        icon: "waves",
        primaryColor: "#0284c7",
        badgeBg: "bg-sky-500/15 text-sky-400 border-sky-500/30",
        bannerBg: "from-sky-950 via-slate-900 to-slate-950",
        activeAlert: "Active River Basin Inundation Phase 2 • High Risk",
        unitCategory: "Water Rescue Boats & Heavy Submersibles",
        kpis: [
            { id: "trapped", label: "People Trapped", icon: "person_alert", color: "text-error", compute: (incidents) => incidents.reduce((sum, i) => sum + (i.affectedPeople || 0), 0) || 14 },
            { id: "boats", label: "Boats Available", icon: "sailing", color: "text-sky-400", compute: (_, units) => units.filter(u => (u.type || "").toLowerCase().includes("boat") && u.status === "Available").length || 4 },
            { id: "evac", label: "Evacuation Tasks", icon: "transfer_within_a_station", color: "text-amber-400", compute: (incidents) => incidents.filter(i => (i.severity || 0) >= 4).length || 3 },
            { id: "shelter", label: "Shelters Open", icon: "night_shelter", color: "text-emerald-400", compute: () => 8 },
            { id: "waterLevel", label: "River Stage", icon: "water", color: "text-cyan-400", compute: () => "+2.8m (Warning)" }
        ],
        resourceReadiness: [
            { name: "Inflatable Rescue Boats", total: 6, available: 4 },
            { name: "Life Jackets & Throw Bags", total: 50, available: 38 },
            { name: "NDRF Deep Water Teams", total: 10, available: 7 },
            { name: "High-Discharge Submersible Pumps", total: 8, available: 5 }
        ],
        actions: [
            { id: "DISPATCH_BOAT", label: "Dispatch Rescue Boat", icon: "sailing", primary: true },
            { id: "CREATE_EVAC", label: "Order Evacuation Zone", icon: "notifications_active" },
            { id: "REQUEST_EMS", label: "Request Medical Aid", icon: "medical_services" },
            { id: "REQUEST_POLICE", label: "Request Police Barricade", icon: "local_police" }
        ]
    },
    FIRE: {
        id: "FIRE",
        departmentCode: "FIRE_RESCUE",
        title: "Fire Suppression & Heavy Rescue Command",
        subtitle: "Metropolitan Fire Department • Industrial & Structural Command",
        sectorCode: "CAD-FIRE",
        icon: "local_fire_department",
        primaryColor: "#dc2626",
        badgeBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
        bannerBg: "from-rose-950 via-slate-900 to-slate-950",
        activeAlert: "Structural Chemical Fire Phase 3 • Hazmat Units Dispatched",
        unitCategory: "Fire Tenders, Foam Rigs & Aerial Ladders",
        kpis: [
            { id: "activeFires", label: "Active Blazes", icon: "local_fire_department", color: "text-error", compute: (incidents) => incidents.filter(i => i.status !== "Resolved").length || 6 },
            { id: "engines", label: "Engines Ready", icon: "fire_truck", color: "text-amber-400", compute: (_, units) => units.filter(u => u.status === "Available").length || 8 },
            { id: "firefighters", label: "Crews Deployed", icon: "group", color: "text-orange-400", compute: (_, units) => units.filter(u => u.status !== "Available").length * 4 || 24 },
            { id: "evacBuildings", label: "Buildings Evacuated", icon: "apartment", color: "text-secondary", compute: () => 5 },
            { id: "hazmatAlerts", label: "Hazmat Flags", icon: "science", color: "text-yellow-400", compute: (incidents) => incidents.filter(i => (i.description || "").toLowerCase().includes("chem")).length || 2 }
        ],
        resourceReadiness: [
            { name: "Heavy Water Tenders (10,000L)", total: 10, available: 7 },
            { name: "Foam Crash Rigs", total: 4, available: 3 },
            { name: "50m Hydraulic Turntable Ladders", total: 4, available: 3 },
            { name: "SCBA Air Cylinders & Suits", total: 40, available: 32 }
        ],
        actions: [
            { id: "DISPATCH_TENDER", label: "Dispatch Fire Engine", icon: "fire_truck", primary: true },
            { id: "MARK_CONTAINED", label: "Mark Contained", icon: "check_circle" },
            { id: "REQUEST_EMS", label: "Request Trauma EMS", icon: "medical_services" },
            { id: "REQUEST_HAZMAT", label: "Request Hazmat Support", icon: "science" }
        ]
    },
    MEDICAL: {
        id: "MEDICAL",
        departmentCode: "MEDICAL_EMS",
        title: "Emergency Medical & Trauma EMS Console",
        subtitle: "Regional Emergency Trauma Center • Mass Casualty Command",
        sectorCode: "CAD-MED",
        icon: "medical_services",
        primaryColor: "#059669",
        badgeBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        bannerBg: "from-emerald-950 via-slate-900 to-slate-950",
        activeAlert: "Mass Casualty Protocol Level 2 Active • Triage Bay Open",
        unitCategory: "Advanced Life Support & Trauma Units",
        kpis: [
            { id: "patients", label: "Patients In Triage", icon: "personal_injury", color: "text-error", compute: (incidents) => incidents.reduce((sum, i) => sum + (i.affectedPeople || 1), 0) || 18 },
            { id: "critPatients", label: "Critical Priority", icon: "heart_broken", color: "text-rose-400", compute: (incidents) => incidents.filter(i => (i.severity || 0) === 5).length || 4 },
            { id: "ambAvailable", label: "Ambulances Ready", icon: "ambulance", color: "text-emerald-400", compute: (_, units) => units.filter(u => u.status === "Available").length || 12 },
            { id: "icuCapacity", label: "ICU Beds Free", icon: "bed", color: "text-cyan-400", compute: () => "6 / 12" },
            { id: "erLoad", label: "Receiving Hospitals", icon: "local_hospital", color: "text-secondary", compute: () => "3 Facilities" }
        ],
        resourceReadiness: [
            { name: "Advanced Life Support (ALS) Ambulances", total: 16, available: 11 },
            { name: "Basic Life Support (BLS) Ambulances", total: 10, available: 7 },
            { name: "Trauma Resuscitation Teams", total: 8, available: 5 },
            { name: "Regional Emergency ICU Beds", total: 24, available: 14 }
        ],
        actions: [
            { id: "DISPATCH_AMB", label: "Dispatch ALS Ambulance", icon: "ambulance", primary: true },
            { id: "REQUEST_HOSPITAL", label: "Reserve Hospital Bed", icon: "local_hospital" },
            { id: "TRIAGE_UPDATE", label: "Update Triage Code", icon: "assignment" },
            { id: "REQUEST_POLICE", label: "Request Green Corridor", icon: "local_police" }
        ]
    },
    POLICE: {
        id: "POLICE",
        departmentCode: "POLICE",
        title: "Metropolitan Police Tactical Command",
        subtitle: "City Police Headquarters • Civil Protection & Traffic Command",
        sectorCode: "CAD-POLICE",
        icon: "local_police",
        primaryColor: "#2563eb",
        badgeBg: "bg-blue-500/15 text-blue-400 border-blue-500/30",
        bannerBg: "from-blue-950 via-slate-900 to-slate-950",
        activeAlert: "Active Evacuation Perimeter Enforced • Traffic Diversions Live",
        unitCategory: "Patrol Units, SWAT & Traffic Squads",
        kpis: [
            { id: "activeSec", label: "Active Incidents", icon: "shield", color: "text-primary", compute: (incidents) => incidents.length || 7 },
            { id: "patrols", label: "Patrols Deployed", icon: "directions_car", color: "text-blue-400", compute: (_, units) => units.filter(u => u.status !== "Available").length || 14 },
            { id: "closures", label: "Road Closures", icon: "do_not_disturb_on", color: "text-amber-400", compute: () => 6 },
            { id: "crowdEvents", label: "Crowd Sectors", icon: "groups", color: "text-purple-400", compute: () => 3 },
            { id: "officers", label: "Field Officers", icon: "badge", color: "text-emerald-400", compute: () => 48 }
        ],
        resourceReadiness: [
            { name: "Highway Patrol Interceptors", total: 20, available: 13 },
            { name: "Tactical SWAT Response Teams", total: 4, available: 3 },
            { name: "Heavy Barricade & Riot Trucks", total: 6, available: 5 },
            { name: "Drone Aerial Surveillance Units", total: 5, available: 4 }
        ],
        actions: [
            { id: "DISPATCH_PATROL", label: "Dispatch Patrol Unit", icon: "directions_car", primary: true },
            { id: "CREATE_CLOSURE", label: "Order Road Closure", icon: "remove_road" },
            { id: "REQUEST_EMS", label: "Request EMS Support", icon: "medical_services" },
            { id: "REQUEST_FIRE", label: "Request Fire Extrication", icon: "local_fire_department" }
        ]
    },
    CRASH: {
        id: "CRASH",
        departmentCode: "POLICE",
        title: "Highway Crash & Vehicle Extrication Console",
        subtitle: "Expressway Highway Patrol • Multi-Vehicle Corridor Division",
        sectorCode: "CAD-CRASH",
        icon: "car_crash",
        primaryColor: "#d97706",
        badgeBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
        bannerBg: "from-amber-950 via-slate-900 to-slate-950",
        activeAlert: "Multi-Vehicle Pileup on Ring Road • Extrication Units On-Scene",
        unitCategory: "Hydraulic Extrication & Heavy Recovery Tow",
        kpis: [
            { id: "crashes", label: "Active Pileups", icon: "car_crash", color: "text-error", compute: (incidents) => incidents.length || 5 },
            { id: "trappedVehicles", label: "Trapped in Vehicles", icon: "airline_seat_recline_extra", color: "text-rose-400", compute: () => 4 },
            { id: "tows", label: "Heavy Tows Deployed", icon: "rv_hookup", color: "text-amber-400", compute: () => 3 },
            { id: "lanesBlocked", label: "Lanes Blocked", icon: "traffic", color: "text-yellow-400", compute: () => "3 Lanes" },
            { id: "corridorSLA", label: "Avg Extrication ETA", icon: "timer", color: "text-emerald-400", compute: () => "6.4 mins" }
        ],
        resourceReadiness: [
            { name: "Hydraulic Jaws of Life Rigs", total: 6, available: 4 },
            { name: "Heavy 50-Ton Tow Cranes", total: 4, available: 2 },
            { name: "Corridor Emergency Patrols", total: 12, available: 8 },
            { name: "Rapid Medical Trauma Rigs", total: 8, available: 5 }
        ],
        actions: [
            { id: "DISPATCH_CRASH", label: "Dispatch Extrication Team", icon: "hardware", primary: true },
            { id: "DISPATCH_TOW", label: "Request Heavy Tow", icon: "rv_hookup" },
            { id: "REQUEST_EMS", label: "Request Ambulance", icon: "medical_services" },
            { id: "TRAFFIC_DIVERSION", label: "Enforce Diversion", icon: "alt_route" }
        ]
    },
    HAZMAT: {
        id: "HAZMAT",
        departmentCode: "HAZMAT",
        title: "Industrial Hazmat & CBRN Mitigation",
        subtitle: "GIDC Industrial Hazmat Division • Toxic Chemical Vapor Control",
        sectorCode: "CAD-HAZ",
        icon: "science",
        primaryColor: "#ca8a04",
        badgeBg: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        bannerBg: "from-yellow-950 via-slate-900 to-slate-950",
        activeAlert: "Level-A Chemical Vapor Threat Active • 800m Exclusion Zone",
        unitCategory: "Level-A Enclosed Suits & Decontamination Trailers",
        kpis: [
            { id: "activeHaz", label: "Chemical Incidents", icon: "warning", color: "text-yellow-400", compute: (incidents) => incidents.length || 3 },
            { id: "plumeRadius", label: "Exclusion Perimeter", icon: "radar", color: "text-error", compute: () => "800 meters" },
            { id: "deconUnits", label: "Decon Rigs Ready", icon: "sanitizer", color: "text-cyan-400", compute: () => 4 },
            { id: "gasType", label: "Detected Toxicant", icon: "air", color: "text-amber-400", compute: () => "Ammonia (NH3)" },
            { id: "suitsAvailable", label: "Level-A Suits Ready", icon: "shield", color: "text-emerald-400", compute: () => 18 }
        ],
        resourceReadiness: [
            { name: "Level-A Gas-Tight Hazmat Suits", total: 24, available: 18 },
            { name: "Mobile Decontamination Shower Units", total: 4, available: 3 },
            { name: "Multi-Gas Optical Detectors", total: 10, available: 8 },
            { name: "Chemical Neutralizer Sprayers", total: 6, available: 5 }
        ],
        actions: [
            { id: "DISPATCH_HAZMAT", label: "Dispatch Hazmat Squad", icon: "science", primary: true },
            { id: "ORDER_EXCLUSION", label: "Establish Exclusion Zone", icon: "do_not_disturb" },
            { id: "REQUEST_EMS", label: "Request Chemical Burn EMS", icon: "medical_services" },
            { id: "REQUEST_POLICE", label: "Request Police Cordon", icon: "local_police" }
        ]
    },
    COLLAPSE: {
        id: "COLLAPSE",
        departmentCode: "USAR",
        title: "Urban Search & Structural Collapse Command",
        subtitle: "USAR Heavy Rescue Wing • Void Entrapment & Seismic Search",
        sectorCode: "CAD-USAR",
        icon: "domain_disabled",
        primaryColor: "#ea580c",
        badgeBg: "bg-orange-500/15 text-orange-400 border-orange-500/30",
        bannerBg: "from-stone-900 via-orange-950 to-slate-950",
        activeAlert: "Multi-Story Structural Failure • Void Entrapment Listening Active",
        unitCategory: "Heavy Concrete Breakers, Cranes & K9 Teams",
        kpis: [
            { id: "collapseInc", label: "Collapse Sites", icon: "domain_disabled", color: "text-error", compute: (incidents) => incidents.length || 2 },
            { id: "victimsVoid", label: "Confirmed in Voids", icon: "person_search", color: "text-orange-400", compute: () => 7 },
            { id: "k9Ready", label: "USAR K9 Teams", icon: "pets", color: "text-amber-400", compute: () => 4 },
            { id: "seismicSensors", label: "Acoustic Sensors Live", icon: "sensors", color: "text-cyan-400", compute: () => 8 },
            { id: "cranesReady", label: "100T Cranes On-Site", icon: "precision_manufacturing", color: "text-emerald-400", compute: () => 2 }
        ],
        resourceReadiness: [
            { name: "Diamond Blade Concrete Cutters", total: 8, available: 6 },
            { name: "Acoustic Void Listening Devices", total: 6, available: 5 },
            { name: "Certified USAR Search K9 Units", total: 6, available: 4 },
            { name: "Pneumatic Trench / Shoring Struts", total: 20, available: 16 }
        ],
        actions: [
            { id: "DISPATCH_USAR", label: "Dispatch USAR Heavy Team", icon: "engineering", primary: true },
            { id: "DEPLOY_K9", label: "Deploy K9 Search Team", icon: "pets" },
            { id: "REQUEST_EMS", label: "Request Field Surgery Unit", icon: "medical_services" },
            { id: "REQUEST_POLICE", label: "Request Site Lockdown", icon: "local_police" }
        ]
    },
    CYCLONE: {
        id: "CYCLONE",
        departmentCode: "DISASTER_RESPONSE",
        title: "Severe Cyclone & Coastal Disaster Command",
        subtitle: "Coastal Emergency Center • Gale Debris & Lifeline Restoration",
        sectorCode: "CAD-CYC",
        icon: "cyclone",
        primaryColor: "#7c3aed",
        badgeBg: "bg-purple-500/15 text-purple-400 border-purple-500/30",
        bannerBg: "from-indigo-950 via-purple-950 to-slate-950",
        activeAlert: "Category-3 Cyclone Landfall Warning • 120km/h Gale Winds",
        unitCategory: "Mobile Gensets, Chainsaws & Storm Lifeline Units",
        kpis: [
            { id: "stormInc", label: "Storm Hotspots", icon: "cyclone", color: "text-purple-400", compute: (incidents) => incidents.length || 8 },
            { id: "downedLines", label: "Live Lines Down", icon: "bolt", color: "text-yellow-400", compute: () => 14 },
            { id: "roadsBlockedTree", label: "Arterials Blocked", icon: "nature", color: "text-amber-400", compute: () => 9 },
            { id: "shelteredCiv", label: "Civilians in Shelters", icon: "night_shelter", color: "text-cyan-400", compute: () => 420 },
            { id: "gensetsActive", label: "Mobile Gensets Live", icon: "power", color: "text-emerald-400", compute: () => 12 }
        ],
        resourceReadiness: [
            { name: "Heavy Chainsaw Clearance Crews", total: 15, available: 10 },
            { name: "Trailer-Mounted 250kVA Generators", total: 8, available: 5 },
            { name: "High-Clearance 4x4 Storm Rescue Trucks", total: 12, available: 9 },
            { name: "Emergency Satellite Comms Kits", total: 6, available: 5 }
        ],
        actions: [
            { id: "DISPATCH_DEBRIS", label: "Dispatch Tree Clearance Crew", icon: "nature", primary: true },
            { id: "DISPATCH_GENSET", label: "Deploy Emergency Generator", icon: "bolt" },
            { id: "REQUEST_EMS", label: "Request Mobile Clinic", icon: "medical_services" },
            { id: "REQUEST_POLICE", label: "Request Coastal Evacuation", icon: "local_police" }
        ]
    },
    SEARCH_RESCUE: {
        id: "SEARCH_RESCUE",
        departmentCode: "SEARCH_RESCUE",
        title: "Wilderness & Aerial Drone SAR Command",
        subtitle: "Mountain & Forest Sector • Thermal Aerial Grid Tracking",
        sectorCode: "CAD-SAR",
        icon: "travel_explore",
        primaryColor: "#16a34a",
        badgeBg: "bg-green-500/15 text-green-400 border-green-500/30",
        bannerBg: "from-green-950 via-slate-900 to-slate-950",
        activeAlert: "Night Ridge Search Active • Thermal Aerial Grid Deployed",
        unitCategory: "Thermal Aerial Drones, Offroad 4x4 & SAR K9",
        kpis: [
            { id: "activeSAR", label: "Missing Operations", icon: "person_search", color: "text-emerald-400", compute: (incidents) => incidents.length || 3 },
            { id: "dronesFlying", label: "Thermal Drones Airborne", icon: "flight", color: "text-cyan-400", compute: () => 4 },
            { id: "k9SAR", label: "SAR Scent Dogs Active", icon: "pets", color: "text-amber-400", compute: () => 3 },
            { id: "gridSearched", label: "Grid Area Covered", icon: "grid_on", color: "text-purple-400", compute: () => "42 km²" },
            { id: "hoursMissing", label: "Average Time Elased", icon: "schedule", color: "text-error", compute: () => "4.2 hrs" }
        ],
        resourceReadiness: [
            { name: "Long-Range Thermal Drone Rigs", total: 6, available: 4 },
            { name: "Mountain Rescue Scent Canines", total: 5, available: 3 },
            { name: "High-Lift 4x4 Wilderness Rigs", total: 8, available: 6 },
            { name: "Rope & Cliff Extrication Kits", total: 10, available: 8 }
        ],
        actions: [
            { id: "DISPATCH_DRONE", label: "Deploy Thermal Drone Grid", icon: "flight", primary: true },
            { id: "DISPATCH_K9", label: "Deploy Scent Trackers", icon: "pets" },
            { id: "REQUEST_EMS", label: "Request Hypothermia EMS", icon: "medical_services" },
            { id: "REQUEST_POLICE", label: "Request Search Perimeter", icon: "local_police" }
        ]
    },
    PUBLIC_WORKS: {
        id: "PUBLIC_WORKS",
        departmentCode: "PUBLIC_WORKS",
        title: "Public Works & Infrastructure Restoration",
        subtitle: "Municipal Engineering & Arterial Emergency Logistics",
        sectorCode: "CAD-PUB",
        icon: "construction",
        primaryColor: "#0284c7",
        badgeBg: "bg-teal-500/15 text-teal-400 border-teal-500/30",
        bannerBg: "from-teal-950 via-slate-900 to-slate-950",
        activeAlert: "Bridge Scour & Culvert Breach Active • Heavy Machinery Dispatched",
        unitCategory: "Excavators, Sandbag Trucks & High-Capacity Pumps",
        kpis: [
            { id: "infraBreaches", label: "Active Breaches", icon: "broken_image", color: "text-error", compute: (incidents) => incidents.length || 4 },
            { id: "heavyEquip", label: "Excavators Deployed", icon: "construction", color: "text-amber-400", compute: () => 6 },
            { id: "pumpsRunning", label: "Dewatering Pumps", icon: "water_damage", color: "text-cyan-400", compute: () => 11 },
            { id: "sandbagsPlaced", label: "Sandbags Emplaced", icon: "layers", color: "text-emerald-400", compute: () => "2,400" },
            { id: "bridgeStatus", label: "Bridges Under Watch", icon: "bridge", color: "text-yellow-400", compute: () => 3 }
        ],
        resourceReadiness: [
            { name: "Tracked Hydraulic Excavators", total: 6, available: 4 },
            { name: "Tri-Axle Dump Trucks (Debris)", total: 10, available: 7 },
            { name: "Automated Sandbag Filling Units", total: 4, available: 3 },
            { name: "High-Volume Dewatering Pumps", total: 12, available: 8 }
        ],
        actions: [
            { id: "DISPATCH_BACKHOE", label: "Dispatch Heavy Excavator", icon: "construction", primary: true },
            { id: "SANDBAG_WALL", label: "Deploy Sandbag Barrier", icon: "layers" },
            { id: "REQUEST_POLICE", label: "Request Road Blockade", icon: "local_police" },
            { id: "REQUEST_FLOOD", label: "Coordinate with Flood NDRF", icon: "waves" }
        ]
    }
};

/**
 * Returns configuration for a given department / category key
 */
export function getDepartmentConfig(categoryOrDeptKey) {
    if (!categoryOrDeptKey) return DEPARTMENT_CONSOLE_CONFIGS.FLOOD;
    const cleanKey = categoryOrDeptKey.toUpperCase().replace("CAT_", "").replace("CAD-", "").replace("DISASTER_RESPONSE", "FLOOD").replace("FIRE_RESCUE", "FIRE").replace("MEDICAL_EMS", "MEDICAL").replace("USAR", "COLLAPSE");
    return DEPARTMENT_CONSOLE_CONFIGS[cleanKey] || DEPARTMENT_CONSOLE_CONFIGS.FLOOD;
}
