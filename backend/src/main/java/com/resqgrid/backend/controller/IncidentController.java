package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.security.UserPrincipal;
import com.resqgrid.backend.service.IncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @GetMapping
    public ResponseEntity<?> getAllIncidents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String category,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String dept = (department != null && !department.trim().isEmpty()) ? department : category;
        try {
            if (currentUser != null) {
                return ResponseEntity.ok(incidentService.getScopedIncidents(currentUser, dept));
            }
            if (dept != null && !dept.trim().isEmpty()) {
                return ResponseEntity.ok(incidentService.getIncidentsByDepartmentOrCategory(dept));
            }
            return ResponseEntity.ok(incidentService.getAllIncidents());
        } catch (org.springframework.security.access.AccessDeniedException ade) {
            return ResponseEntity.status(403).body(Collections.singletonMap("message", ade.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getIncidentById(@PathVariable String id, @AuthenticationPrincipal UserPrincipal currentUser) {
        return incidentService.getIncidentById(id)
                .map(incident -> {
                    if (currentUser != null && !incidentService.isUserAuthorizedForIncident(incident, currentUser)) {
                        return ResponseEntity.status(403).body(Collections.singletonMap("message", "Access Denied: You do not have permission to view incident " + id));
                    }
                    return ResponseEntity.ok(incident);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident, @AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser != null) {
            if (incident.getReporterEmail() == null || incident.getReporterEmail().trim().isEmpty()) {
                incident.setReporterEmail(currentUser.getEmail());
            }
            if (incident.getReporterRole() == null || incident.getReporterRole().trim().isEmpty()) {
                incident.setReporterRole(currentUser.getRole());
            }
            if (incident.getReporterId() == null || incident.getReporterId().trim().isEmpty()) {
                incident.setReporterId(String.valueOf(currentUser.getId()));
            }
        }
        return ResponseEntity.ok(incidentService.createIncident(incident));
    }

    @PostMapping("/{id}/reclassify")
    public ResponseEntity<Incident> reclassifyIncident(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String newCategory = payload.get("newCategory");
        String reason = payload.get("reason");
        return ResponseEntity.ok(incidentService.reclassifyIncident(id, newCategory, reason, currentUser));
    }

    @PatchMapping("/{id}/assign-unit")
    public ResponseEntity<?> assignUnit(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Incident incident = incidentService.getIncidentById(id).orElse(null);
        if (incident != null && currentUser != null && !incidentService.isUserAuthorizedForIncident(incident, currentUser)) {
            return ResponseEntity.status(403).body(Collections.singletonMap("message", "Access Denied: You cannot assign units to an incident outside your jurisdiction"));
        }
        String unitId = payload.get("unitId");
        if (unitId == null) {
            unitId = payload.get("resourceId");
        }
        return ResponseEntity.ok(incidentService.assignResource(id, unitId));
    }

    @PostMapping("/{id}/assign-resource")
    public ResponseEntity<?> assignResource(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Incident incident = incidentService.getIncidentById(id).orElse(null);
        if (incident != null && currentUser != null && !incidentService.isUserAuthorizedForIncident(incident, currentUser)) {
            return ResponseEntity.status(403).body(Collections.singletonMap("message", "Access Denied: You cannot assign resources to an incident outside your jurisdiction"));
        }
        String resourceId = payload.get("resourceId");
        if (resourceId == null) {
            resourceId = payload.get("unitId");
        }
        return ResponseEntity.ok(incidentService.assignResource(id, resourceId));
    }

    @PostMapping("/{id}/unassign-resource")
    public ResponseEntity<?> unassignResource(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Incident incident = incidentService.getIncidentById(id).orElse(null);
        if (incident != null && currentUser != null && !incidentService.isUserAuthorizedForIncident(incident, currentUser)) {
            return ResponseEntity.status(403).body(Collections.singletonMap("message", "Access Denied: You cannot unassign resources from an incident outside your jurisdiction"));
        }
        String resourceId = payload.get("resourceId");
        return ResponseEntity.ok(incidentService.unassignResource(id, resourceId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Incident incident = incidentService.getIncidentById(id).orElse(null);
        if (incident != null && currentUser != null && !incidentService.isUserAuthorizedForIncident(incident, currentUser)) {
            return ResponseEntity.status(403).body(Collections.singletonMap("message", "Access Denied: You cannot update status of an incident outside your jurisdiction"));
        }
        String status = payload.get("status");
        return ResponseEntity.ok(incidentService.updateStatus(id, status));
    }

    @PostMapping("/{id}/escalate")
    public ResponseEntity<Incident> escalateIncident(@PathVariable String id) {
        return ResponseEntity.ok(incidentService.escalateIncident(id));
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<Map<String, Object>>> getRecommendations(@PathVariable String id) {
        return ResponseEntity.ok(incidentService.getRecommendedResources(id));
    }

    @PostMapping("/merge")
    public ResponseEntity<Incident> mergeIncidents(@RequestBody Map<String, String> payload) {
        String masterId = payload.get("masterId");
        String duplicateId = payload.get("duplicateId");
        return ResponseEntity.ok(incidentService.mergeIncidents(masterId, duplicateId));
    }

    @PostMapping("/{id}/split-report")
    public ResponseEntity<Incident> splitReport(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String reportId = payload.get("reportId");
        return ResponseEntity.ok(incidentService.splitReport(id, reportId));
    }

    @GetMapping("/duplicate-suggestions")
    public ResponseEntity<List<Map<String, Object>>> getDuplicateSuggestions() {
        return ResponseEntity.ok(incidentService.getDuplicateSuggestions());
    }
}
