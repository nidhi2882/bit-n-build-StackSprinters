package com.resqgrid.backend.entity;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resources")
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
    private List<String> capabilities = new ArrayList<>();

    @Column(name = "assigned_incident_id", length = 64)
    private String assignedIncidentId;

    public Resource() {
    }

    public Resource(String id, String name, String type, String status, Double lat, Double lng, String baseStation, String contact, String teamLeader, Integer personnelCount, List<String> capabilities, String assignedIncidentId) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.status = status;
        this.lat = lat;
        this.lng = lng;
        this.baseStation = baseStation;
        this.contact = contact;
        this.teamLeader = teamLeader;
        this.personnelCount = personnelCount;
        this.capabilities = capabilities != null ? capabilities : new ArrayList<>();
        this.assignedIncidentId = assignedIncidentId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getBaseStation() { return baseStation; }
    public void setBaseStation(String baseStation) { this.baseStation = baseStation; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public String getTeamLeader() { return teamLeader; }
    public void setTeamLeader(String teamLeader) { this.teamLeader = teamLeader; }

    public Integer getPersonnelCount() { return personnelCount; }
    public void setPersonnelCount(Integer personnelCount) { this.personnelCount = personnelCount; }

    public List<String> getCapabilities() { return capabilities; }
    public void setCapabilities(List<String> capabilities) { this.capabilities = capabilities; }

    public String getAssignedIncidentId() { return assignedIncidentId; }
    public void setAssignedIncidentId(String assignedIncidentId) { this.assignedIncidentId = assignedIncidentId; }

    public static ResourceBuilder builder() {
        return new ResourceBuilder();
    }

    public static class ResourceBuilder {
        private String id;
        private String name;
        private String type;
        private String status;
        private Double lat;
        private Double lng;
        private String baseStation;
        private String contact;
        private String teamLeader;
        private Integer personnelCount;
        private List<String> capabilities = new ArrayList<>();
        private String assignedIncidentId;

        public ResourceBuilder id(String id) { this.id = id; return this; }
        public ResourceBuilder name(String name) { this.name = name; return this; }
        public ResourceBuilder type(String type) { this.type = type; return this; }
        public ResourceBuilder status(String status) { this.status = status; return this; }
        public ResourceBuilder lat(Double lat) { this.lat = lat; return this; }
        public ResourceBuilder lng(Double lng) { this.lng = lng; return this; }
        public ResourceBuilder baseStation(String baseStation) { this.baseStation = baseStation; return this; }
        public ResourceBuilder contact(String contact) { this.contact = contact; return this; }
        public ResourceBuilder teamLeader(String teamLeader) { this.teamLeader = teamLeader; return this; }
        public ResourceBuilder personnelCount(Integer personnelCount) { this.personnelCount = personnelCount; return this; }
        public ResourceBuilder capabilities(List<String> capabilities) { this.capabilities = capabilities; return this; }
        public ResourceBuilder assignedIncidentId(String assignedIncidentId) { this.assignedIncidentId = assignedIncidentId; return this; }

        public Resource build() {
            return new Resource(id, name, type, status, lat, lng, baseStation, contact, teamLeader, personnelCount, capabilities, assignedIncidentId);
        }
    }
}
