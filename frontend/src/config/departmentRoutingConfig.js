/**
 * ResQGrid Centralized Department Routing Matrix
 * Defines taxonomy-to-department ownership, secondary mutual aid dependencies,
 * required resource types, and response SLA baselines.
 */

export const DEPARTMENT_KEYS = {
    FLOOD: "FLOOD",
    FIRE: "FIRE",
    MEDICAL: "MEDICAL",
    CRASH: "CRASH",
    HAZMAT: "HAZMAT",
    COLLAPSE: "COLLAPSE",
    CYCLONE: "CYCLONE",
    SEARCH_RESCUE: "SEARCH_RESCUE",
    POLICE: "POLICE",
    PUBLIC_WORKS: "PUBLIC_WORKS"
};

export const DEPARTMENT_ROUTING_MATRIX = {
    [DEPARTMENT_KEYS.FLOOD]: {
        primaryDepartment: "DISASTER_RESPONSE",
        categoryKey: "FLOOD",
        label: "Disaster & Flood Response",
        cadCode: "CAD-FLOOD",
        supportingDepartments: ["FIRE_RESCUE", "MEDICAL_EMS", "POLICE", "PUBLIC_WORKS"],
        requiredResources: ["RESCUE_BOAT", "LIFE_JACKET", "AMBULANCE", "WATER_PUMP"],
        slaMinutes: 10,
        criticalKeywords: ["trapped", "submerged", "drowning", "roof", "rising rapidly", "dam breach"]
    },
    [DEPARTMENT_KEYS.FIRE]: {
        primaryDepartment: "FIRE_RESCUE",
        categoryKey: "FIRE",
        label: "Fire Suppression & Heavy Rescue",
        cadCode: "CAD-FIRE",
        supportingDepartments: ["MEDICAL_EMS", "POLICE", "HAZMAT", "UTILITY"],
        requiredResources: ["FIRE_ENGINE", "FOAM_TENDER", "LADDER_TRUCK", "AMBULANCE"],
        slaMinutes: 8,
        criticalKeywords: ["explosion", "trapped", "spreading", "chemical", "high rise", "workers inside"]
    },
    [DEPARTMENT_KEYS.MEDICAL]: {
        primaryDepartment: "MEDICAL_EMS",
        categoryKey: "MEDICAL",
        label: "Emergency Medical & Trauma EMS",
        cadCode: "CAD-MED",
        supportingDepartments: ["HOSPITALS", "POLICE", "FIRE_RESCUE"],
        requiredResources: ["ALS_AMBULANCE", "TRAUMA_TEAM", "ICU_BED", "TRIAGE_KIT"],
        slaMinutes: 7,
        criticalKeywords: ["unconscious", "cardiac", "mass casualty", "severe bleeding", "critical", "child"]
    },
    [DEPARTMENT_KEYS.CRASH]: {
        primaryDepartment: "POLICE",
        categoryKey: "CRASH",
        label: "Traffic & Highway Patrol",
        cadCode: "CAD-CRASH",
        supportingDepartments: ["FIRE_RESCUE", "MEDICAL_EMS", "TOW_RECOVERY"],
        requiredResources: ["PATROL_UNIT", "HYDRAULIC_CUTTER", "AMBULANCE", "HEAVY_TOW"],
        slaMinutes: 10,
        criticalKeywords: ["pileup", "extrication", "highway blocked", "fire", "fatalities", "tanker"]
    },
    [DEPARTMENT_KEYS.HAZMAT]: {
        primaryDepartment: "HAZMAT",
        categoryKey: "HAZMAT",
        label: "Industrial Hazmat & CBRN Mitigation",
        cadCode: "CAD-HAZ",
        supportingDepartments: ["FIRE_RESCUE", "MEDICAL_EMS", "POLICE", "ENVIRONMENTAL"],
        requiredResources: ["LEVEL_A_SUIT", "GAS_DETECTOR", "DECON_RIG", "CONTAINMENT_BOOM"],
        slaMinutes: 12,
        criticalKeywords: ["toxic gas", "ammonia", "chlorine", "chemical burn", "corrosive", "acid spill"]
    },
    [DEPARTMENT_KEYS.COLLAPSE]: {
        primaryDepartment: "USAR",
        categoryKey: "COLLAPSE",
        label: "Urban Search & Heavy Structural Rescue",
        cadCode: "CAD-USAR",
        supportingDepartments: ["FIRE_RESCUE", "MEDICAL_EMS", "POLICE", "PUBLIC_WORKS"],
        requiredResources: ["USAR_K9", "CONCRETE_CUTTER", "HEAVY_CRANE", "AMBULANCE"],
        slaMinutes: 10,
        criticalKeywords: ["trapped under rubble", "building collapse", "void search", "workers buried"]
    },
    [DEPARTMENT_KEYS.CYCLONE]: {
        primaryDepartment: "DISASTER_RESPONSE",
        categoryKey: "CYCLONE",
        label: "Severe Cyclone & Coastal Storm",
        cadCode: "CAD-CYC",
        supportingDepartments: ["FIRE_RESCUE", "MEDICAL_EMS", "POLICE", "UTILITY", "PUBLIC_WORKS"],
        requiredResources: ["GENSET", "TREE_CLEARER", "RESCUE_BOAT", "SHELTER_KIT"],
        slaMinutes: 15,
        criticalKeywords: ["roof blown", "live wire down", "storm surge", "hospital dark", "debris"]
    },
    [DEPARTMENT_KEYS.SEARCH_RESCUE]: {
        primaryDepartment: "SEARCH_RESCUE",
        categoryKey: "SEARCH_RESCUE",
        label: "Wilderness & Aerial Drone SAR",
        cadCode: "CAD-SAR",
        supportingDepartments: ["POLICE", "FIRE_RESCUE", "MEDICAL_EMS"],
        requiredResources: ["THERMAL_DRONE", "K9_TRACKER", "4X4_OFFROAD", "FIELD_MEDIC"],
        slaMinutes: 12,
        criticalKeywords: ["lost hiker", "mountain ravine", "hypothermia", "night search", "avalanche"]
    },
    [DEPARTMENT_KEYS.POLICE]: {
        primaryDepartment: "POLICE",
        categoryKey: "POLICE",
        label: "Metropolitan Police Tactical Command",
        cadCode: "CAD-POLICE",
        supportingDepartments: ["MEDICAL_EMS", "FIRE_RESCUE"],
        requiredResources: ["TACTICAL_SQUAD", "PATROL_CAR", "CROWD_BARRICADE"],
        slaMinutes: 8,
        criticalKeywords: ["armed", "hostage", "crowd surge", "stampede", "riot", "active perimeter"]
    },
    [DEPARTMENT_KEYS.PUBLIC_WORKS]: {
        primaryDepartment: "PUBLIC_WORKS",
        categoryKey: "PUBLIC_WORKS",
        label: "Public Works & Heavy Infrastructure",
        cadCode: "CAD-PUB",
        supportingDepartments: ["POLICE", "DISASTER_RESPONSE"],
        requiredResources: ["BACKHOE", "DEBRIS_TRUCK", "SANDBAG_CREW", "SUBMERSIBLE_PUMP"],
        slaMinutes: 20,
        criticalKeywords: ["bridge failure", "culvert burst", "road washed away", "dam gate failure"]
    }
};

/**
 * Intelligent NLP & heuristic rule routing analyzer
 * Inspects description text + optional explicit category to determine:
 * 1. Incident category & Primary department
 * 2. Secondary/supporting departments with context-specific reasons
 * 3. Required resources
 * 4. Recommended severity floor
 * 5. SLA minutes
 */
export function detectRouting(text = "", explicitCategory = "") {
    const cleanText = (text || "").toLowerCase();
    let primaryKey = explicitCategory ? explicitCategory.toUpperCase() : null;

    // 1. Determine Primary Category if not explicitly provided or defaulted
    if (!primaryKey || primaryKey === "AUTO" || !DEPARTMENT_ROUTING_MATRIX[primaryKey]) {
        if (cleanText.includes("flood") || cleanText.includes("water level") || cleanText.includes("submerged") || cleanText.includes("drowning") || cleanText.includes("river")) {
            primaryKey = DEPARTMENT_KEYS.FLOOD;
        } else if (cleanText.includes("fire") || cleanText.includes("smoke") || cleanText.includes("flame") || cleanText.includes("burning") || cleanText.includes("blaze")) {
            primaryKey = DEPARTMENT_KEYS.FIRE;
        } else if (cleanText.includes("chemical") || cleanText.includes("toxic") || cleanText.includes("gas leak") || cleanText.includes("hazmat") || cleanText.includes("ammonia")) {
            primaryKey = DEPARTMENT_KEYS.HAZMAT;
        } else if (cleanText.includes("crash") || cleanText.includes("accident") || cleanText.includes("collision") || cleanText.includes("overturn") || cleanText.includes("pileup")) {
            primaryKey = DEPARTMENT_KEYS.CRASH;
        } else if (cleanText.includes("collapse") || cleanText.includes("rubble") || cleanText.includes("building fell") || cleanText.includes("debris")) {
            primaryKey = DEPARTMENT_KEYS.COLLAPSE;
        } else if (cleanText.includes("cyclone") || cleanText.includes("gale") || cleanText.includes("hurricane") || cleanText.includes("storm surge")) {
            primaryKey = DEPARTMENT_KEYS.CYCLONE;
        } else if (cleanText.includes("missing") || cleanText.includes("lost in") || cleanText.includes("ravine") || cleanText.includes("search")) {
            primaryKey = DEPARTMENT_KEYS.SEARCH_RESCUE;
        } else if (cleanText.includes("unconscious") || cleanText.includes("cardiac") || cleanText.includes("heart attack") || cleanText.includes("bleeding") || cleanText.includes("injured") || cleanText.includes("patient")) {
            primaryKey = DEPARTMENT_KEYS.MEDICAL;
        } else if (cleanText.includes("robbery") || cleanText.includes("assault") || cleanText.includes("crowd") || cleanText.includes("riot") || cleanText.includes("weapon")) {
            primaryKey = DEPARTMENT_KEYS.POLICE;
        } else {
            primaryKey = DEPARTMENT_KEYS.FLOOD; // Default fallback
        }
    }

    const baseConfig = DEPARTMENT_ROUTING_MATRIX[primaryKey] || DEPARTMENT_ROUTING_MATRIX[DEPARTMENT_KEYS.FLOOD];

    // 2. Smart Secondary Department Detection
    const secondaryRequests = [];
    const neededResources = new Set(baseConfig.requiredResources);

    // Check for Medical Support needs
    const medicalKeywords = ["injured", "casualty", "casualties", "unconscious", "burns", "patient", "bleeding", "cardiac", "trauma", "suffocating"];
    const needsMedical = medicalKeywords.some(k => cleanText.includes(k));
    if (needsMedical && primaryKey !== DEPARTMENT_KEYS.MEDICAL) {
        secondaryRequests.push({
            department: "MEDICAL_EMS",
            reason: "Detected civilian casualty or trauma indicators in incident report",
            urgency: "HIGH",
            resources: ["AMBULANCE", "TRAUMA_TEAM"]
        });
        neededResources.add("AMBULANCE");
    }

    // Check for Fire / Extraction Support needs
    const fireRescueKeywords = ["trapped", "flames", "smoke", "extrication", "cutters", "pinned", "second floor", "roof"];
    const needsFireRescue = fireRescueKeywords.some(k => cleanText.includes(k));
    if (needsFireRescue && primaryKey !== DEPARTMENT_KEYS.FIRE && primaryKey !== DEPARTMENT_KEYS.COLLAPSE) {
        secondaryRequests.push({
            department: "FIRE_RESCUE",
            reason: "Detected trapped persons or technical extrication requirement",
            urgency: "CRITICAL",
            resources: ["RESCUE_TEAM", "HYDRAULIC_CUTTERS"]
        });
        neededResources.add("RESCUE_TEAM");
    }

    // Check for Police / Perimeter Support needs
    const policeKeywords = ["crowd", "traffic", "road blocked", "perimeter", "evacuation", "panic", "looting", "bystanders"];
    const needsPolice = policeKeywords.some(k => cleanText.includes(k));
    if (needsPolice && primaryKey !== DEPARTMENT_KEYS.POLICE && primaryKey !== DEPARTMENT_KEYS.CRASH) {
        secondaryRequests.push({
            department: "POLICE",
            reason: "Evacuation zone enforcement, road closure or crowd management required",
            urgency: "HIGH",
            resources: ["PATROL_UNIT", "TRAFFIC_CONTROL"]
        });
        neededResources.add("PATROL_UNIT");
    }

    // Check for Hazmat Support
    const hazmatKeywords = ["chemical", "storage", "toxic", "fumes", "gas", "spill", "odor", "burning plastic"];
    const needsHazmat = hazmatKeywords.some(k => cleanText.includes(k));
    if (needsHazmat && primaryKey !== DEPARTMENT_KEYS.HAZMAT) {
        secondaryRequests.push({
            department: "HAZMAT",
            reason: "Possible chemical hazard or hazardous materials risk detected",
            urgency: "CRITICAL",
            resources: ["HAZMAT_UNIT", "LEVEL_A_SUIT"]
        });
        neededResources.add("HAZMAT_UNIT");
    }

    // Check for Hospital Bed / Trauma Bay request
    const hospitalKeywords = ["hospital", "icu", "critical condition", "burn ward", "er"];
    const needsHospital = hospitalKeywords.some(k => cleanText.includes(k));
    if (needsHospital || (primaryKey === DEPARTMENT_KEYS.MEDICAL && needsMedical)) {
        secondaryRequests.push({
            department: "HOSPITALS",
            reason: "Trauma bed reserve and incoming emergency triage alert",
            urgency: "HIGH",
            resources: ["ICU_BED", "TRAUMA_BAY"]
        });
    }

    // Calculate dynamic severity floor
    let suggestedSeverity = 3;
    const hasCriticalKW = baseConfig.criticalKeywords.some(k => cleanText.includes(k));
    if (hasCriticalKW || secondaryRequests.length >= 2) {
        suggestedSeverity = 5;
    } else if (secondaryRequests.length === 1 || cleanText.length > 50) {
        suggestedSeverity = 4;
    }

    return {
        category: primaryKey,
        primaryDepartment: baseConfig.primaryDepartment,
        departmentLabel: baseConfig.label,
        cadCode: baseConfig.cadCode,
        secondaryDepartments: secondaryRequests.map(r => r.department),
        secondaryRequests,
        requiredResources: Array.from(neededResources),
        slaMinutes: baseConfig.slaMinutes,
        suggestedSeverity,
        requiresMedicalAssistance: needsMedical || primaryKey === DEPARTMENT_KEYS.MEDICAL,
        requiresPoliceAssistance: needsPolice || primaryKey === DEPARTMENT_KEYS.POLICE || primaryKey === DEPARTMENT_KEYS.CRASH,
        requiresCrossDeptCoordination: secondaryRequests.length > 0
    };
}
