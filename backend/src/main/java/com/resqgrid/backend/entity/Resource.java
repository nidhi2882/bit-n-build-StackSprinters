package com.resqgrid.backend.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @Column(length = 64)
    private String id; // e.g. "RES-001"

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // "NDRF Water Rescue", "Fire Engine", "Advanced Ambulance", "Hazmat Unit", "Police QRT"

    @Column(nullable = false)
    private String status; // "Available", "Assigned", "En-Route", "Arrived", "On-Scene", "Maintenance"

    private Double lat;

    private Double lng;

    @Column(name = "base_station")
    private String baseStation;

    private String contact;

    @Column(name = "team_leader")
    private String teamLeader;

    @Column(name = "personnel_count")
    private Integer personnelCount;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "resource_capabilities", joinColumns = @JoinColumn(name = "resource_id"))
    @Column(name = "capability")
    @Builder.Default
    private List<String> capabilities = new ArrayList<>();

    @Column(name = "assigned_incident_id", length = 64)
    private String assignedIncidentId;
}
