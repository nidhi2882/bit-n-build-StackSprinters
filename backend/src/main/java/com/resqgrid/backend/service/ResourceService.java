package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.DepartmentCategory;
import com.resqgrid.backend.entity.Resource;
import com.resqgrid.backend.repository.IncidentRepository;
import com.resqgrid.backend.repository.ResourceRepository;
import com.resqgrid.backend.security.UserPrincipal;
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

    public List<Resource> getScopedResources(UserPrincipal currentUser, String status) {
        if (currentUser == null) {
            if (status != null && !status.trim().isEmpty()) {
                return resourceRepository.findByStatusIgnoreCase(status.trim());
            }
            return resourceRepository.findAll();
        }

        String role = currentUser.getRole() != null ? currentUser.getRole().toUpperCase().replace(" ", "_") : "";
        if (role.contains("SUPER_ADMIN") || role.contains("SUPER ADMIN")) {
            if (status != null && !status.trim().isEmpty()) {
                return resourceRepository.findByStatusIgnoreCase(status.trim());
            }
            return resourceRepository.findAll();
        }

        String deptCategory = currentUser.getDepartmentCategory();
        if (deptCategory == null || deptCategory.trim().isEmpty()) {
            return resourceRepository.findAll();
        }

        String rawCat = deptCategory.toUpperCase().replace("CAT_", "");
        if (status != null && !status.trim().isEmpty()) {
            return resourceRepository.findByDepartmentCategoryIgnoreCaseAndStatusIgnoreCase(rawCat, status.trim());
        }
        return resourceRepository.findByDepartmentCategoryIgnoreCase(rawCat);
    }

    public Optional<Resource> getResourceById(String id) {
        return resourceRepository.findById(id);
    }

    public List<Resource> getAvailableResources() {
        return resourceRepository.findByStatusIgnoreCase("Available");
    }

    @Transactional
    public Resource createResource(Resource resource, UserPrincipal currentUser) {
        if (resource.getId() == null || resource.getId().trim().isEmpty()) {
            long count = resourceRepository.count();
            String prefix = resource.getDepartmentCategory() != null ? resource.getDepartmentCategory().substring(0, Math.min(3, resource.getDepartmentCategory().length())).toUpperCase() : "UNIT";
            resource.setId(String.format("%s-%03d", prefix, count + 1));
        }
        if (resource.getStatus() == null) {
            resource.setStatus("Available");
        }
        if (resource.getCallSign() == null && resource.getName() != null) {
            resource.setCallSign(resource.getName());
        }
        if (currentUser != null && currentUser.getDepartmentCategory() != null && resource.getDepartmentCategory() == null) {
            resource.setDepartmentCategory(currentUser.getDepartmentCategory().toUpperCase().replace("CAT_", ""));
        } else if (resource.getDepartmentCategory() == null) {
            DepartmentCategory dc = DepartmentCategory.fromString(resource.getType());
            resource.setDepartmentCategory(dc != null ? dc.name() : "FLOOD");
        }

        Resource saved = resourceRepository.save(resource);
        mongoSyncService.syncResource(saved);
        return saved;
    }

    @Transactional
    public Resource createResource(Resource resource) {
        return createResource(resource, null);
    }

    @Transactional
    public Resource updateResource(String id, Resource updated, UserPrincipal currentUser) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + id));

        if (updated.getName() != null) resource.setName(updated.getName());
        if (updated.getCallSign() != null) resource.setCallSign(updated.getCallSign());
        if (updated.getType() != null) resource.setType(updated.getType());
        if (updated.getStatus() != null) resource.setStatus(updated.getStatus());
        if (updated.getBaseStation() != null) resource.setBaseStation(updated.getBaseStation());
        if (updated.getContact() != null) resource.setContact(updated.getContact());
        if (updated.getTeamLeader() != null) resource.setTeamLeader(updated.getTeamLeader());
        if (updated.getPersonnelCount() != null) resource.setPersonnelCount(updated.getPersonnelCount());
        if (updated.getDepartmentCategory() != null) resource.setDepartmentCategory(updated.getDepartmentCategory());
        if (updated.getCapabilities() != null) resource.setCapabilities(updated.getCapabilities());

        Resource saved = resourceRepository.save(resource);
        mongoSyncService.syncResource(saved);
        return saved;
    }

    @Transactional
    public void deleteResource(String id, UserPrincipal currentUser) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + id));
        resourceRepository.delete(resource);
    }

    @Transactional
    public Resource updateStatus(String resourceId, String newStatus) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));

        if (newStatus == null || newStatus.trim().isEmpty()) {
            throw new IllegalArgumentException("Resource status cannot be null or empty");
        }

        String raw = newStatus.trim();
        if ("Resolved".equalsIgnoreCase(raw) || "Completed".equalsIgnoreCase(raw)) {
            throw new IllegalArgumentException("Resource status cannot be set to 'Resolved' or 'Completed'. Only Incidents can be resolved.");
        }

        String normalizedStatus = raw;
        if ("On-Site".equalsIgnoreCase(normalizedStatus)) {
            normalizedStatus = "On-Scene";
        }
        final String effectiveStatus = normalizedStatus;

        resource.setStatus(effectiveStatus);
        if ("Available".equalsIgnoreCase(effectiveStatus)) {
            resource.setAssignedIncidentId(null);
        }
        Resource saved = resourceRepository.save(resource);
        mongoSyncService.syncResource(saved);

        // Sync attached incident status if applicable
        if (resource.getAssignedIncidentId() != null) {
            String incId = resource.getAssignedIncidentId();
            incidentRepository.findById(incId).ifPresent(inc -> {
                if ("On-Scene".equalsIgnoreCase(effectiveStatus) || "Arrived".equalsIgnoreCase(effectiveStatus)) {
                    inc.setStatus("Arrived");
                    incidentRepository.save(inc);
                    mongoSyncService.syncIncident(inc);
                } else if ("En-Route".equalsIgnoreCase(effectiveStatus) || "En Route".equalsIgnoreCase(effectiveStatus)) {
                    inc.setStatus("En Route");
                    incidentRepository.save(inc);
                    mongoSyncService.syncIncident(inc);
                }
            });
        }

        return saved;
    }
}
