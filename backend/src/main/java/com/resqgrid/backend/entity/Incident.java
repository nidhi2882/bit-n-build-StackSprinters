package com.resqgrid.backend.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @Column(length = 64)
    private String id; // e.g. "INC-2026-001"

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String type; // "Flood", "Fire", "Medical", "Hazardous", "Infrastructure", "Cyclone"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer severity; // 1 (Minor) to 5 (Critical)

    @Column(nullable = false)
    private String status; // "Reported", "Classified", "Prioritized", "Assigned", "En-Route", "Arrived", "Resolved"

    @Column(name = "location_name")
    private String locationName;

    private Double lat;

    private Double lng;

    @Column(name = "reported_at")
    private LocalDateTime reportedAt;

    @Column(name = "reporter_role")
    private String reporterRole;

    @Column(name = "ai_summary", columnDefinition = "TEXT")
    private String aiSummary;

    @Column(name = "ai_confidence")
    private Double aiConfidence;

    @Column(name = "duplicate_count")
    @Builder.Default
    private Integer duplicateCount = 0;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "incident_capabilities", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "capability")
    @Builder.Default
    private List<String> requiredCapabilities = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "incident_assigned_resources", joinColumns = @JoinColumn(name = "incident_id"))
    @Column(name = "resource_id")
    @Builder.Default
    private List<String> assignedResourceIds = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (reportedAt == null) {
            reportedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "Reported";
        }
    }
}
