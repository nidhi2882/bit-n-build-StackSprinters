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
        metrics.put("slaComplianceRate", 98.4);
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
}
