package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_activities")
public class IncidentActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "incident_id", nullable = false, length = 64)
    private String incidentId;

    @Column(name = "activity_text", nullable = false, columnDefinition = "TEXT")
    private String activityText;

    private String actor;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public IncidentActivity() {}

    public IncidentActivity(Long id, String incidentId, String activityText, String actor, LocalDateTime createdAt) {
        this.id = id;
        this.incidentId = incidentId;
        this.activityText = activityText;
        this.actor = actor;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getActivityText() { return activityText; }
    public void setActivityText(String activityText) { this.activityText = activityText; }

    public String getActor() { return actor; }
    public void setActor(String actor) { this.actor = actor; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static IncidentActivityBuilder builder() { return new IncidentActivityBuilder(); }

    public static class IncidentActivityBuilder {
        private Long id;
        private String incidentId;
        private String activityText;
        private String actor;
        private LocalDateTime createdAt;

        public IncidentActivityBuilder id(Long id) { this.id = id; return this; }
        public IncidentActivityBuilder incidentId(String incidentId) { this.incidentId = incidentId; return this; }
        public IncidentActivityBuilder activityText(String activityText) { this.activityText = activityText; return this; }
        public IncidentActivityBuilder actor(String actor) { this.actor = actor; return this; }
        public IncidentActivityBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public IncidentActivity build() {
            return new IncidentActivity(id, incidentId, activityText, actor, createdAt);
        }
    }
}
