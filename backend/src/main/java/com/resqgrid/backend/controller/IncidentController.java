package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.service.IncidentService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<Incident>> getAllIncidents() {
        return ResponseEntity.ok(incidentService.getAllIncidents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Incident> getIncidentById(@PathVariable String id) {
        return incidentService.getIncidentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody Incident incident) {
        return ResponseEntity.ok(incidentService.createIncident(incident));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Incident> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(incidentService.updateStatus(id, status));
    }

    @PostMapping("/{id}/assign-resource")
    public ResponseEntity<Incident> assignResource(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String resourceId = payload.get("resourceId");
        return ResponseEntity.ok(incidentService.assignResource(id, resourceId));
    }

    @PostMapping("/{id}/unassign-resource")
    public ResponseEntity<Incident> unassignResource(@PathVariable String id, @RequestBody Map<String, String> payload) {
        String resourceId = payload.get("resourceId");
        return ResponseEntity.ok(incidentService.unassignResource(id, resourceId));
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
