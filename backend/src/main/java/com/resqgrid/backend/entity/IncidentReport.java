package com.resqgrid.backend.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "incident_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentReport {

    @Id
    @Column(length = 64)
    private String id; // e.g. "REP-901"

    @Column(name = "incident_id", length = 64)
    private String incidentId;

    private String source; // e.g. "112 Hotline", "Citizen App", "IoT Sensor"

    @Column(columnDefinition = "TEXT")
    private String text;

    private String time;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
