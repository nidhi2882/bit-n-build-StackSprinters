package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Resource;
import com.resqgrid.backend.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

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
        return resourceRepository.save(resource);
    }

    @Transactional
    public Resource updateStatus(String resourceId, String newStatus) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));
        resource.setStatus(newStatus);
        if ("Available".equalsIgnoreCase(newStatus)) {
            resource.setAssignedIncidentId(null);
        }
        return resourceRepository.save(resource);
    }
}
