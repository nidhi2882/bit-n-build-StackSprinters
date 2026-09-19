package com.resqgrid.backend.controller;

import com.resqgrid.backend.dto.request.*;
import com.resqgrid.backend.entity.Hospital;
import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.service.IngestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/ingest")
public class IngestionController {

    private final IngestionService ingestionService;

    public IngestionController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    /**
     * Public Citizen Web / PWA Report Ingestion
     */
    @PostMapping("/citizen")
    public ResponseEntity<Map<String, Object>> ingestCitizenReport(
            @Valid @RequestBody CitizenReportRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        return ResponseEntity.ok(ingestionService.ingestCitizenReport(request, clientIp));
    }

    /**
     * One-Tap SOS Panic Button Gateway (Guaranteed Level-5 Critical)
     */
    @PostMapping("/sos")
    public ResponseEntity<Map<String, Object>> ingestSosAlert(
            @Valid @RequestBody SosAlertRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        return ResponseEntity.ok(ingestionService.ingestSosAlert(request, clientIp));
    }

    /**
     * 112/911 Call-Center Operator Rapid Ingestion
     */
    @PostMapping("/call-center")
    public ResponseEntity<Incident> ingestCallCenterReport(
            @Valid @RequestBody CallCenterReportRequest request,
            Authentication authentication) {
        String operatorId = authentication != null ? authentication.getName() : "Dispatcher-112";
        return ResponseEntity.ok(ingestionService.ingestCallCenterReport(request, operatorId));
    }

    /**
     * IoT & Sensor Webhook Ingestion (River depth, Smoke, Gas ppm)
     */
    @PostMapping("/sensor")
    public ResponseEntity<Map<String, Object>> ingestSensorTelemetry(
            @Valid @RequestBody SensorTelemetryRequest request) {
        return ResponseEntity.ok(ingestionService.ingestSensorTelemetry(request));
    }

    /**
     * Hospital Capacity Feeds
     */
    @PostMapping("/hospital")
    public ResponseEntity<Hospital> ingestHospitalTelemetry(
            @Valid @RequestBody HospitalTelemetryRequest request) {
        return ResponseEntity.ok(ingestionService.ingestHospitalTelemetry(request));
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.trim().isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
