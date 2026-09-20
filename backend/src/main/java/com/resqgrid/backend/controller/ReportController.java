package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.DepartmentCategory;
import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.IncidentReport;
import com.resqgrid.backend.security.UserPrincipal;
import com.resqgrid.backend.service.IncidentService;
import com.resqgrid.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final IncidentService incidentService;

    public ReportController(ReportService reportService, IncidentService incidentService) {
        this.reportService = reportService;
        this.incidentService = incidentService;
    }

    @GetMapping
    public ResponseEntity<List<IncidentReport>> getAllReports(@RequestParam(required = false) String incidentId) {
        if (incidentId != null && !incidentId.trim().isEmpty()) {
            return ResponseEntity.ok(reportService.getReportsByIncidentId(incidentId));
        }
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PostMapping
    public ResponseEntity<?> createReport(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String title = (String) payload.get("title");
        String category = (String) payload.get("category");
        String description = (String) payload.get("description");
        String locationName = (String) payload.get("locationName");
        Double lat = payload.get("lat") != null ? Double.valueOf(payload.get("lat").toString()) : 37.7749;
        Double lng = payload.get("lng") != null ? Double.valueOf(payload.get("lng").toString()) : -122.4194;
        Integer severity = payload.get("severity") != null ? Integer.valueOf(payload.get("severity").toString()) : 3;

        DepartmentCategory deptCat = DepartmentCategory.fromString(category);
        String catName = deptCat != null ? deptCat.name() : (category != null ? category.toUpperCase() : "MEDICAL");

        if (title == null || title.trim().isEmpty()) {
            title = catName + " Emergency Incident";
        }

        String incidentId = "INC-" + (System.currentTimeMillis() % 100000);
        String reporterId = currentUser != null ? String.valueOf(currentUser.getId()) : (String) payload.get("reporterId");
        String reporterName = currentUser != null ? currentUser.getName() : (String) payload.get("reporterName");
        String reporterEmail = currentUser != null ? currentUser.getEmail() : (String) payload.get("reporterEmail");
        String reporterPhone = (String) payload.get("reporterPhone");

        Incident incident = Incident.builder()
                .id(incidentId)
                .title(title)
                .category(catName)
                .type(catName)
                .description(description)
                .locationName(locationName != null ? locationName : "Metro Sector 04")
                .lat(lat)
                .lng(lng)
                .severity(severity)
                .status("Reported")
                .reportedAt(LocalDateTime.now())
                .reporterId(reporterId)
                .reporterName(reporterName != null ? reporterName : "Citizen")
                .reporterEmail(reporterEmail)
                .reporterPhone(reporterPhone)
                .reporterRole("CITIZEN")
                .aiSummary("Citizen reported " + catName + " emergency at " + locationName)
                .aiConfidence(0.92)
                .build();

        Incident savedIncident = incidentService.createIncident(incident);

        // Also create an IncidentReport record
        IncidentReport report = IncidentReport.builder()
                .id("REP-" + System.currentTimeMillis())
                .incidentId(savedIncident.getId())
                .source("CITIZEN_PORTAL")
                .text(description)
                .time("Just now")
                .createdAt(LocalDateTime.now())
                .build();
        reportService.createReport(report);

        return ResponseEntity.ok(savedIncident);
    }

    @PostMapping("/sos")
    public ResponseEntity<Incident> createSosReport(
            @RequestBody(required = false) Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Double lat = 37.7749;
        Double lng = -122.4194;
        String locationName = "GPS Live Broadcast (Sector Alpha)";
        String category = "MEDICAL";

        if (payload != null) {
            if (payload.get("lat") != null) lat = Double.valueOf(payload.get("lat").toString());
            if (payload.get("lng") != null) lng = Double.valueOf(payload.get("lng").toString());
            if (payload.get("locationName") != null) locationName = (String) payload.get("locationName");
            if (payload.get("category") != null) category = (String) payload.get("category");
        }

        DepartmentCategory deptCat = DepartmentCategory.fromString(category);
        String catName = deptCat != null ? deptCat.name() : "MEDICAL";

        String incidentId = "SOS-" + (System.currentTimeMillis() % 100000);
        String reporterId = currentUser != null ? String.valueOf(currentUser.getId()) : (payload != null ? (String) payload.get("reporterId") : null);
        String reporterName = currentUser != null ? currentUser.getName() : "Emergency Caller";
        String reporterEmail = currentUser != null ? currentUser.getEmail() : "sos@citizen.local";

        Incident sosIncident = Incident.builder()
                .id(incidentId)
                .title("CRITICAL CITIZEN SOS DISPATCH")
                .category(catName)
                .type(catName)
                .description("IMMEDIATE DISTRESS CALL: Civilian triggered direct 1-tap SOS telemetry beacon.")
                .locationName(locationName)
                .lat(lat)
                .lng(lng)
                .severity(5)
                .status("Reported")
                .reportedAt(LocalDateTime.now())
                .reporterId(reporterId)
                .reporterName(reporterName)
                .reporterEmail(reporterEmail)
                .reporterRole("CITIZEN")
                .aiSummary("Priority 5 Distress SOS broadcast. Immediate CAD unit staging triggered.")
                .aiConfidence(0.99)
                .build();

        Incident saved = incidentService.createIncident(sosIncident);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<Incident>> getMyReports(@AuthenticationPrincipal UserPrincipal currentUser) {
        if (currentUser == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(incidentService.getScopedIncidents(currentUser));
    }
}
