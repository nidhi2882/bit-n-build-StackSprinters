package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.security.UserPrincipal;
import com.resqgrid.backend.service.IncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<List<Incident>> getAllIncidents(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser != null) {
            return ResponseEntity.ok(incidentService.getScopedIncidents(currentUser));
        }
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable String id) {
        return incidentService.getIncidentById(id)
                .map(ResponseEntity::ok)
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
    public ResponseEntity<Incident> assignUnit(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String unitId = payload.get("unitId");
        if (unitId == null) {
            unitId = payload.get("resourceId");
        }
        return ResponseEntity.ok(incidentService.assignResource(id, unitId));
    }

    @PostMapping("/{id}/assign-resource")
    public ResponseEntity<Incident> assignResource(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String resourceId = payload.get("resourceId");
        if (resourceId == null) {
            resourceId = payload.get("unitId");
        }
        return ResponseEntity.ok(incidentService.assignResource(id, resourceId));
    }

    @PostMapping("/{id}/unassign-resource")
    public ResponseEntity<Incident> unassignResource(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
        String resourceId = payload.get("resourceId");
        return ResponseEntity.ok(incidentService.unassignResource(id, resourceId));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload) {
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
