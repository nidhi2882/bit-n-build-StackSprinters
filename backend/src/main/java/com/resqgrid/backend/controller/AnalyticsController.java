package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.Resource;
import com.resqgrid.backend.security.UserPrincipal;
import com.resqgrid.backend.service.AlertService;
import com.resqgrid.backend.service.IncidentService;
import com.resqgrid.backend.service.ResourceService;
import com.resqgrid.backend.service.ServiceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final IncidentService incidentService;
    private final ResourceService resourceService;
    private final AlertService alertService;
    private final ServiceRequestService serviceRequestService;

    public AnalyticsController(IncidentService incidentService,
                               ResourceService resourceService,
                               AlertService alertService,
                               ServiceRequestService serviceRequestService) {
        this.incidentService = incidentService;
        this.resourceService = resourceService;
        this.alertService = alertService;
        this.serviceRequestService = serviceRequestService;
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

        // Incident volume grouped by normalized department category (for the analytics chart)
        Map<String, Long> byCategory = new java.util.LinkedHashMap<>();
        for (String cat : java.util.Arrays.asList("FLOOD", "FIRE", "MEDICAL", "CRASH", "HAZMAT", "COLLAPSE", "CYCLONE", "SEARCH_RESCUE", "POLICE")) {
            byCategory.put(cat, 0L);
        }
        for (Incident inc : incidents) {
            String raw = inc.getCategory() != null ? inc.getCategory() : inc.getType();
            com.resqgrid.backend.entity.DepartmentCategory dc = com.resqgrid.backend.entity.DepartmentCategory.fromString(raw);
            String key = dc != null ? dc.name() : null;
            if (key != null) {
                byCategory.merge(key, 1L, Long::sum);
            }
        }

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalIncidents", incidents.size());
        metrics.put("activeIncidents", activeIncidents);
        metrics.put("resolvedIncidents", resolvedIncidents);
        metrics.put("criticalIncidents", criticalIncidents);
        metrics.put("totalResources", resources.size());
        metrics.put("availableUnits", availableUnits);
        metrics.put("deployedUnits", deployedUnits);
        metrics.put("activeAlertsCount", alertService.getActiveAlerts().size());
        metrics.put("avgResponseTimeMinutes", 4.3);
        metrics.put("avgResponseMinutes", 4.3);
        metrics.put("slaComplianceRate", 98.4);
        metrics.put("byCategory", byCategory);
        metrics.put("resourceUtilizationRate", resources.isEmpty() ? 0 : Math.round((deployedUnits * 100.0) / resources.size()));

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/department")
    public ResponseEntity<Map<String, Object>> getDepartmentAnalytics(
            @RequestParam(required = false) String department,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String deptCategory = department;
        if (deptCategory == null || deptCategory.trim().isEmpty()) {
            deptCategory = (currentUser != null && currentUser.getDepartmentCategory() != null)
                    ? currentUser.getDepartmentCategory()
                    : "FLOOD";
        }
        final String targetCategory = deptCategory.toUpperCase().replace("CAT_", "");

        List<Incident> allIncidents = currentUser != null ? incidentService.getScopedIncidents(currentUser) : incidentService.getAllIncidents();
        List<Incident> deptIncidents = allIncidents.stream()
                .filter(i -> targetCategory.equalsIgnoreCase(i.getCategory()) ||
                        (i.getType() != null && targetCategory.equalsIgnoreCase(i.getType())))
                .collect(Collectors.toList());

        List<Resource> allResources = resourceService.getAllResources();
        List<Resource> deptResources = allResources.stream()
                .filter(r -> targetCategory.equalsIgnoreCase(r.getDepartmentCategory()))
                .collect(Collectors.toList());

        long activeIncidents = deptIncidents.stream()
                .filter(i -> !"Resolved".equalsIgnoreCase(i.getStatus()))
                .count();
        long resolvedIncidents = deptIncidents.size() - activeIncidents;
        long criticalSurges = deptIncidents.stream()
                .filter(i -> i.getSeverity() != null && i.getSeverity() >= 4 && !"Resolved".equalsIgnoreCase(i.getStatus()))
                .count();
        long availableUnits = deptResources.stream()
                .filter(r -> "Available".equalsIgnoreCase(r.getStatus()))
                .count();
        long deployedUnits = deptResources.size() - availableUnits;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("department", targetCategory);
        metrics.put("activeIncidents", activeIncidents);
        metrics.put("criticalSurges", criticalSurges);
        metrics.put("resolvedIncidents", resolvedIncidents);
        metrics.put("totalFleet", deptResources.size());
        metrics.put("availableFleet", availableUnits);
        metrics.put("deployedFleet", deployedUnits);
        metrics.put("fleetUtilizationRate", deptResources.isEmpty() ? 0 : Math.round((deployedUnits * 100.0) / deptResources.size()));
        metrics.put("avgResponseTimeMinutes", 3.8);
        metrics.put("slaComplianceRate", 99.1);
        metrics.put("onDutyPersonnel", deptResources.stream().mapToInt(r -> r.getPersonnelCount() != null ? r.getPersonnelCount() : 3).sum());

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/percentiles")
    public ResponseEntity<Map<String, Object>> getResponseTimePercentiles() {
        Map<String, Object> data = new HashMap<>();
        data.put("overallP50Minutes", 3.8);
        data.put("overallP90Minutes", 6.2);
        data.put("overallP99Minutes", 11.4);

        Map<String, Object> deptPercentiles = new HashMap<>();
        deptPercentiles.put("FLOOD", Map.of("p50", 4.1, "p90", 6.8, "sampleCount", 42));
        deptPercentiles.put("FIRE", Map.of("p50", 3.2, "p90", 5.1, "sampleCount", 58));
        deptPercentiles.put("MEDICAL", Map.of("p50", 3.5, "p90", 5.4, "sampleCount", 95));
        deptPercentiles.put("CRASH", Map.of("p50", 4.0, "p90", 6.0, "sampleCount", 31));
        deptPercentiles.put("HAZMAT", Map.of("p50", 5.8, "p90", 9.2, "sampleCount", 14));
        deptPercentiles.put("COLLAPSE", Map.of("p50", 6.1, "p90", 9.8, "sampleCount", 11));
        deptPercentiles.put("CYCLONE", Map.of("p50", 7.2, "p90", 12.0, "sampleCount", 19));
        deptPercentiles.put("SEARCH_RESCUE", Map.of("p50", 8.4, "p90", 14.2, "sampleCount", 17));
        deptPercentiles.put("POLICE", Map.of("p50", 2.9, "p90", 4.6, "sampleCount", 83));

        data.put("departments", deptPercentiles);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/heatmaps")
    public ResponseEntity<Map<String, Object>> getDisasterDensityHeatmaps() {
        List<Incident> incidents = incidentService.getAllIncidents();
        List<Map<String, Object>> clusters = incidents.stream()
                .filter(i -> i.getLat() != null && i.getLng() != null)
                .map(i -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("id", i.getId());
                    point.put("lat", i.getLat());
                    point.put("lng", i.getLng());
                    point.put("intensity", i.getSeverity() != null ? (i.getSeverity() / 5.0) : 0.6);
                    point.put("category", i.getCategory() != null ? i.getCategory() : "GENERAL");
                    point.put("radiusMeters", (i.getSeverity() != null ? i.getSeverity() : 3) * 300);
                    return point;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("totalHotspots", clusters.size());
        result.put("clusters", clusters);
        return ResponseEntity.ok(result);
    }
}
