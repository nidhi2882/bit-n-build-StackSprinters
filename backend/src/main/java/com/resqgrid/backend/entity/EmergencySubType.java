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
@Table(name = "emergency_sub_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencySubType {

    @Id
    @Column(length = 64)
    private String id; // e.g. "SUB_FL_FLASH"

    @Column(name = "category_id", nullable = false, length = 64)
    private String categoryId; // "CAT_FLOOD"

    @Column(nullable = false)
    private String name; // "Flash Flood Inundation"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "primary_department")
    private String primaryDepartment;

    @Column(name = "default_severity")
    private Integer defaultSeverity; // 1 to 5

    @Column(name = "dispatch_sla_mins")
    private Integer dispatchSlaMins; // e.g. 5 mins for P1

    @Column(name = "max_response_sla_mins")
    private Integer maxResponseSlaMins; // e.g. 15 mins

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "sub_type_capabilities", joinColumns = @JoinColumn(name = "sub_type_id"))
    @Column(name = "capability")
    @Builder.Default
    private List<String> defaultCapabilities = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
