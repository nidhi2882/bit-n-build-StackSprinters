package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "emergency_categories")
public class EmergencyCategory {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "primary_department")
    private String primaryDepartment;

    @Column(name = "default_priority_code", length = 16)
    private String defaultPriorityCode;

    private String icon;

    private String color;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "category_default_capabilities", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "capability")
    private List<String> defaultRequiredCapabilities = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public EmergencyCategory() {}

    public EmergencyCategory(String id, String name, String description, String primaryDepartment, String defaultPriorityCode, String icon, String color, List<String> defaultRequiredCapabilities, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.primaryDepartment = primaryDepartment;
        this.defaultPriorityCode = defaultPriorityCode;
        this.icon = icon;
        this.color = color;
        this.defaultRequiredCapabilities = defaultRequiredCapabilities != null ? defaultRequiredCapabilities : new ArrayList<>();
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPrimaryDepartment() { return primaryDepartment; }
    public void setPrimaryDepartment(String primaryDepartment) { this.primaryDepartment = primaryDepartment; }

    public String getDefaultPriorityCode() { return defaultPriorityCode; }
    public void setDefaultPriorityCode(String defaultPriorityCode) { this.defaultPriorityCode = defaultPriorityCode; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public List<String> getDefaultRequiredCapabilities() {
        if (defaultRequiredCapabilities == null) defaultRequiredCapabilities = new ArrayList<>();
        return defaultRequiredCapabilities;
    }
    public void setDefaultRequiredCapabilities(List<String> defaultRequiredCapabilities) { this.defaultRequiredCapabilities = defaultRequiredCapabilities; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static EmergencyCategoryBuilder builder() { return new EmergencyCategoryBuilder(); }

    public static class EmergencyCategoryBuilder {
        private String id;
        private String name;
        private String description;
        private String primaryDepartment;
        private String defaultPriorityCode;
        private String icon;
        private String color;
        private List<String> defaultRequiredCapabilities = new ArrayList<>();
        private LocalDateTime createdAt;

        public EmergencyCategoryBuilder id(String id) { this.id = id; return this; }
        public EmergencyCategoryBuilder name(String name) { this.name = name; return this; }
        public EmergencyCategoryBuilder description(String description) { this.description = description; return this; }
        public EmergencyCategoryBuilder primaryDepartment(String primaryDepartment) { this.primaryDepartment = primaryDepartment; return this; }
        public EmergencyCategoryBuilder defaultPriorityCode(String defaultPriorityCode) { this.defaultPriorityCode = defaultPriorityCode; return this; }
        public EmergencyCategoryBuilder icon(String icon) { this.icon = icon; return this; }
        public EmergencyCategoryBuilder color(String color) { this.color = color; return this; }
        public EmergencyCategoryBuilder defaultRequiredCapabilities(List<String> defaultRequiredCapabilities) { this.defaultRequiredCapabilities = defaultRequiredCapabilities; return this; }
        public EmergencyCategoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public EmergencyCategory build() {
            return new EmergencyCategory(id, name, description, primaryDepartment, defaultPriorityCode, icon, color, defaultRequiredCapabilities, createdAt);
        }
    }
}
