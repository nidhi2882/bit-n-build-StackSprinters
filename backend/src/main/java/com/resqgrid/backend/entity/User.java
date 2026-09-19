package com.resqgrid.backend.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role; // "Emergency Operator", "Citizen", "Response Team", "Hospital Admin", "Authority Admin"

    private String phone;

    private String organization;

    @Column(name = "authority_id")
    private String authorityId;

    @Column(name = "department_id")
    private String departmentId;

    @Column(name = "department_category")
    private String departmentCategory;

    @Column(name = "unit_id")
    private String unitId;

    @Column(name = "facility_id")
    private String facilityId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
