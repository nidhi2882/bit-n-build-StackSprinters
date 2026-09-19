package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
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

    public User() {
    }

    public User(Long id, String name, String email, String password, String role, String phone, String organization, String authorityId, String departmentId, String departmentCategory, String unitId, String facilityId, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone;
        this.organization = organization;
        this.authorityId = authorityId;
        this.departmentId = departmentId;
        this.departmentCategory = departmentCategory;
        this.unitId = unitId;
        this.facilityId = facilityId;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }

    public String getAuthorityId() { return authorityId; }
    public void setAuthorityId(String authorityId) { this.authorityId = authorityId; }

    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }

    public String getDepartmentCategory() { return departmentCategory; }
    public void setDepartmentCategory(String departmentCategory) { this.departmentCategory = departmentCategory; }

    public String getUnitId() { return unitId; }
    public void setUnitId(String unitId) { this.unitId = unitId; }

    public String getFacilityId() { return facilityId; }
    public void setFacilityId(String facilityId) { this.facilityId = facilityId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String name;
        private String email;
        private String password;
        private String role;
        private String phone;
        private String organization;
        private String authorityId;
        private String departmentId;
        private String departmentCategory;
        private String unitId;
        private String facilityId;
        private LocalDateTime createdAt;

        public UserBuilder id(Long id) { this.id = id; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder password(String password) { this.password = password; return this; }
        public UserBuilder role(String role) { this.role = role; return this; }
        public UserBuilder phone(String phone) { this.phone = phone; return this; }
        public UserBuilder organization(String organization) { this.organization = organization; return this; }
        public UserBuilder authorityId(String authorityId) { this.authorityId = authorityId; return this; }
        public UserBuilder departmentId(String departmentId) { this.departmentId = departmentId; return this; }
        public UserBuilder departmentCategory(String departmentCategory) { this.departmentCategory = departmentCategory; return this; }
        public UserBuilder unitId(String unitId) { this.unitId = unitId; return this; }
        public UserBuilder facilityId(String facilityId) { this.facilityId = facilityId; return this; }
        public UserBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public User build() {
            return new User(id, name, email, password, role, phone, organization, authorityId, departmentId, departmentCategory, unitId, facilityId, createdAt);
        }
    }
}
