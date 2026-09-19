package com.resqgrid.backend.service;

import com.resqgrid.backend.dto.request.*;
import com.resqgrid.backend.entity.*;
import com.resqgrid.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class IngestionService {

    private static final Logger log = LoggerFactory.getLogger(IngestionService.class);

    private final IncidentService incidentService;
    private final IncidentRepository incidentRepository;
    private final IncidentReportRepository incidentReportRepository;
    private final AlertRepository alertRepository;
    private final HospitalRepository hospitalRepository;
    private final RateLimiterService rateLimiterService;
    private final TrustScoringService trustScoringService;
    private final AiClientService aiClientService;
    private final TaxonomyService taxonomyService;
    private final MongoSyncService mongoSyncService;

    public IngestionService(IncidentService incidentService,
                            IncidentRepository incidentRepository,
                            IncidentReportRepository incidentReportRepository,
                            AlertRepository alertRepository,
                            HospitalRepository hospitalRepository,
                            RateLimiterService rateLimiterService,
                            TrustScoringService trustScoringService,
                            AiClientService aiClientService,
                            TaxonomyService taxonomyService,
                            MongoSyncService mongoSyncService) {
        this.incidentService = incidentService;
        this.incidentRepository = incidentRepository;
        this.incidentReportRepository = incidentReportRepository;
        this.alertRepository = alertRepository;
        this.hospitalRepository = hospitalRepository;
        this.rateLimiterService = rateLimiterService;
        this.trustScoringService = trustScoringService;
        this.aiClientService = aiClientService;
        this.taxonomyService = taxonomyService;
        this.mongoSyncService = mongoSyncService;
    }

    /**
     * 1. Citizen Web / PWA Report Ingestion
     */
    @Transactional
    public Map<String, Object> ingestCitizenReport(CitizenReportRequest req, String clientIp) {
        if (!rateLimiterService.isAllowed(clientIp)) {
            throw new RuntimeException("Rate limit exceeded. Please wait a moment before submitting another report.");
        }

        // 1. Trust Scoring
        Map<String, Object> trust = trustScoringService.evaluateTrust(
                "Citizen App", req.getDescription(), req.getLat(), req.getLng(), req.getReporterPhone(), 0);
        double trustScore = (double) trust.get("trustScore");

        // 2. AI Classification & Severity (or Degraded Fallback)
        String combinedText = req.getTitle() + ". " + (req.getDescription() != null ? req.getDescription() : "");
        Map<String, Object> aiClassification = aiClientService.classifyIncident(combinedText);

        String categoryName = aiClassification.get("categoryName") != null ? aiClassification.get("categoryName").toString() : req.getType();
        if (categoryName == null || categoryName.trim().isEmpty()) {
            categoryName = "Medical";
        }

        String aiSummary = aiClassification.get("summary") != null ? aiClassification.get("summary").toString()
                : "Citizen emergency report received. Triage pending.";
        double confidence = aiClassification.get("confidence") != null ? (double) aiClassification.get("confidence") : 0.85;

        @SuppressWarnings("unchecked")
        List<String> capabilities = (List<String>) aiClassification.get("capabilities");
        if (capabilities == null || capabilities.isEmpty()) {
            capabilities = taxonomyService.resolveDefaultCapabilities(null, req.getSubTypeId());
        }

        int severity = req.getSeverity() != null ? req.getSeverity() : 3;
        if (combinedText.toLowerCase().contains("trapped") || combinedText.toLowerCase().contains("drowning")) {
            severity = 5;
        }

        // 2.5 Check 3-Signal Duplicate Consolidation
        Map<String, Object> candidate = new HashMap<>();
        candidate.put("lat", req.getLat() != null ? req.getLat() : 22.3072);
        candidate.put("lng", req.getLng() != null ? req.getLng() : 73.1812);
        candidate.put("title", req.getTitle());
        candidate.put("text", combinedText);

        List<Incident> activeIncidents = incidentRepository.findAll();
        List<Map<String, Object>> existingList = new ArrayList<>();
        for (Incident inc : activeIncidents) {
            if (Boolean.TRUE.equals(inc.getIsMerged()) || "Resolved".equalsIgnoreCase(inc.getStatus())) continue;
            Map<String, Object> item = new HashMap<>();
            item.put("id", inc.getId());
            item.put("title", inc.getTitle());
            item.put("text", inc.getDescription());
            item.put("lat", inc.getLat());
            item.put("lng", inc.getLng());
            item.put("isMerged", inc.getIsMerged());
            existingList.add(item);
        }

        Map<String, Object> reqPayload = new HashMap<>();
        reqPayload.put("candidate", candidate);
        reqPayload.put("existingIncidents", existingList);

        Map<String, Object> dupCheck = aiClientService.checkDuplicates(reqPayload);
        if (dupCheck != null && Boolean.TRUE.equals(dupCheck.get("isDuplicate"))) {
            @SuppressWarnings("unchecked")
            Map<String, Object> bestMatch = (Map<String, Object>) dupCheck.get("bestMatch");
            if (bestMatch != null && bestMatch.get("matchedIncidentId") != null) {
                String masterId = bestMatch.get("matchedIncidentId").toString();
                Optional<Incident> masterOpt = incidentRepository.findById(masterId);
                if (masterOpt.isPresent()) {
                    Incident master = masterOpt.get();
                    master.setDuplicateCount((master.getDuplicateCount() != null ? master.getDuplicateCount() : 0) + 1);
                    if (master.getDuplicateCount() >= 3 && master.getSeverity() < 5) {
                        master.setSeverity(master.getSeverity() + 1);
                        log.info("Duplicate threshold breached on incident {}. Bumping severity to Level {}", masterId, master.getSeverity());
                    }
                    incidentRepository.save(master);
                    mongoSyncService.syncIncident(master);

                    IncidentReport report = IncidentReport.builder()
                            .id("REP-" + System.currentTimeMillis())
                            .incidentId(master.getId())
                            .source("Citizen App (" + (req.getReporterName() != null ? req.getReporterName() : "Citizen") + ")")
                            .text("[CONSOLIDATED DUPLICATE] " + combinedText)
                            .time("Just now")
                            .createdAt(LocalDateTime.now())
                            .build();
                    incidentReportRepository.save(report);
                    mongoSyncService.syncIncidentReport(report);

                    Map<String, Object> response = new HashMap<>();
                    response.put("incident", master);
                    response.put("report", report);
                    response.put("trust", trust);
                    response.put("consolidated", true);
                    response.put("duplicateCheck", dupCheck);
                    return response;
                }
            }
        }

        Double parseLat = req.getLat();
        Double parseLng = req.getLng();
        if ((parseLat == null || parseLng == null) && req.getLocationName() != null && req.getLocationName().contains(",")) {
            try {
                String[] parts = req.getLocationName().split(",");
                if (parts.length == 2) {
                    parseLat = Double.parseDouble(parts[0].trim());
                    parseLng = Double.parseDouble(parts[1].trim());
                }
            } catch (Exception ignored) {}
        }

        // 3. Create Incident
        Incident incident = Incident.builder()
                .title(req.getTitle())
                .type(categoryName)
                .description(req.getDescription())
                .severity(severity)
                .status("Reported")
                .locationName(req.getLocationName() != null ? req.getLocationName() : "Unknown Location")
                .lat(parseLat != null ? parseLat : 22.3072)
                .lng(parseLng != null ? parseLng : 73.1812)
                .reporterRole("Citizen (Trust: " + trustScore + ")")
                .aiSummary(aiSummary)
                .aiConfidence(confidence)
                .requiredCapabilities(capabilities)
                .duplicateCount(0)
                .reportedAt(LocalDateTime.now())
                .build();

        Incident savedIncident = incidentService.createIncident(incident);

        // 4. Save Raw Report
        IncidentReport report = IncidentReport.builder()
                .id("REP-" + System.currentTimeMillis())
                .incidentId(savedIncident.getId())
                .source("Citizen App (" + (req.getReporterName() != null ? req.getReporterName() : "Citizen") + ")")
                .text(combinedText)
                .time("Just now")
                .createdAt(LocalDateTime.now())
                .build();
        incidentReportRepository.save(report);
        mongoSyncService.syncIncidentReport(report);

        Map<String, Object> response = new HashMap<>();
        response.put("incident", savedIncident);
        response.put("report", report);
        response.put("trust", trust);
        response.put("aiMetadata", aiClassification);
        return response;
    }

    /**
     * 2. One-Tap SOS Panic Button Ingestion (Instant, Guaranteed Level 5)
     */
    @Transactional
    public Map<String, Object> ingestSosAlert(SosAlertRequest req, String clientIp) {
        log.warn("ONE-TAP SOS PANIC SIGNAL RECEIVED from ({}, {})", req.getLat(), req.getLng());

        String locationName = req.getLocationName() != null && !req.getLocationName().trim().isEmpty()
                ? req.getLocationName()
                : String.format("GPS Coordinates (%.4f, %.4f)", req.getLat(), req.getLng());

        String reporter = req.getReporterName() != null ? req.getReporterName() : "Citizen SOS Panic Node";
        if (req.getReporterPhone() != null && !req.getReporterPhone().trim().isEmpty()) {
            reporter += " [" + req.getReporterPhone() + "]";
        }

        // Guaranteed Level 5 Critical
        Incident sosIncident = Incident.builder()
                .title("🚨 ONE-TAP PANIC SOS: Urgent Rescue Needed")
                .type(req.getEmergencyType() != null ? req.getEmergencyType() : "Rescue")
                .description("High-priority one-tap SOS triggered. Immediate search, rescue, and life support dispatch required at coordinate pin.")
                .severity(5)
                .status("Reported")
                .locationName(locationName)
                .lat(req.getLat())
                .lng(req.getLng())
                .reporterRole(reporter)
                .aiSummary("Guaranteed Level-5 SOS trigger. Automated priority elevation initiated. Triage teams notified.")
                .aiConfidence(0.99)
                .requiredCapabilities(Arrays.asList("WATER_RESCUE", "ADVANCED_AMBULANCE", "SEARCH_DOGS", "FIRST_AID"))
                .duplicateCount(0)
                .reportedAt(LocalDateTime.now())
                .build();

        Incident savedIncident = incidentService.createIncident(sosIncident);

        // Immediate Flash Alert
        Alert sosAlert = Alert.builder()
                .id("ALT-SOS-" + System.currentTimeMillis())
                .type("CRITICAL")
                .title("🚨 ONE-TAP SOS ALERT: " + locationName)
                .message("High-priority citizen distress beacon active. Immediate unit dispatch required!")
                .time("Just now")
                .incidentId(savedIncident.getId())
                .actionRequired("Immediate First Responder Dispatch")
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();
        alertRepository.save(sosAlert);
        mongoSyncService.syncAlert(sosAlert);

        IncidentReport report = IncidentReport.builder()
                .id("REP-SOS-" + System.currentTimeMillis())
                .incidentId(savedIncident.getId())
                .source("Citizen SOS Beacon")
                .text("One-Tap SOS Panic Button Triggered. Notes: " + (req.getNotes() != null ? req.getNotes() : "None"))
                .time("Just now")
                .createdAt(LocalDateTime.now())
                .build();
        incidentReportRepository.save(report);
        mongoSyncService.syncIncidentReport(report);

        Map<String, Object> response = new HashMap<>();
        response.put("incident", savedIncident);
        response.put("alert", sosAlert);
        response.put("status", "EMERGENCY_DISPATCH_TRIGGERED");
        return response;
    }

    /**
     * 3. Call-Center Operator Entry
     */
    @Transactional
    public Incident ingestCallCenterReport(CallCenterReportRequest req, String operatorId) {
        String category = req.getType() != null ? req.getType() : "Emergency";
        int severity = req.getSeverity() != null ? req.getSeverity() : 4;

        List<String> caps = req.getRequiredCapabilities();
        if (caps == null || caps.isEmpty()) {
            caps = taxonomyService.resolveDefaultCapabilities(req.getType(), req.getSubTypeId());
        }

        Incident incident = Incident.builder()
                .title(req.getTitle())
                .type(category)
                .description(req.getDescription())
                .severity(severity)
                .status("Classified")
                .locationName(req.getLocationName() != null ? req.getLocationName() : "Vadodara Central")
                .lat(req.getLat() != null ? req.getLat() : 22.3072)
                .lng(req.getLng() != null ? req.getLng() : 73.1812)
                .reporterRole("112 Call Center (" + (operatorId != null ? operatorId : "Dispatcher") + ")")
                .aiSummary("Call operator verified intake: " + req.getTitle() + ". Ready for immediate unit allocation.")
                .aiConfidence(1.0)
                .requiredCapabilities(caps)
                .duplicateCount(0)
                .reportedAt(LocalDateTime.now())
                .build();

        Incident saved = incidentService.createIncident(incident);

        IncidentReport report = IncidentReport.builder()
                .id("REP-CALL-" + System.currentTimeMillis())
                .incidentId(saved.getId())
                .source("112 Emergency Hotline (Caller: " + (req.getCallerName() != null ? req.getCallerName() : "Anonymous") + ")")
                .text("Dispatcher Intake: " + req.getDescription())
                .time("Just now")
                .createdAt(LocalDateTime.now())
                .build();
        incidentReportRepository.save(report);
        mongoSyncService.syncIncidentReport(report);

        return saved;
    }

    /**
     * 4. IoT & Sensor Telemetry Webhook
     */
    @Transactional
    public Map<String, Object> ingestSensorTelemetry(SensorTelemetryRequest req) {
        boolean isBreach = req.getThreshold() != null && req.getMetricValue() != null
                && req.getMetricValue() >= req.getThreshold();

        String status = isBreach ? "CRITICAL_BREACH" : "NORMAL";
        int severity = isBreach ? 5 : 2;

        Map<String, Object> result = new HashMap<>();
        result.put("sensorId", req.getSensorId());
        result.put("status", status);
        result.put("metricValue", req.getMetricValue());
        result.put("threshold", req.getThreshold());

        if (isBreach) {
            String type = "Flood";
            if ("SMOKE_HEAT".equalsIgnoreCase(req.getSensorType())) type = "Fire";
            else if ("GAS_PPM".equalsIgnoreCase(req.getSensorType())) type = "Hazardous";
            else if ("SEISMIC".equalsIgnoreCase(req.getSensorType())) type = "Geological";

            Incident sensorIncident = Incident.builder()
                    .title("⚠️ SENSOR BREACH ALERT: " + req.getSensorId() + " (" + req.getMetricName() + ")")
                    .type(type)
                    .description(String.format("Autonomous sensor threshold breach detected: %s = %.2f %s (Threshold: %.2f %s) at %s.",
                            req.getMetricName(), req.getMetricValue(), req.getUnit(), req.getThreshold(), req.getUnit(), req.getLocationName()))
                    .severity(severity)
                    .status("Classified")
                    .locationName(req.getLocationName() != null ? req.getLocationName() : "Sensor Grid Sector 4")
                    .lat(req.getLat() != null ? req.getLat() : 22.3120)
                    .lng(req.getLng() != null ? req.getLng() : 73.1750)
                    .reporterRole("IoT Sensor Array (" + req.getSensorId() + ")")
                    .aiSummary("Automated telemetry threshold breach. Level-5 sensor corroboration confirmed.")
                    .aiConfidence(0.98)
                    .duplicateCount(0)
                    .requiredCapabilities(Arrays.asList("WATER_RESCUE", "HEAVY_PUMP", "DECONTAMINATION_UNIT"))
                    .reportedAt(LocalDateTime.now())
                    .build();

            Incident saved = incidentService.createIncident(sensorIncident);

            Alert sensorAlert = Alert.builder()
                    .id("ALT-SEN-" + System.currentTimeMillis())
                    .type("CRITICAL")
                    .title("SENSOR BREACH: " + req.getSensorId())
                    .message(String.format("Magnitude %.2f %s exceeded safe threshold %.2f %s at %s.",
                            req.getMetricValue(), req.getUnit(), req.getThreshold(), req.getUnit(), req.getLocationName()))
                    .time("Just now")
                    .incidentId(saved.getId())
                    .actionRequired("Immediate Sector Dispatch")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            alertRepository.save(sensorAlert);
            mongoSyncService.syncAlert(sensorAlert);

            result.put("incident", saved);
            result.put("alert", sensorAlert);
        }

        return result;
    }

    /**
     * 5. Hospital Telemetry Feed Ingestion
     */
    @Transactional
    public Hospital ingestHospitalTelemetry(HospitalTelemetryRequest req) {
        Hospital hospital = hospitalRepository.findById(req.getHospitalId())
                .orElseThrow(() -> new RuntimeException("Hospital not found: " + req.getHospitalId()));

        if (req.getTraumaBedsOccupied() != null) hospital.setTraumaBedsOccupied(req.getTraumaBedsOccupied());
        if (req.getTraumaBedsTotal() != null) hospital.setTraumaBedsTotal(req.getTraumaBedsTotal());
        if (req.getIcuBedsOccupied() != null) hospital.setIcuBedsOccupied(req.getIcuBedsOccupied());
        if (req.getIcuBedsTotal() != null) hospital.setIcuBedsTotal(req.getIcuBedsTotal());
        if (req.getBloodUnitsAvailable() != null) hospital.setBloodUnitsAvailable(req.getBloodUnitsAvailable());
        if (req.getAmbulanceBayStatus() != null) hospital.setAmbulanceBayStatus(req.getAmbulanceBayStatus());

        double traumaRatio = (double) hospital.getTraumaBedsOccupied() / Math.max(1, hospital.getTraumaBedsTotal());
        if (traumaRatio >= 0.90) {
            hospital.setStatus("Critical Capacity");
            Alert warning = Alert.builder()
                    .id("ALT-HOSP-" + System.currentTimeMillis())
                    .type("WARNING")
                    .title("HOSPITAL CAPACITY ALERT: " + hospital.getName())
                    .message(String.format("Trauma occupancy at %.0f%% (%d/%d). Rerouting incoming ambulances.",
                            traumaRatio * 100, hospital.getTraumaBedsOccupied(), hospital.getTraumaBedsTotal()))
                    .time("Just now")
                    .actionRequired("Reroute Ambulances")
                    .active(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            alertRepository.save(warning);
            mongoSyncService.syncAlert(warning);
        } else if (traumaRatio >= 0.75) {
            hospital.setStatus("Near Capacity");
        } else {
            hospital.setStatus("Optimal");
        }

        Hospital saved = hospitalRepository.save(hospital);
        mongoSyncService.syncHospital(saved);
        return saved;
    }
}
