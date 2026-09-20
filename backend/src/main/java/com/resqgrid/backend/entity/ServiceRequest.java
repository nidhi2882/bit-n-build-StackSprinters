package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests")
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false, length = 64)
    private String incidentId;

    @Column(name = "requested_by_department", nullable = false)
    private String requestedByDepartment;

    @Column(name = "requested_department", nullable = false)
    private String requestedDepartment;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false)
    private String urgency; // CRITICAL, HIGH, NORMAL

    @Column(nullable = false)
    private String status; // PENDING, ACCEPTED, DECLINED, RESOLVED

    @Column(name = "assigned_unit_id")
    private String assignedUnitId;

    @Column(name = "decline_reason")
    private String declineReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ServiceRequest() {}

    public ServiceRequest(Long id, String incidentId, String requestedByDepartment, String requestedDepartment, String reason, String urgency, String status, String assignedUnitId, String declineReason, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.incidentId = incidentId;
        this.requestedByDepartment = requestedByDepartment;
        this.requestedDepartment = requestedDepartment;
        this.reason = reason;
        this.urgency = urgency != null ? urgency : "NORMAL";
        this.status = status != null ? status : "PENDING";
        this.assignedUnitId = assignedUnitId;
        this.declineReason = declineReason;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.updatedAt = updatedAt != null ? updatedAt : LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "PENDING";
        }
        if (urgency == null) {
            urgency = "NORMAL";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getRequestedByDepartment() { return requestedByDepartment; }
    public void setRequestedByDepartment(String requestedByDepartment) { this.requestedByDepartment = requestedByDepartment; }

    public String getRequestedDepartment() { return requestedDepartment; }
    public void setRequestedDepartment(String requestedDepartment) { this.requestedDepartment = requestedDepartment; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedUnitId() { return assignedUnitId; }
    public void setAssignedUnitId(String assignedUnitId) { this.assignedUnitId = assignedUnitId; }

    public String getDeclineReason() { return declineReason; }
    public void setDeclineReason(String declineReason) { this.declineReason = declineReason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static ServiceRequestBuilder builder() { return new ServiceRequestBuilder(); }

    public static class ServiceRequestBuilder {
        private Long id;
        private String incidentId;
        private String requestedByDepartment;
        private String requestedDepartment;
        private String reason;
        private String urgency;
        private String status;
        private String assignedUnitId;
        private String declineReason;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ServiceRequestBuilder id(Long id) { this.id = id; return this; }
        public ServiceRequestBuilder incidentId(String incidentId) { this.incidentId = incidentId; return this; }
        public ServiceRequestBuilder requestedByDepartment(String requestedByDepartment) { this.requestedByDepartment = requestedByDepartment; return this; }
        public ServiceRequestBuilder requestedDepartment(String requestedDepartment) { this.requestedDepartment = requestedDepartment; return this; }
        public ServiceRequestBuilder reason(String reason) { this.reason = reason; return this; }
        public ServiceRequestBuilder urgency(String urgency) { this.urgency = urgency; return this; }
        public ServiceRequestBuilder status(String status) { this.status = status; return this; }
        public ServiceRequestBuilder assignedUnitId(String assignedUnitId) { this.assignedUnitId = assignedUnitId; return this; }
        public ServiceRequestBuilder declineReason(String declineReason) { this.declineReason = declineReason; return this; }
        public ServiceRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ServiceRequestBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public ServiceRequest build() {
            return new ServiceRequest(id, incidentId, requestedByDepartment, requestedDepartment, reason, urgency, status, assignedUnitId, declineReason, createdAt, updatedAt);
        }
    }
}
