package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Alert;
import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.Resource;
import com.resqgrid.backend.entity.ResourceAssignment;
import com.resqgrid.backend.repository.AlertRepository;
import com.resqgrid.backend.repository.IncidentRepository;
import com.resqgrid.backend.repository.ResourceAssignmentRepository;
import com.resqgrid.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceAssignmentRepository resourceAssignmentRepository;
    private final AlertRepository alertRepository;
    private final MongoSyncService mongoSyncService;

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAllByOrderByReportedAtDesc();
    }

    public Optional<Incident> getIncidentById(String id) {
        return incidentRepository.findById(id);
    }

    @Transactional
    public Incident createIncident(Incident incident) {
        if (incident.getId() == null || incident.getId().trim().isEmpty()) {
            long count = incidentRepository.count();
            incident.setId(String.format("INC-2026-%03d", count + 1));
        }

        if (incident.getReportedAt() == null) {
            incident.setReportedAt(LocalDateTime.now());
        }
        if (incident.getStatus() == null) {
            incident.setStatus("Reported");
        }
        if (incident.getDuplicateCount() == null) {
            incident.setDuplicateCount(0);
        }

        // Auto-assign default capabilities if not provided based on type
        if (incident.getRequiredCapabilities() == null || incident.getRequiredCapabilities().isEmpty()) {
            List<String> caps = new ArrayList<>();
            if ("Flood".equalsIgnoreCase(incident.getType())) {
                caps.add("Water Rescue");
                caps.add("Inflatable Boat");
            } else if ("Fire".equalsIgnoreCase(incident.getType())) {
                caps.add("Fire Engine");
                caps.add("Foam Tender");
            } else if ("Hazardous".equalsIgnoreCase(incident.getType())) {
                caps.add("Hazmat Unit");
            } else {
                caps.add("Emergency Medical");
            }
            incident.setRequiredCapabilities(caps);
        }

        Incident saved = incidentRepository.save(incident);
        mongoSyncService.syncIncident(saved);

        // Auto-escalation trigger: If severity >= 4, trigger immediate Critical Alert
        if (saved.getSeverity() != null && saved.getSeverity() >= 4) {
            Alert criticalAlert = Alert.builder()
                    .id("ALT-" + System.currentTimeMillis())
                    .type("CRITICAL")
                    .title("CRITICAL SEVERITY: " + saved.getTitle())
                    .message(String.format("%s (%s) at %s. Level %d/5 emergency requires immediate unit triage.",
                            saved.getId(), saved.getType(), saved.getLocationName(), saved.getSeverity()))
                    .incidentId(saved.getId())
                    .actionRequired("Immediate Dispatch Required")
                    .active(true)
                    .time("Just now")
                    .createdAt(LocalDateTime.now())
                    .build();
            alertRepository.save(criticalAlert);
            mongoSyncService.syncAlert(criticalAlert);
        }

        return saved;
    }

    @Transactional
    public Incident updateStatus(String incidentId, String status) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));
        incident.setStatus(status);
        Incident saved = incidentRepository.save(incident);
        mongoSyncService.syncIncident(saved);
        return saved;
    }

    @Transactional
    public Incident assignResource(String incidentId, String resourceId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));

        // 1. Update Incident
        if (!incident.getAssignedResourceIds().contains(resourceId)) {
            incident.getAssignedResourceIds().add(resourceId);
            if ("Reported".equalsIgnoreCase(incident.getStatus())) {
                incident.setStatus("Assigned");
            }
            incidentRepository.save(incident);
            mongoSyncService.syncIncident(incident);
        }

        // 2. Update Resource
        resource.setStatus("En-Route");
        resource.setAssignedIncidentId(incidentId);
        resourceRepository.save(resource);
        mongoSyncService.syncResource(resource);

        // 3. Record Assignment Audit
        ResourceAssignment assignment = ResourceAssignment.builder()
                .incidentId(incidentId)
                .resourceId(resourceId)
                .status("En-Route")
                .assignedAt(LocalDateTime.now())
                .dispatchedAt(LocalDateTime.now())
                .notes("Dispatched by Emergency Operator via ResQGrid Command Center")
                .build();
        resourceAssignmentRepository.save(assignment);
        mongoSyncService.syncResourceAssignment(assignment);

        return incident;
    }

    // Recommendation Engine: Rank available resources based on Capability match & Distance
    public List<Map<String, Object>> getRecommendedResources(String incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));

        List<Resource> availableResources = resourceRepository.findByStatusIgnoreCase("Available");
        List<Map<String, Object>> recommendations = new ArrayList<>();

        for (Resource res : availableResources) {
            double distanceKm = calculateDistance(incident.getLat(), incident.getLng(), res.getLat(), res.getLng());
            
            // Capability score
            long matchedCaps = res.getCapabilities().stream()
                    .filter(c -> incident.getRequiredCapabilities().stream().anyMatch(rc -> rc.equalsIgnoreCase(c)))
                    .count();
            
            double score = (matchedCaps * 40.0) + Math.max(0, 60.0 - (distanceKm * 5.0));

            Map<String, Object> rec = new HashMap<>();
            rec.put("resource", res);
            rec.put("distanceKm", Math.round(distanceKm * 10.0) / 10.0);
            rec.put("matchScore", Math.min(100.0, Math.round(score)));
            rec.put("estimatedArrivalMins", Math.max(2, (int) Math.round(distanceKm * 3.5)));
            recommendations.add(rec);
        }

        // Sort highest match score first
        recommendations.sort((a, b) -> Double.compare((Double) b.get("matchScore"), (Double) a.get("matchScore")));
        return recommendations;
    }

    private double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 5.0;
        final int R = 6371; // Radius of Earth in KM
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
