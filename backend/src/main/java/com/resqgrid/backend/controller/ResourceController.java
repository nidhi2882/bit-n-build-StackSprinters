package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.Resource;
import com.resqgrid.backend.security.UserPrincipal;
import com.resqgrid.backend.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping({"/api/units", "/api/resources"})
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(resourceService.getScopedResources(currentUser, status));
    }

    @GetMapping({"/api/units/{id}", "/api/resources/{id}"})
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return resourceService.getResourceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping({"/api/units", "/api/resources"})
    public ResponseEntity<Resource> createResource(
            @RequestBody Resource resource,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(resourceService.createResource(resource, currentUser));
    }

    @PutMapping({"/api/units/{id}", "/api/resources/{id}"})
    public ResponseEntity<Resource> updateResource(
            @PathVariable String id,
            @RequestBody Resource resource,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(resourceService.updateResource(id, resource, currentUser));
    }

    @DeleteMapping({"/api/units/{id}", "/api/resources/{id}"})
    public ResponseEntity<?> deleteResource(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        resourceService.deleteResource(id, currentUser);
        return ResponseEntity.ok().build();
    }

    @PatchMapping({"/api/units/{id}/status", "/api/resources/{id}/status"})
    public ResponseEntity<Resource> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(resourceService.updateStatus(id, status));
    }
}
