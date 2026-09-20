package com.resqgrid.backend.entity;

public enum Role {
    SUPER_ADMIN,
    DEPARTMENT_ADMIN,
    CITIZEN;

    public static Role fromString(String val) {
        if (val == null) return CITIZEN;
        String clean = val.trim().toUpperCase().replace(" ", "_").replace("-", "_");
        for (Role r : values()) {
            if (r.name().equalsIgnoreCase(clean)) return r;
        }
        if (clean.contains("SUPER")) return SUPER_ADMIN;
        if (clean.contains("DEPT") || clean.contains("DEPARTMENT")) return DEPARTMENT_ADMIN;
        return CITIZEN;
    }
}
