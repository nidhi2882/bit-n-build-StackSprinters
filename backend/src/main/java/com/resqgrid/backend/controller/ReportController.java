package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.IncidentReport;
import com.resqgrid.backend.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<List<IncidentReport>> getAllReports(@RequestParam(required = false) String incidentId) {
        if (incidentId != null && !incidentId.trim().isEmpty()) {
            return ResponseEntity.ok(reportService.getReportsByIncidentId(incidentId));
        }
        return ResponseEntity.ok(reportService.getAllReports());
    }

    @PostMapping
    public ResponseEntity<IncidentReport> createReport(@RequestBody IncidentReport report) {
        return ResponseEntity.ok(reportService.createReport(report));
    }
}
