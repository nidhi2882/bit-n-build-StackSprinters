package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_reports")
public class IncidentReport {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "incident_id", length = 64)
    private String incidentId;

    private String source;

    @Column(columnDefinition = "TEXT")
    private String text;

    private String time;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public IncidentReport() {}

    public IncidentReport(String id, String incidentId, String source, String text, String time, LocalDateTime createdAt) {
        this.id = id;
        this.incidentId = incidentId;
        this.source = source;
        this.text = text;
        this.time = time;
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

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static IncidentReportBuilder builder() { return new IncidentReportBuilder(); }

    public static class IncidentReportBuilder {
        private String id;
        private String incidentId;
        private String source;
        private String text;
        private String time;
        private LocalDateTime createdAt;

        public IncidentReportBuilder id(String id) { this.id = id; return this; }
        public IncidentReportBuilder incidentId(String incidentId) { this.incidentId = incidentId; return this; }
        public IncidentReportBuilder source(String source) { this.source = source; return this; }
        public IncidentReportBuilder text(String text) { this.text = text; return this; }
        public IncidentReportBuilder time(String time) { this.time = time; return this; }
        public IncidentReportBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public IncidentReport build() {
            return new IncidentReport(id, incidentId, source, text, time, createdAt);
        }
    }
}
