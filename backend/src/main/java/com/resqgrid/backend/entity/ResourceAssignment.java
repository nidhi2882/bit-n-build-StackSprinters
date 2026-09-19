package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "resource_assignments")
public class ResourceAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false, length = 64)
    private String incidentId;

    @Column(name = "resource_id", nullable = false, length = 64)
    private String resourceId;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "dispatched_at")
    private LocalDateTime dispatchedAt;

    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(nullable = false)
    private String status; // "Assigned", "Dispatched", "En-Route", "On-Scene", "Completed", "Cancelled"

    private String notes;

    public ResourceAssignment() {
    }

    public ResourceAssignment(Long id, String incidentId, String resourceId, LocalDateTime assignedAt, LocalDateTime dispatchedAt, LocalDateTime arrivedAt, LocalDateTime completedAt, String status, String notes) {
        this.id = id;
        this.incidentId = incidentId;
        this.resourceId = resourceId;
        this.assignedAt = assignedAt;
        this.dispatchedAt = dispatchedAt;
        this.arrivedAt = arrivedAt;
        this.completedAt = completedAt;
        this.status = status;
        this.notes = notes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getResourceId() { return resourceId; }
    public void setResourceId(String resourceId) { this.resourceId = resourceId; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }

    public LocalDateTime getArrivedAt() { return arrivedAt; }
    public void setArrivedAt(LocalDateTime arrivedAt) { this.arrivedAt = arrivedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    @PrePersist
    protected void onCreate() {
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "Assigned";
        }
    }

    public static ResourceAssignmentBuilder builder() {
        return new ResourceAssignmentBuilder();
    }

    public static class ResourceAssignmentBuilder {
        private Long id;
        private String incidentId;
        private String resourceId;
        private LocalDateTime assignedAt;
        private LocalDateTime dispatchedAt;
        private LocalDateTime arrivedAt;
        private LocalDateTime completedAt;
        private String status;
        private String notes;

        public ResourceAssignmentBuilder id(Long id) { this.id = id; return this; }
        public ResourceAssignmentBuilder incidentId(String incidentId) { this.incidentId = incidentId; return this; }
        public ResourceAssignmentBuilder resourceId(String resourceId) { this.resourceId = resourceId; return this; }
        public ResourceAssignmentBuilder assignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; return this; }
        public ResourceAssignmentBuilder dispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; return this; }
        public ResourceAssignmentBuilder arrivedAt(LocalDateTime arrivedAt) { this.arrivedAt = arrivedAt; return this; }
        public ResourceAssignmentBuilder completedAt(LocalDateTime completedAt) { this.completedAt = completedAt; return this; }
        public ResourceAssignmentBuilder status(String status) { this.status = status; return this; }
        public ResourceAssignmentBuilder notes(String notes) { this.notes = notes; return this; }

        public ResourceAssignment build() {
            return new ResourceAssignment(id, incidentId, resourceId, assignedAt, dispatchedAt, arrivedAt, completedAt, status, notes);
        }
    }
}
