package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "authorities")
public class Authority {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String authorityId;

    @Column(nullable = false)
    private String name;

    private String regionCode;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Authority() {}

    public Authority(Long id, String authorityId, String name, String regionCode, LocalDateTime createdAt) {
        this.id = id;
        this.authorityId = authorityId;
        this.name = name;
        this.regionCode = regionCode;
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

    public String getAuthorityId() { return authorityId; }
    public void setAuthorityId(String authorityId) { this.authorityId = authorityId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRegionCode() { return regionCode; }
    public void setRegionCode(String regionCode) { this.regionCode = regionCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static AuthorityBuilder builder() { return new AuthorityBuilder(); }

    public static class AuthorityBuilder {
        private Long id;
        private String authorityId;
        private String name;
        private String regionCode;
        private LocalDateTime createdAt;

        public AuthorityBuilder id(Long id) { this.id = id; return this; }
        public AuthorityBuilder authorityId(String authorityId) { this.authorityId = authorityId; return this; }
        public AuthorityBuilder name(String name) { this.name = name; return this; }
        public AuthorityBuilder regionCode(String regionCode) { this.regionCode = regionCode; return this; }
        public AuthorityBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Authority build() {
            return new Authority(id, authorityId, name, regionCode, createdAt);
        }
    }
}
