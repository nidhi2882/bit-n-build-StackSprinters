package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private String time;

    @Column(name = "incident_id", length = 64)
    private String incidentId;

    @Column(name = "action_required")
    private String actionRequired;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Alert() {}

    public Alert(String id, String type, String title, String message, String time, String incidentId, String actionRequired, Boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.time = time;
        this.incidentId = incidentId;
        this.actionRequired = actionRequired;
        this.active = active != null ? active : true;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (active == null) {
            active = true;
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getActionRequired() { return actionRequired; }
    public void setActionRequired(String actionRequired) { this.actionRequired = actionRequired; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder pattern
    public static AlertBuilder builder() { return new AlertBuilder(); }

    public static class AlertBuilder {
        private String id;
        private String type;
        private String title;
        private String message;
        private String time;
        private String incidentId;
        private String actionRequired;
        private Boolean active = true;
        private LocalDateTime createdAt;

        public AlertBuilder id(String id) { this.id = id; return this; }
        public AlertBuilder type(String type) { this.type = type; return this; }
        public AlertBuilder title(String title) { this.title = title; return this; }
        public AlertBuilder message(String message) { this.message = message; return this; }
        public AlertBuilder time(String time) { this.time = time; return this; }
        public AlertBuilder incidentId(String incidentId) { this.incidentId = incidentId; return this; }
        public AlertBuilder actionRequired(String actionRequired) { this.actionRequired = actionRequired; return this; }
        public AlertBuilder active(Boolean active) { this.active = active; return this; }
        public AlertBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Alert build() {
            return new Alert(id, type, title, message, time, incidentId, actionRequired, active, createdAt);
        }
    }
}
