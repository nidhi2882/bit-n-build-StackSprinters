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
@Table(name = "emergency_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyCategory {

    @Id
    @Column(length = 64)
    private String id; // e.g. "CAT_FLOOD", "CAT_FIRE"

    @Column(nullable = false)
    private String name; // e.g. "Flood & Inundation"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "primary_department")
    private String primaryDepartment; // e.g. "Disaster Management, Fire & Rescue"

    @Column(name = "default_priority_code", length = 16)
    private String defaultPriorityCode; // "P1", "P2", "P3", "P4", "P5"

    private String icon; // emoji or icon key e.g. "🌊", "Flame"

    private String color; // hex code e.g. "#3b82f6"

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "category_default_capabilities", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "capability")
    @Builder.Default
    private List<String> defaultRequiredCapabilities = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
