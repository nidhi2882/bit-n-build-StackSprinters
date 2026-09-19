package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String departmentId;

    @Column(nullable = false)
    private String authorityId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    private Long adminUserId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Department() {}

    public Department(Long id, String departmentId, String authorityId, String name, String category, Long adminUserId, LocalDateTime createdAt) {
        this.id = id;
        this.departmentId = departmentId;
        this.authorityId = authorityId;
        this.name = name;
        this.category = category;
        this.adminUserId = adminUserId;
        this.createdAt = createdAt;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getAuthorityId() { return authorityId; }
    public void setAuthorityId(String authorityId) { this.authorityId = authorityId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Long getAdminUserId() { return adminUserId; }
    public void setAdminUserId(Long adminUserId) { this.adminUserId = adminUserId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static DepartmentBuilder builder() { return new DepartmentBuilder(); }

    public static class DepartmentBuilder {
        private Long id;
        private String departmentId;
        private String authorityId;
        private String name;
        private String category;
        private Long adminUserId;
        private LocalDateTime createdAt;

        public DepartmentBuilder id(Long id) { this.id = id; return this; }
        public DepartmentBuilder departmentId(String departmentId) { this.departmentId = departmentId; return this; }
        public DepartmentBuilder authorityId(String authorityId) { this.authorityId = authorityId; return this; }
        public DepartmentBuilder name(String name) { this.name = name; return this; }
        public DepartmentBuilder category(String category) { this.category = category; return this; }
        public DepartmentBuilder adminUserId(Long adminUserId) { this.adminUserId = adminUserId; return this; }
        public DepartmentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Department build() {
            return new Department(id, departmentId, authorityId, name, category, adminUserId, createdAt);
        }
    }
}
