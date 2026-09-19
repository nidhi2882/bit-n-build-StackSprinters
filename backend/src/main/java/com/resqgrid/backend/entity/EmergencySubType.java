package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "emergency_sub_types")
public class EmergencySubType {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "category_id", nullable = false, length = 64)
    private String categoryId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "primary_department")
    private String primaryDepartment;

    @Column(name = "default_severity")
    private Integer defaultSeverity;

    @Column(name = "dispatch_sla_mins")
    private Integer dispatchSlaMins;

    @Column(name = "max_response_sla_mins")
    private Integer maxResponseSlaMins;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sub_type_capabilities", joinColumns = @JoinColumn(name = "sub_type_id"))
    @Column(name = "capability")
    private List<String> defaultCapabilities = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public EmergencySubType() {}

    public EmergencySubType(String id, String categoryId, String name, String description, String primaryDepartment, Integer defaultSeverity, Integer dispatchSlaMins, Integer maxResponseSlaMins, List<String> defaultCapabilities, LocalDateTime createdAt) {
        this.id = id;
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
        this.primaryDepartment = primaryDepartment;
        this.defaultSeverity = defaultSeverity;
        this.dispatchSlaMins = dispatchSlaMins;
        this.maxResponseSlaMins = maxResponseSlaMins;
        this.defaultCapabilities = defaultCapabilities != null ? defaultCapabilities : new ArrayList<>();
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

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPrimaryDepartment() { return primaryDepartment; }
    public void setPrimaryDepartment(String primaryDepartment) { this.primaryDepartment = primaryDepartment; }

    public Integer getDefaultSeverity() { return defaultSeverity; }
    public void setDefaultSeverity(Integer defaultSeverity) { this.defaultSeverity = defaultSeverity; }

    public Integer getDispatchSlaMins() { return dispatchSlaMins; }
    public void setDispatchSlaMins(Integer dispatchSlaMins) { this.dispatchSlaMins = dispatchSlaMins; }

    public Integer getMaxResponseSlaMins() { return maxResponseSlaMins; }
    public void setMaxResponseSlaMins(Integer maxResponseSlaMins) { this.maxResponseSlaMins = maxResponseSlaMins; }

    public List<String> getDefaultCapabilities() {
        if (defaultCapabilities == null) defaultCapabilities = new ArrayList<>();
        return defaultCapabilities;
    }
    public void setDefaultCapabilities(List<String> defaultCapabilities) { this.defaultCapabilities = defaultCapabilities; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static EmergencySubTypeBuilder builder() { return new EmergencySubTypeBuilder(); }

    public static class EmergencySubTypeBuilder {
        private String id;
        private String categoryId;
        private String name;
        private String description;
        private String primaryDepartment;
        private Integer defaultSeverity;
        private Integer dispatchSlaMins;
        private Integer maxResponseSlaMins;
        private List<String> defaultCapabilities = new ArrayList<>();
        private LocalDateTime createdAt;

        public EmergencySubTypeBuilder id(String id) { this.id = id; return this; }
        public EmergencySubTypeBuilder categoryId(String categoryId) { this.categoryId = categoryId; return this; }
        public EmergencySubTypeBuilder name(String name) { this.name = name; return this; }
        public EmergencySubTypeBuilder description(String description) { this.description = description; return this; }
        public EmergencySubTypeBuilder primaryDepartment(String primaryDepartment) { this.primaryDepartment = primaryDepartment; return this; }
        public EmergencySubTypeBuilder defaultSeverity(Integer defaultSeverity) { this.defaultSeverity = defaultSeverity; return this; }
        public EmergencySubTypeBuilder dispatchSlaMins(Integer dispatchSlaMins) { this.dispatchSlaMins = dispatchSlaMins; return this; }
        public EmergencySubTypeBuilder maxResponseSlaMins(Integer maxResponseSlaMins) { this.maxResponseSlaMins = maxResponseSlaMins; return this; }
        public EmergencySubTypeBuilder defaultCapabilities(List<String> defaultCapabilities) { this.defaultCapabilities = defaultCapabilities; return this; }
        public EmergencySubTypeBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public EmergencySubType build() {
            return new EmergencySubType(id, categoryId, name, description, primaryDepartment, defaultSeverity, dispatchSlaMins, maxResponseSlaMins, defaultCapabilities, createdAt);
        }
    }
}
