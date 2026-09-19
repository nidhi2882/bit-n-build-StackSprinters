package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Alert;
import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.Resource;
import com.resqgrid.backend.entity.ResourceAssignment;
import com.resqgrid.backend.repository.AlertRepository;
import com.resqgrid.backend.repository.IncidentReportRepository;
import com.resqgrid.backend.repository.IncidentRepository;
import com.resqgrid.backend.repository.ResourceAssignmentRepository;
import com.resqgrid.backend.repository.ResourceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class IncidentService {

    private static final Logger log = LoggerFactory.getLogger(IncidentService.class);

    private final IncidentRepository incidentRepository;
    private final IncidentReportRepository incidentReportRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceAssignmentRepository resourceAssignmentRepository;
    private final AlertRepository alertRepository;
    private final MongoSyncService mongoSyncService;
    private final AiClientService aiClientService;
    private final OsrmService osrmService;

    public IncidentService(IncidentRepository incidentRepository,
                           IncidentReportRepository incidentReportRepository,
                           ResourceRepository resourceRepository,
                           ResourceAssignmentRepository resourceAssignmentRepository,
                           AlertRepository alertRepository,
                           MongoSyncService mongoSyncService) {
        this(incidentRepository, incidentReportRepository, resourceRepository, resourceAssignmentRepository, alertRepository, mongoSyncService, null, null);
    }

    @Autowired
    public IncidentService(IncidentRepository incidentRepository,
                           IncidentReportRepository incidentReportRepository,
                           ResourceRepository resourceRepository,
                           ResourceAssignmentRepository resourceAssignmentRepository,
                           AlertRepository alertRepository,
                           MongoSyncService mongoSyncService,
                           @Autowired(required = false) AiClientService aiClientService,
                           @Autowired(required = false) OsrmService osrmService) {
        this.incidentRepository = incidentRepository;
        this.incidentReportRepository = incidentReportRepository;
        this.resourceRepository = resourceRepository;
        this.resourceAssignmentRepository = resourceAssignmentRepository;
        this.alertRepository = alertRepository;
        this.mongoSyncService = mongoSyncService;
        this.aiClientService = aiClientService;
        this.osrmService = osrmService;
    }

    public List<Incident> getAllIncidents() {
        return incidentRepository.findAllByOrderByReportedAtDesc();
    }

    public Optional<Incident> getIncidentById(String id) {
        return incidentRepository.findById(id);
    }

    @Transactional
    public Incident createIncident(Incident incident) {
        if (incident.getId() == null || incident.getId().trim().isEmpty()) {
            long count = incidentRepository.count();
            incident.setId(String.format("INC-2026-%03d", count + 1));
        }

        if (incident.getReportedAt() == null) {
            incident.setReportedAt(LocalDateTime.now());
        }
        if (incident.getStatus() == null) {
            incident.setStatus("Reported");
        }
        if (incident.getDuplicateCount() == null) {
            incident.setDuplicateCount(0);
        }

        // Auto-assign default capabilities if not provided based on type
        if (incident.getRequiredCapabilities() == null || incident.getRequiredCapabilities().isEmpty()) {
            List<String> caps = new ArrayList<>();
            if ("Flood".equalsIgnoreCase(incident.getType())) {
                caps.add("Water Rescue");
                caps.add("Inflatable Boat");
            } else if ("Fire".equalsIgnoreCase(incident.getType())) {
                caps.add("Fire Engine");
                caps.add("Foam Tender");
            } else if ("Hazardous".equalsIgnoreCase(incident.getType())) {
                caps.add("Hazmat Unit");
            } else {
                caps.add("Emergency Medical");
            }
            incident.setRequiredCapabilities(caps);
        }

        Incident saved = incidentRepository.save(incident);
        mongoSyncService.syncIncident(saved);

        // Auto-escalation trigger: If severity >= 4, trigger immediate Critical Alert
        if (saved.getSeverity() != null && saved.getSeverity() >= 4) {
            Alert criticalAlert = Alert.builder()
                    .id("ALT-" + System.currentTimeMillis())
                    .type("CRITICAL")
                    .title("CRITICAL SEVERITY: " + saved.getTitle())
                    .message(String.format("%s (%s) at %s. Level %d/5 emergency requires immediate unit triage.",
                            saved.getId(), saved.getType(), saved.getLocationName(), saved.getSeverity()))
                    .incidentId(saved.getId())
                    .actionRequired("Immediate Dispatch Required")
                    .active(true)
                    .time("Just now")
                    .createdAt(LocalDateTime.now())
                    .build();
            alertRepository.save(criticalAlert);
            mongoSyncService.syncAlert(criticalAlert);
        }

        return saved;
    }

    @Transactional
    public Incident updateStatus(String incidentId, String status) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));

        if ("Resolved".equalsIgnoreCase(status)) {
            List<String> assignedIds = incident.getAssignedResourceIds();
            if (assignedIds == null || assignedIds.isEmpty()) {
                throw new IllegalStateException("Cannot mark incident " + incidentId + " as Resolved: No response units are currently assigned.");
            }

            List<Resource> assignedResources = resourceRepository.findAllById(assignedIds);
            boolean validResponseState = assignedResources.stream().anyMatch(r -> {
                String st = r.getStatus() != null ? r.getStatus().toLowerCase() : "";
                return st.contains("scene") || st.contains("site") || st.contains("return");
            });

            if (!validResponseState) {
                throw new IllegalStateException("Cannot mark incident " + incidentId + " as Resolved: Assigned unit(s) are still En-Route and have not reached On-Scene status.");
            }

            // Reset assigned resources to Available upon resolving the incident
            for (Resource r : assignedResources) {
                r.setStatus("Available");
                r.setAssignedIncidentId(null);
                resourceRepository.save(r);
                mongoSyncService.syncResource(r);
            }
        } else if ("Cancelled".equalsIgnoreCase(status)) {
            List<String> assignedIds = incident.getAssignedResourceIds();
            if (assignedIds != null && !assignedIds.isEmpty()) {
                List<Resource> assignedResources = resourceRepository.findAllById(assignedIds);
                for (Resource r : assignedResources) {
                    r.setStatus("Available");
                    r.setAssignedIncidentId(null);
                    resourceRepository.save(r);
                    mongoSyncService.syncResource(r);
                }
            }
        }

        incident.setStatus(status);
        Incident saved = incidentRepository.save(incident);
        mongoSyncService.syncIncident(saved);
        return saved;
    }

    @Transactional
    public Incident assignResource(String incidentId, String resourceId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));

        // 1. Update Incident
        if (!incident.getAssignedResourceIds().contains(resourceId)) {
            incident.getAssignedResourceIds().add(resourceId);
            if ("Reported".equalsIgnoreCase(incident.getStatus())) {
                incident.setStatus("Assigned");
            }
            incidentRepository.save(incident);
            mongoSyncService.syncIncident(incident);
        }

        // 2. Update Resource
        resource.setStatus("En-Route");
        resource.setAssignedIncidentId(incidentId);
        resourceRepository.save(resource);
        mongoSyncService.syncResource(resource);

        // 3. Record Assignment Audit
        ResourceAssignment assignment = ResourceAssignment.builder()
                .incidentId(incidentId)
                .resourceId(resourceId)
                .status("En-Route")
                .assignedAt(LocalDateTime.now())
                .dispatchedAt(LocalDateTime.now())
                .notes("Dispatched by Emergency Operator via ResQGrid Command Center")
                .build();
        resourceAssignmentRepository.save(assignment);
        mongoSyncService.syncResourceAssignment(assignment);

        return incident;
    }

    @Transactional
    public Incident unassignResource(String incidentId, String resourceId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found: " + resourceId));

        // 1. Remove resource from incident
        if (incident.getAssignedResourceIds() != null) {
            incident.getAssignedResourceIds().remove(resourceId);
        }

        // 2. Reset resource status to Available
        resource.setStatus("Available");
        resource.setAssignedIncidentId(null);
        resourceRepository.save(resource);
        mongoSyncService.syncResource(resource);

        // 3. Revert incident status based on remaining assigned units
        if (incident.getAssignedResourceIds() == null || incident.getAssignedResourceIds().isEmpty()) {
            incident.setStatus("Reported");
        } else {
            List<Resource> remaining = resourceRepository.findAllById(incident.getAssignedResourceIds());
            boolean anyOnScene = remaining.stream().anyMatch(r -> {
                String st = r.getStatus() != null ? r.getStatus().toLowerCase() : "";
                return st.contains("scene") || st.contains("site") || st.contains("return");
            });
            boolean anyEnRoute = remaining.stream().anyMatch(r -> {
                String st = r.getStatus() != null ? r.getStatus().toLowerCase() : "";
                return st.contains("route");
            });

            if (anyOnScene) {
                incident.setStatus("On-Scene");
            } else if (anyEnRoute) {
                incident.setStatus("En-Route");
            } else {
                incident.setStatus("Assigned");
            }
        }

        Incident saved = incidentRepository.save(incident);
        mongoSyncService.syncIncident(saved);
        return saved;
    }

    /**
     * Merge Duplicate Incident into Master Incident
     */
    @Transactional
    public Incident mergeIncidents(String masterId, String duplicateId) {
        Incident master = incidentRepository.findById(masterId)
                .orElseThrow(() -> new RuntimeException("Master Incident not found: " + masterId));
        Incident duplicate = incidentRepository.findById(duplicateId)
                .orElseThrow(() -> new RuntimeException("Duplicate Incident not found: " + duplicateId));

        if (masterId.equals(duplicateId)) {
            throw new IllegalArgumentException("Cannot merge an incident into itself.");
        }

        // 1. Transfer raw reports
        List<com.resqgrid.backend.entity.IncidentReport> duplicateReports = incidentReportRepository.findByIncidentId(duplicateId);
        for (com.resqgrid.backend.entity.IncidentReport r : duplicateReports) {
            r.setIncidentId(masterId);
            r.setText("[MERGED FROM " + duplicateId + "] " + r.getText());
            incidentReportRepository.save(r);
            mongoSyncService.syncIncidentReport(r);
        }

        // 2. Transfer assigned resources
        for (String resId : duplicate.getAssignedResourceIds()) {
            if (!master.getAssignedResourceIds().contains(resId)) {
                master.getAssignedResourceIds().add(resId);
            }
        }

        // 3. Increment duplicate count and bump severity if needed
        master.setDuplicateCount(master.getDuplicateCount() + 1 + duplicate.getDuplicateCount());
        if (master.getDuplicateCount() >= 3 && master.getSeverity() < 5) {
            master.setSeverity(Math.min(5, master.getSeverity() + 1));
        }

        // 4. Mark duplicate incident as merged
        duplicate.setIsMerged(true);
        duplicate.setMergedIntoIncidentId(masterId);
        duplicate.setStatus("Merged");
        incidentRepository.save(duplicate);
        mongoSyncService.syncIncident(duplicate);

        Incident savedMaster = incidentRepository.save(master);
        mongoSyncService.syncIncident(savedMaster);
        return savedMaster;
    }

    /**
     * Split a report out of Master Incident into a standalone new Incident
     */
    @Transactional
    public Incident splitReport(String masterId, String reportId) {
        Incident master = incidentRepository.findById(masterId)
                .orElseThrow(() -> new RuntimeException("Master Incident not found: " + masterId));
        com.resqgrid.backend.entity.IncidentReport report = incidentReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));

        // Create standalone incident from report
        Incident standalone = Incident.builder()
                .title("Split Emergency Report (" + report.getSource() + ")")
                .type(master.getType())
                .description(report.getText())
                .severity(master.getSeverity())
                .status("Reported")
                .locationName(master.getLocationName())
                .lat(master.getLat())
                .lng(master.getLng())
                .reporterRole(report.getSource())
                .aiSummary("Standalone incident split from master incident " + masterId)
                .aiConfidence(0.90)
                .duplicateCount(0)
                .requiredCapabilities(new ArrayList<>(master.getRequiredCapabilities()))
                .reportedAt(LocalDateTime.now())
                .build();

        Incident savedStandalone = createIncident(standalone);

        // Update report to point to new incident ID
        report.setIncidentId(savedStandalone.getId());
        report.setText(report.getText().replace("[CONSOLIDATED DUPLICATE] ", "").replace("[MERGED FROM " + masterId + "] ", ""));
        incidentReportRepository.save(report);
        mongoSyncService.syncIncidentReport(report);

        // Decrement duplicate count on master
        if (master.getDuplicateCount() > 0) {
            master.setDuplicateCount(master.getDuplicateCount() - 1);
            incidentRepository.save(master);
            mongoSyncService.syncIncident(master);
        }

        return savedStandalone;
    }

    public Double getEffectiveLat(Incident inc) {
        if (inc == null) return null;
        if (inc.getLocationName() != null && inc.getLocationName().contains(",")) {
            try {
                String[] parts = inc.getLocationName().split(",");
                if (parts.length == 2) {
                    double lat = Double.parseDouble(parts[0].trim());
                    if (lat >= -90.0 && lat <= 90.0) return lat;
                }
            } catch (Exception ignored) {}
        }
        return inc.getLat();
    }

    public Double getEffectiveLng(Incident inc) {
        if (inc == null) return null;
        if (inc.getLocationName() != null && inc.getLocationName().contains(",")) {
            try {
                String[] parts = inc.getLocationName().split(",");
                if (parts.length == 2) {
                    double lng = Double.parseDouble(parts[1].trim());
                    if (lng >= -180.0 && lng <= 180.0) return lng;
                }
            } catch (Exception ignored) {}
        }
        return inc.getLng();
    }

    private String normalizeCategory(String cat) {
        if (cat == null) return "";
        return cat.trim().toLowerCase().replace("cat_", "").replace("_", "").replace("-", "");
    }

    /**
     * Get potential duplicate clusters for Operator Review Queue
     */
    public List<Map<String, Object>> getDuplicateSuggestions() {
        List<Incident> activeIncidents = incidentRepository.findAllByOrderByReportedAtDesc();
        List<Map<String, Object>> suggestions = new ArrayList<>();

        for (int i = 0; i < activeIncidents.size(); i++) {
            Incident incA = activeIncidents.get(i);
            if (Boolean.TRUE.equals(incA.getIsMerged()) || "Resolved".equalsIgnoreCase(incA.getStatus())) continue;

            String typeA = normalizeCategory(incA.getType());

            for (int j = i + 1; j < activeIncidents.size(); j++) {
                Incident incB = activeIncidents.get(j);
                if (Boolean.TRUE.equals(incB.getIsMerged()) || "Resolved".equalsIgnoreCase(incB.getStatus())) continue;

                String typeB = normalizeCategory(incB.getType());

                // HARD FILTER: Incidents from different emergency categories (e.g., Flood vs Traffic) must NEVER be duplicates
                if (!typeA.isEmpty() && !typeB.isEmpty() && !typeA.equals(typeB)) {
                    continue;
                }

                Double latA = getEffectiveLat(incA);
                Double lngA = getEffectiveLng(incA);
                Double latB = getEffectiveLat(incB);
                Double lngB = getEffectiveLng(incB);

                double distKm = calculateDistance(latA, lngA, latB, lngB);
                if (distKm <= 1.5) { // Within 1.5km proximity
                    Map<String, Object> pair = new HashMap<>();
                    pair.put("incidentA", incA);
                    pair.put("incidentB", incB);

                    double distMeters = Math.round(distKm * 1000.0 * 10.0) / 10.0;
                    double finalDistKm = Math.round(distKm * 1000.0) / 1000.0;
                    pair.put("distanceKm", finalDistKm);
                    pair.put("distanceMeters", distMeters);
                    pair.put("suggestedMasterId", incA.getReportedAt().isBefore(incB.getReportedAt()) ? incA.getId() : incB.getId());

                    // If AI Client is available, query Python microservice for 3-signal scores & precision distance
                    if (aiClientService != null) {
                        try {
                            Map<String, Object> candidate = new HashMap<>();
                            candidate.put("lat", latB);
                            candidate.put("lng", lngB);
                            candidate.put("title", incB.getTitle());
                            candidate.put("text", incB.getDescription());
                            candidate.put("type", incB.getType());

                            Map<String, Object> existingItem = new HashMap<>();
                            existingItem.put("id", incA.getId());
                            existingItem.put("title", incA.getTitle());
                            existingItem.put("text", incA.getDescription());
                            existingItem.put("lat", latA);
                            existingItem.put("lng", lngA);
                            existingItem.put("type", incA.getType());

                            Map<String, Object> reqPayload = new HashMap<>();
                            reqPayload.put("candidate", candidate);
                            reqPayload.put("existingIncidents", Collections.singletonList(existingItem));

                            log.info("[DuplicateSuggestions] Comparing {} and {}. Calculated distance: {} km ({} m)", incA.getId(), incB.getId(), finalDistKm, distMeters);
                            Map<String, Object> dupCheck = aiClientService.checkDuplicates(reqPayload);
                            log.info("[DuplicateSuggestions] Raw AI response from /duplicates/check: {}", dupCheck);

                            if (dupCheck != null) {
                                if (dupCheck.get("bestMatch") != null) {
                                    @SuppressWarnings("unchecked")
                                    Map<String, Object> bestMatch = (Map<String, Object>) dupCheck.get("bestMatch");
                                    if (bestMatch.get("distanceMeters") != null) {
                                        pair.put("distanceMeters", ((Number) bestMatch.get("distanceMeters")).doubleValue());
                                    }
                                    if (bestMatch.get("distanceKm") != null) {
                                        pair.put("distanceKm", ((Number) bestMatch.get("distanceKm")).doubleValue());
                                    }
                                    pair.put("spatialScore", bestMatch.get("spatialScore"));
                                    pair.put("semanticSimilarity", bestMatch.get("semanticSimilarity"));
                                    pair.put("compositeScore", bestMatch.get("compositeScore"));
                                } else {
                                    if (dupCheck.get("distanceMeters") != null) {
                                        pair.put("distanceMeters", ((Number) dupCheck.get("distanceMeters")).doubleValue());
                                    }
                                    if (dupCheck.get("distanceKm") != null) {
                                        pair.put("distanceKm", ((Number) dupCheck.get("distanceKm")).doubleValue());
                                    }
                                }
                            }
                        } catch (Exception e) {
                            log.warn("[DuplicateSuggestions] Error querying AI duplicate service: {}", e.getMessage());
                        }
                    }

                    suggestions.add(pair);
                }
            }
        }
        return suggestions;
    }

    /**
     * 4-Factor Composite Resource Scoring Engine:
     * Score(U) = (W_cap * S_cap) + (W_dist * S_dist) + (W_load * S_load) + (W_hosp * S_hosp)
     */
    public List<Map<String, Object>> getRecommendedResources(String incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));

        List<Resource> allResources = resourceRepository.findAll();

        // Log candidates BEFORE filtering
        List<String> beforeCandidates = allResources.stream()
                .map(r -> r.getId() + " (" + (r.getStatus() != null ? r.getStatus() : "Unknown") + (r.getAssignedIncidentId() != null ? ", assigned to " + r.getAssignedIncidentId() : "") + ")")
                .collect(Collectors.toList());
        log.info("[ResourceQuery] Candidates for incident {}: {}", incidentId, beforeCandidates);

        // Include non-maintenance resources (busy resources show with assigned status)
        List<Resource> availableResources = allResources.stream().filter(res -> {
            String st = res.getStatus() != null ? res.getStatus().trim() : "";
            boolean isMaintenance = "Maintenance".equalsIgnoreCase(st) || "Unavailable".equalsIgnoreCase(st);
            boolean isAssignedToThis = res.getAssignedIncidentId() != null && res.getAssignedIncidentId().equalsIgnoreCase(incidentId);
            return !isMaintenance && !isAssignedToThis;
        }).collect(Collectors.toList());

        List<Map<String, Object>> recommendations = new ArrayList<>();
        List<String> reqCaps = incident.getRequiredCapabilities() != null ? incident.getRequiredCapabilities() : Collections.emptyList();

        Double incLat = getEffectiveLat(incident);
        Double incLng = getEffectiveLng(incident);

        for (Resource res : availableResources) {

            double distanceKm;
            int etaMins;
            boolean isOsrmRouted = false;

            if (osrmService != null) {
                Map<String, Object> route = osrmService.calculateRoute(incLat, incLng, res.getLat(), res.getLng());
                distanceKm = ((Number) route.get("distanceKm")).doubleValue();
                etaMins = ((Number) route.get("durationMins")).intValue();
                isOsrmRouted = Boolean.TRUE.equals(route.get("isOsrmRouted"));
            } else {
                distanceKm = calculateDistance(incLat, incLng, res.getLat(), res.getLng());
                etaMins = Math.max(2, (int) Math.round(distanceKm * 3.5));
            }

            // 1. Capability Score (0.0 to 1.0, normalized sCap 0 to 100)
            long matchedCaps = (res.getCapabilities() != null) ? res.getCapabilities().stream()
                    .filter(c -> c != null && reqCaps.stream().anyMatch(rc -> rc != null && isCapabilityMatch(rc, c)))
                    .count() : 0;
            double capabilityScore = reqCaps.isEmpty() ? 1.0 : Math.min(1.0, (double) matchedCaps / reqCaps.size());
            double sCap = capabilityScore * 100.0;

            // 2. MINIMUM CAPABILITY THRESHOLD: Exclude any resource with capabilityScore < 0.25 (25%)
            if (!reqCaps.isEmpty() && capabilityScore < 0.25) {
                log.info("[ResourceScoring] EXCLUDED Unit {} ('{}') - capabilityScore={}/1.0 (sCap={}%) is below 0.25 threshold",
                        res.getId(), res.getName(), String.format(Locale.US, "%.2f", capabilityScore), Math.round(sCap));
                continue;
            }

            // 3. Distance Score S_dist (0 to 100)
            double sDist = Math.max(0.0, 100.0 - (distanceKm * 5.0));

            // 4. Workload Score S_load (0 to 100)
            int activeLoad = "Available".equalsIgnoreCase(res.getStatus()) ? 0 : 1;
            double sLoad = Math.max(0.0, 100.0 - (activeLoad * 40.0));

            // 5. Category/Hospital Match S_hosp (0 to 100)
            String resType = res.getType() != null ? res.getType().toLowerCase() : "";
            String incType = incident.getType() != null ? incident.getType().toLowerCase() : "";
            double sHosp = (incType.contains("med") || incType.contains("hosp")) && resType.contains("ambul") ? 100.0 :
                           (!incType.isEmpty() && resType.contains(incType)) ? 100.0 : 60.0;

            // Multi-Factor Composite Calculation (W_cap=0.40, W_dist=0.35, W_load=0.15, W_hosp=0.10)
            double capContr = 0.40 * sCap;
            double distContr = 0.35 * sDist;
            double loadContr = 0.15 * sLoad;
            double hospContr = 0.10 * sHosp;

            double compositeScore = capContr + distContr + loadContr + hospContr;

            log.info("[ResourceScoring] QUALIFIED Unit {} ('{}'): capabilityScore={}/1.0 (sCap={}%), sDist={}, sLoad={}, sHosp={}",
                    res.getId(), res.getName(), String.format(Locale.US, "%.2f", capabilityScore), Math.round(sCap), Math.round(sDist), Math.round(sLoad), Math.round(sHosp));
            log.info("[ResourceScoring] Weighted contributions: capContr={} (0.40*{}), distContr={} (0.35*{}), loadContr={} (0.15*{}), hospContr={} (0.10*{}) -> Total Composite Score: {}/100",
                    String.format(Locale.US, "%.2f", capContr), Math.round(sCap),
                    String.format(Locale.US, "%.2f", distContr), Math.round(sDist),
                    String.format(Locale.US, "%.2f", loadContr), Math.round(sLoad),
                    String.format(Locale.US, "%.2f", hospContr), Math.round(sHosp),
                    Math.round(compositeScore));

            Map<String, Object> rec = new HashMap<>();
            rec.put("resource", res);
            rec.put("distanceKm", Math.round(distanceKm * 10.0) / 10.0);
            rec.put("matchScore", Math.min(100.0, Math.round(compositeScore)));
            rec.put("estimatedArrivalMins", etaMins);
            rec.put("isOsrmRouted", isOsrmRouted);

            // Detailed score breakdown for UI transparency
            Map<String, Object> breakdown = new HashMap<>();
            breakdown.put("capabilityScore", Double.parseDouble(String.format(Locale.US, "%.2f", capabilityScore)));
            breakdown.put("capabilityMatchPct", Math.round(sCap));
            breakdown.put("distanceScore", Math.round(sDist));
            breakdown.put("workloadScore", Math.round(sLoad));
            breakdown.put("hospitalAlignment", Math.round(sHosp));
            breakdown.put("capContribution", Double.parseDouble(String.format(Locale.US, "%.2f", capContr)));
            breakdown.put("distContribution", Double.parseDouble(String.format(Locale.US, "%.2f", distContr)));
            breakdown.put("loadContribution", Double.parseDouble(String.format(Locale.US, "%.2f", loadContr)));
            breakdown.put("hospContribution", Double.parseDouble(String.format(Locale.US, "%.2f", hospContr)));
            rec.put("scoreBreakdown", breakdown);

            recommendations.add(rec);
        }

        // Sort highest match score first
        recommendations.sort((a, b) -> Double.compare((Double) b.get("matchScore"), (Double) a.get("matchScore")));
        return recommendations;
    }

    private boolean isCapabilityMatch(String rc, String c) {
        if (rc == null || c == null) return false;
        if (rc.equalsIgnoreCase(c)) return true;
        
        String normRc = rc.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String normC = c.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        if (normRc.equals(normC)) return true;
        
        if (normRc.length() >= 4 && normC.length() >= 4) {
            if (normRc.contains(normC) || normC.contains(normRc)) {
                return true;
            }
        }
        return false;
    }

    public double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 5.0;
        final double R = 6371.0; // Radius of Earth in KM
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2.0) * Math.sin(latDistance / 2.0)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2.0) * Math.sin(lonDistance / 2.0);
        a = Math.min(1.0, Math.max(0.0, a));
        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return R * c;
    }
}
