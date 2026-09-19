package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Resource;
import com.resqgrid.backend.repository.IncidentRepository;
import com.resqgrid.backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final IncidentRepository incidentRepository;
    private final MongoSyncService mongoSyncService;

    public ResourceService(ResourceRepository resourceRepository,
                           IncidentRepository incidentRepository,
                           MongoSyncService mongoSyncService) {
        this.resourceRepository = resourceRepository;
        this.incidentRepository = incidentRepository;
        this.mongoSyncService = mongoSyncService;
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public List<Resource> getAvailableResources() {
        return resourceRepository.findByStatusIgnoreCase("Available");
    }

    @Transactional
    public Resource createResource(Resource resource) {
        if (resource.getId() == null || resource.getId().trim().isEmpty()) {
            long count = resourceRepository.count();
            resource.setId(String.format("RES-%03d", count + 1));
        }
        if (resource.getStatus() == null) {
            resource.setStatus("Available");
        }
        Resource saved = resourceRepository.save(resource);
        mongoSyncService.syncResource(saved);
        return saved;
    }

    @Transactional
    public Resource updateStatus(String resourceId, String newStatus) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));

        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Resource status cannot be null or empty");
        }

        String normalizedStatus = newStatus.trim();
        if ("On-Site".equalsIgnoreCase(normalizedStatus)) {
            normalizedStatus = "On-Scene";
        }

        if ("Resolved".equalsIgnoreCase(normalizedStatus) || "Completed".equalsIgnoreCase(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid resource status: '" + newStatus + "' is invalid. Resource status must be one of: Available, En-Route, On-Scene, Returning. 'Resolved' is an Incident-only status.");
        }

        final String targetStatus = normalizedStatus;
        List<String> validStatuses = List.of("Available", "En-Route", "On-Scene", "Returning");
        boolean isValid = validStatuses.stream().anyMatch(s -> s.equalsIgnoreCase(targetStatus));
        if (!isValid) {
            throw new IllegalArgumentException("Invalid resource status: '" + newStatus + "'. Valid resource statuses are: Available, En-Route, On-Scene, Returning.");
        }

        // Canonical case match
        final String canonicalStatus = validStatuses.stream()
                .filter(s -> s.equalsIgnoreCase(targetStatus))
                .findFirst()
                .orElse(targetStatus);

        resource.setStatus(canonicalStatus);
        if ("Available".equalsIgnoreCase(canonicalStatus)) {
            resource.setAssignedIncidentId(null);
        }
        Resource saved = resourceRepository.save(resource);
        mongoSyncService.syncResource(saved);

        // Sync attached incident status if applicable
        if (resource.getAssignedIncidentId() != null) {
            String incId = resource.getAssignedIncidentId();
            incidentRepository.findById(incId).ifPresent(inc -> {
                if ("On-Scene".equalsIgnoreCase(canonicalStatus)) {
                    inc.setStatus("On-Scene");
                    incidentRepository.save(inc);
                    mongoSyncService.syncIncident(inc);
                } else if ("En-Route".equalsIgnoreCase(canonicalStatus)) {
                    inc.setStatus("En-Route");
                    incidentRepository.save(inc);
                    mongoSyncService.syncIncident(inc);
                }
            });
        }

        return saved;
    }
}
