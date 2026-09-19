package com.resqgrid.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String departmentId; // e.g. "DEPT-FIRE-01"

    @Column(nullable = false)
    private String authorityId; // Links to parent Authority

    @Column(nullable = false)
    private String name; // e.g. "Fire & Rescue Department"

    @Column(nullable = false)
    private String category; // e.g. "CAT_FIRE"

    private Long adminUserId; // ID of Department Admin

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
