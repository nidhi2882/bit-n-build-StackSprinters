package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type; // e.g. "Flood", "Fire", "Medical"

    @Column(name = "category")
    private String category; // "FLOOD", "FIRE", "MEDICAL", "CRASH", "HAZMAT", "COLLAPSE", "CYCLONE", "SEARCH_RESCUE", "POLICE"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer severity; // 1 to 5

    @Column(nullable = false)
    private String status; // "Reported", "Assigned", "En Route", "Arrived", "Resolved"

    @Column(name = "location_name")
    private String locationName;

    private Double lat;

    private Double lng;

    @Column(name = "reported_at")
    private LocalDateTime reportedAt;

    @Column(name = "reporter_id")
    private String reporterId;

    @Column(name = "reporter_role")
    private String reporterRole;

    @Column(name = "reporter_name")
    private String reporterName;

    @Column(name = "reporter_email")
    private String reporterEmail;

    @Column(name = "reporter_phone")
    private String reporterPhone;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "ai_confidence")
    private Double aiConfidence;

    @Column(name = "duplicate_count")
    private Integer duplicateCount = 0;

    @Column(name = "assigned_unit_id")
    private String assignedUnitId;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "incident_capabilities", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "capability")
    private List<String> requiredCapabilities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "incident_assigned_resources", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "resource_id")
    private List<String> assignedResourceIds = new ArrayList<>();

    @Column(name = "is_merged")
    private Boolean isMerged = false;

    @Column(name = "merged_into_incident_id")
    private String mergedIntoIncidentId;

    public Incident() {}

    public Incident(String id, String title, String type, String category, String description, Integer severity, String status, String locationName, Double lat, Double lng, LocalDateTime reportedAt, String reporterId, String reporterRole, String reporterName, String reporterEmail, String reporterPhone, String aiSummary, Double aiConfidence, Integer duplicateCount, String assignedUnitId, List<String> requiredCapabilities, List<String> assignedResourceIds, Boolean isMerged, String mergedIntoIncidentId) {
        this.id = id;
        this.title = title;
        this.type = type;
        this.category = category;
        this.description = description;
        this.severity = severity;
        this.status = status != null ? status : "Reported";
        this.locationName = locationName;
        this.lat = lat;
        this.lng = lng;
        this.reportedAt = reportedAt != null ? reportedAt : LocalDateTime.now();
        this.reporterId = reporterId;
        this.reporterRole = reporterRole;
        this.reporterName = reporterName;
        this.reporterEmail = reporterEmail;
        this.reporterPhone = reporterPhone;
        this.aiSummary = aiSummary;
        this.aiConfidence = aiConfidence;
        this.duplicateCount = duplicateCount != null ? duplicateCount : 0;
        this.assignedUnitId = assignedUnitId;
        this.requiredCapabilities = requiredCapabilities != null ? requiredCapabilities : new ArrayList<>();
        this.assignedResourceIds = assignedResourceIds != null ? assignedResourceIds : new ArrayList<>();
        this.isMerged = isMerged != null ? isMerged : false;
        this.mergedIntoIncidentId = mergedIntoIncidentId;
    }

    @PrePersist
    protected void onCreate() {
        if (reportedAt == null) {
            reportedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "Reported";
        }
        if (duplicateCount == null) {
            duplicateCount = 0;
        }
        if (isMerged == null) {
            isMerged = false;
        }
        if (category == null && type != null) {
            DepartmentCategory dc = DepartmentCategory.fromString(type);
            this.category = dc != null ? dc.name() : type.toUpperCase();
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { 
        this.type = type;
        if (this.category == null && type != null) {
            DepartmentCategory dc = DepartmentCategory.fromString(type);
            this.category = dc != null ? dc.name() : type.toUpperCase();
        }
    }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSeverity() { return severity; }
    public void setSeverity(Integer severity) { this.severity = severity; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public LocalDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(LocalDateTime reportedAt) { this.reportedAt = reportedAt; }

    public String getReporterId() { return reporterId; }
    public void setReporterId(String reporterId) { this.reporterId = reporterId; }

    public String getReporterRole() { return reporterRole; }
    public void setReporterRole(String reporterRole) { this.reporterRole = reporterRole; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterEmail() { return reporterEmail; }
    public void setReporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; }

    public String getReporterPhone() { return reporterPhone; }
    public void setReporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; }

    public String getAiSummary() { return aiSummary; }
    public void setAiSummary(String aiSummary) { this.aiSummary = aiSummary; }

    public Double getAiConfidence() { return aiConfidence; }
    public void setAiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; }

    public Integer getDuplicateCount() { return duplicateCount; }
    public void setDuplicateCount(Integer duplicateCount) { this.duplicateCount = duplicateCount; }

    public String getAssignedUnitId() { return assignedUnitId; }
    public void setAssignedUnitId(String assignedUnitId) { this.assignedUnitId = assignedUnitId; }

    public List<String> getRequiredCapabilities() {
        if (requiredCapabilities == null) requiredCapabilities = new ArrayList<>();
        return requiredCapabilities;
    }
    public void setRequiredCapabilities(List<String> requiredCapabilities) { this.requiredCapabilities = requiredCapabilities; }

    public List<String> getAssignedResourceIds() {
        if (assignedResourceIds == null) assignedResourceIds = new ArrayList<>();
        return assignedResourceIds;
    }
    public void setAssignedResourceIds(List<String> assignedResourceIds) { this.assignedResourceIds = assignedResourceIds; }

    public Boolean getIsMerged() { return isMerged; }
    public void setIsMerged(Boolean isMerged) { this.isMerged = isMerged; }

    public String getMergedIntoIncidentId() { return mergedIntoIncidentId; }
    public void setMergedIntoIncidentId(String mergedIntoIncidentId) { this.mergedIntoIncidentId = mergedIntoIncidentId; }

    // Builder
    public static IncidentBuilder builder() { return new IncidentBuilder(); }

    public static class IncidentBuilder {
        private String id;
        private String title;
        private String type;
        private String category;
        private String description;
        private Integer severity;
        private String status;
        private String locationName;
        private Double lat;
        private Double lng;
        private LocalDateTime reportedAt;
        private String reporterId;
        private String reporterRole;
        private String reporterName;
        private String reporterEmail;
        private String reporterPhone;
        private String aiSummary;
        private Double aiConfidence;
        private Integer duplicateCount = 0;
        private String assignedUnitId;
        private List<String> requiredCapabilities = new ArrayList<>();
        private List<String> assignedResourceIds = new ArrayList<>();
        private Boolean isMerged = false;
        private String mergedIntoIncidentId;

        public IncidentBuilder id(String id) { this.id = id; return this; }
        public IncidentBuilder title(String title) { this.title = title; return this; }
        public IncidentBuilder type(String type) { this.type = type; return this; }
        public IncidentBuilder category(String category) { this.category = category; return this; }
        public IncidentBuilder description(String description) { this.description = description; return this; }
        public IncidentBuilder severity(Integer severity) { this.severity = severity; return this; }
        public IncidentBuilder status(String status) { this.status = status; return this; }
        public IncidentBuilder locationName(String locationName) { this.locationName = locationName; return this; }
        public IncidentBuilder lat(Double lat) { this.lat = lat; return this; }
        public IncidentBuilder lng(Double lng) { this.lng = lng; return this; }
        public IncidentBuilder reportedAt(LocalDateTime reportedAt) { this.reportedAt = reportedAt; return this; }
        public IncidentBuilder reporterId(String reporterId) { this.reporterId = reporterId; return this; }
        public IncidentBuilder reporterRole(String reporterRole) { this.reporterRole = reporterRole; return this; }
        public IncidentBuilder reporterName(String reporterName) { this.reporterName = reporterName; return this; }
        public IncidentBuilder reporterEmail(String reporterEmail) { this.reporterEmail = reporterEmail; return this; }
        public IncidentBuilder reporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; return this; }
        public IncidentBuilder aiSummary(String aiSummary) { this.aiSummary = aiSummary; return this; }
        public IncidentBuilder aiConfidence(Double aiConfidence) { this.aiConfidence = aiConfidence; return this; }
        public IncidentBuilder duplicateCount(Integer duplicateCount) { this.duplicateCount = duplicateCount; return this; }
        public IncidentBuilder assignedUnitId(String assignedUnitId) { this.assignedUnitId = assignedUnitId; return this; }
        public IncidentBuilder requiredCapabilities(List<String> requiredCapabilities) { this.requiredCapabilities = requiredCapabilities; return this; }
        public IncidentBuilder assignedResourceIds(List<String> assignedResourceIds) { this.assignedResourceIds = assignedResourceIds; return this; }
        public IncidentBuilder isMerged(Boolean isMerged) { this.isMerged = isMerged; return this; }
        public IncidentBuilder mergedIntoIncidentId(String mergedIntoIncidentId) { this.mergedIntoIncidentId = mergedIntoIncidentId; return this; }

        public Incident build() {
            return new Incident(id, title, type, category, description, severity, status, locationName, lat, lng, reportedAt, reporterId, reporterRole, reporterName, reporterEmail, reporterPhone, aiSummary, aiConfidence, duplicateCount, assignedUnitId, requiredCapabilities, assignedResourceIds, isMerged, mergedIntoIncidentId);
        }
    }
}
