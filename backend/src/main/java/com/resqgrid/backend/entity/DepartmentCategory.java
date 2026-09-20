package com.resqgrid.backend.entity;

public enum DepartmentCategory {
    FLOOD,
    FIRE,
    MEDICAL,
    CRASH,
    HAZMAT,
    COLLAPSE,
    CYCLONE,
    SEARCH_RESCUE,
    POLICE;

    public static DepartmentCategory fromString(String val) {
        if (val == null) return null;
        String clean = val.trim().toUpperCase().replace(" ", "_").replace("-", "_").replace("&", "").replace("__", "_");
        for (DepartmentCategory c : values()) {
            if (c.name().equalsIgnoreCase(clean)) {
                return c;
            }
        }
        if (clean.contains("WATER") || clean.contains("HYDRO") || clean.contains("FLOOD")) return FLOOD;
        if (clean.contains("FIRE")) return FIRE;
        if (clean.contains("EMS") || clean.contains("MEDIC") || clean.contains("AMBULANCE")) return MEDICAL;
        if (clean.contains("CRASH") || clean.contains("ACCIDENT") || clean.contains("HIGHWAY") || clean.contains("TRAFFIC")) return CRASH;
        if (clean.contains("HAZMAT") || clean.contains("CBRN") || clean.contains("CHEMICAL") || clean.contains("TOXIC")) return HAZMAT;
        if (clean.contains("COLLAPSE") || clean.contains("USAR") || clean.contains("STRUCTURAL")) return COLLAPSE;
        if (clean.contains("CYCLONE") || clean.contains("WEATHER") || clean.contains("STORM") || clean.contains("HURRICANE")) return CYCLONE;
        if (clean.contains("SEARCH") || clean.contains("RESCUE") || clean.contains("SAR") || clean.contains("K9")) return SEARCH_RESCUE;
        if (clean.contains("POLICE") || clean.contains("LAW") || clean.contains("SECURITY")) return POLICE;
        return null;
    }
}
