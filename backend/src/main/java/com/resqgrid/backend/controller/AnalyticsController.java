package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.Resource;
import com.resqgrid.backend.service.AlertService;
import com.resqgrid.backend.service.IncidentService;
import com.resqgrid.backend.service.ResourceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final IncidentService incidentService;
    private final ResourceService resourceService;
    private final AlertService alertService;

    public AnalyticsController(IncidentService incidentService, ResourceService resourceService, AlertService alertService) {
        this.incidentService = incidentService;
        this.resourceService = resourceService;
        this.alertService = alertService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        List<Incident> incidents = incidentService.getAllIncidents();
        List<Resource> resources = resourceService.getAllResources();
        long activeIncidents = incidents.stream()
                .filter(i -> !"Resolved".equalsIgnoreCase(i.getStatus()))
                .count();
        long resolvedIncidents = incidents.size() - activeIncidents;
        long criticalIncidents = incidents.stream()
                .filter(i -> i.getSeverity() != null && i.getSeverity() >= 4 && !"Resolved".equalsIgnoreCase(i.getStatus()))
                .count();
        long availableUnits = resources.stream()
                .filter(r -> "Available".equalsIgnoreCase(r.getStatus()))
                .count();
        long deployedUnits = resources.size() - availableUnits;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalIncidents", incidents.size());
        metrics.put("activeIncidents", activeIncidents);
        metrics.put("resolvedIncidents", resolvedIncidents);
        metrics.put("criticalIncidents", criticalIncidents);
        metrics.put("totalResources", resources.size());
        metrics.put("availableUnits", availableUnits);
        metrics.put("deployedUnits", deployedUnits);
        metrics.put("activeAlertsCount", alertService.getActiveAlerts().size());
        metrics.put("avgResponseTimeMinutes", 8.4);
        metrics.put("resourceUtilizationRate", resources.isEmpty() ? 0 : Math.round((deployedUnits * 100.0) / resources.size()));

        return ResponseEntity.ok(metrics);
    }
}
