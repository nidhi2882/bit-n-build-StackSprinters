package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Alert;
import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.ServiceRequest;
import com.resqgrid.backend.repository.AlertRepository;
import com.resqgrid.backend.repository.ServiceRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class DepartmentRoutingService {

    private static final Logger logger = LoggerFactory.getLogger(DepartmentRoutingService.class);

    private final ServiceRequestRepository serviceRequestRepository;
    private final AlertRepository alertRepository;
    private final MongoSyncService mongoSyncService;

    public DepartmentRoutingService(
            ServiceRequestRepository serviceRequestRepository,
            AlertRepository alertRepository,
            MongoSyncService mongoSyncService) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.alertRepository = alertRepository;
        this.mongoSyncService = mongoSyncService;
    }

    public static class RoutingDecision {
        public String primaryCategory;
        public String primaryDepartment;
        public List<String> supportingDepartments = new ArrayList<>();
        public List<SupportRequestInfo> secondaryRequests = new ArrayList<>();
        public List<String> requiredResources = new ArrayList<>();
        public int slaMinutes = 10;
        public int suggestedSeverity = 3;
    }

    public static class SupportRequestInfo {
        public String department;
        public String reason;
        public String urgency;
        public String requestedResources;

        public SupportRequestInfo(String department, String reason, String urgency, String requestedResources) {
            this.department = department;
            this.reason = reason;
            this.urgency = urgency;
            this.requestedResources = requestedResources;
        }
    }

    /**
     * Analyzes incident taxonomy, description text, and severity to resolve routing and generate mutual aid tasks.
     */
    public RoutingDecision routeIncident(Incident incident) {
        RoutingDecision decision = new RoutingDecision();
        String desc = incident.getDescription() != null ? incident.getDescription().toLowerCase() : "";
        String title = incident.getTitle() != null ? incident.getTitle().toLowerCase() : "";
        String text = title + " " + desc;

        String rawCat = incident.getCategory() != null ? incident.getCategory().toUpperCase() : "";
        if (rawCat.isEmpty() && incident.getType() != null) {
            rawCat = incident.getType().toUpperCase();
        }

        // 1. Primary Department Classification
        if (rawCat.contains("FIRE")) {
            decision.primaryCategory = "FIRE";
            decision.primaryDepartment = "FIRE_RESCUE";
            decision.requiredResources.addAll(Arrays.asList("FIRE_ENGINE", "FOAM_TENDER", "LADDER_TRUCK"));
            decision.slaMinutes = 8;
        } else if (rawCat.contains("MED") || rawCat.contains("HEALTH")) {
            decision.primaryCategory = "MEDICAL";
            decision.primaryDepartment = "MEDICAL_EMS";
            decision.requiredResources.addAll(Arrays.asList("ALS_AMBULANCE", "TRAUMA_TEAM", "ICU_BED"));
            decision.slaMinutes = 7;
        } else if (rawCat.contains("CRASH") || rawCat.contains("TRAFFIC") || rawCat.contains("ACCIDENT")) {
            decision.primaryCategory = "CRASH";
            decision.primaryDepartment = "POLICE";
            decision.requiredResources.addAll(Arrays.asList("PATROL_UNIT", "HYDRAULIC_CUTTER", "HEAVY_TOW"));
            decision.slaMinutes = 10;
        } else if (rawCat.contains("HAZMAT") || rawCat.contains("CHEMICAL") || rawCat.contains("GAS")) {
            decision.primaryCategory = "HAZMAT";
            decision.primaryDepartment = "HAZMAT";
            decision.requiredResources.addAll(Arrays.asList("LEVEL_A_SUIT", "GAS_DETECTOR", "DECON_RIG"));
            decision.slaMinutes = 12;
        } else if (rawCat.contains("COLLAPSE") || rawCat.contains("STRUCTURAL")) {
            decision.primaryCategory = "COLLAPSE";
            decision.primaryDepartment = "USAR";
            decision.requiredResources.addAll(Arrays.asList("USAR_K9", "CONCRETE_CUTTER", "HEAVY_CRANE"));
            decision.slaMinutes = 10;
        } else if (rawCat.contains("CYCLONE") || rawCat.contains("STORM")) {
            decision.primaryCategory = "CYCLONE";
            decision.primaryDepartment = "DISASTER_RESPONSE";
            decision.requiredResources.addAll(Arrays.asList("GENSET", "TREE_CLEARER", "RESCUE_BOAT"));
            decision.slaMinutes = 15;
        } else if (rawCat.contains("SEARCH") || rawCat.contains("SAR") || rawCat.contains("RESCUE")) {
            decision.primaryCategory = "SEARCH_RESCUE";
            decision.primaryDepartment = "SEARCH_RESCUE";
            decision.requiredResources.addAll(Arrays.asList("THERMAL_DRONE", "K9_TRACKER", "4X4_OFFROAD"));
            decision.slaMinutes = 12;
        } else if (rawCat.contains("POLICE") || rawCat.contains("SECURITY") || rawCat.contains("LAW")) {
            decision.primaryCategory = "POLICE";
            decision.primaryDepartment = "POLICE";
            decision.requiredResources.addAll(Arrays.asList("TACTICAL_SQUAD", "PATROL_CAR", "CROWD_BARRICADE"));
            decision.slaMinutes = 8;
        } else if (rawCat.contains("PUBLIC_WORKS") || rawCat.contains("INFRASTRUCTURE")) {
            decision.primaryCategory = "PUBLIC_WORKS";
            decision.primaryDepartment = "PUBLIC_WORKS";
            decision.requiredResources.addAll(Arrays.asList("BACKHOE", "DEBRIS_TRUCK", "SANDBAG_CREW"));
            decision.slaMinutes = 20;
        } else {
            // Default to FLOOD / DISASTER_RESPONSE
            decision.primaryCategory = "FLOOD";
            decision.primaryDepartment = "DISASTER_RESPONSE";
            decision.requiredResources.addAll(Arrays.asList("RESCUE_BOAT", "LIFE_JACKET", "WATER_PUMP"));
            decision.slaMinutes = 10;
        }

        // Adjust SLA for critical severity
        if (incident.getSeverity() != null && incident.getSeverity() >= 5) {
            decision.slaMinutes = Math.min(decision.slaMinutes, 5);
        } else if (incident.getSeverity() != null && incident.getSeverity() == 4) {
            decision.slaMinutes = Math.min(decision.slaMinutes, 10);
        }

        // 2. Smart Secondary / Supporting Department Detection
        String urgency = (incident.getSeverity() != null && incident.getSeverity() >= 4) ? "CRITICAL" : "HIGH";

        // Check for Medical Support requirement
        boolean hasMedicalSignal = text.contains("injur") || text.contains("casualt") || text.contains("unconscious")
                || text.contains("bleed") || text.contains("burn") || text.contains("patient") || text.contains("cardiac") || text.contains("trauma");
        if (hasMedicalSignal && !"MEDICAL_EMS".equals(decision.primaryDepartment)) {
            decision.supportingDepartments.add("MEDICAL_EMS");
            decision.secondaryRequests.add(new SupportRequestInfo(
                    "MEDICAL_EMS",
                    "Detected civilian casualty or trauma indicators in incident report",
                    urgency,
                    "AMBULANCE, TRAUMA_TEAM"
            ));
            if (!decision.requiredResources.contains("AMBULANCE")) {
                decision.requiredResources.add("AMBULANCE");
            }
        }

        // Check for Fire / Technical Extrication requirement
        boolean hasRescueSignal = text.contains("trapped") || text.contains("roof") || text.contains("second floor")
                || text.contains("flame") || text.contains("smoke") || text.contains("pinned") || text.contains("extricat");
        if (hasRescueSignal && !"FIRE_RESCUE".equals(decision.primaryDepartment) && !"USAR".equals(decision.primaryDepartment)) {
            decision.supportingDepartments.add("FIRE_RESCUE");
            decision.secondaryRequests.add(new SupportRequestInfo(
                    "FIRE_RESCUE",
                    "Detected trapped civilians or technical extrication requirement",
                    "CRITICAL",
                    "RESCUE_TEAM, HYDRAULIC_CUTTERS"
            ));
            if (!decision.requiredResources.contains("RESCUE_TEAM")) {
                decision.requiredResources.add("RESCUE_TEAM");
            }
        }

        // Check for Police / Perimeter / Evacuation requirement
        boolean hasPoliceSignal = text.contains("crowd") || text.contains("traffic") || text.contains("road block")
                || text.contains("perimeter") || text.contains("evacuat") || text.contains("panic") || text.contains("divert");
        if (hasPoliceSignal && !"POLICE".equals(decision.primaryDepartment)) {
            decision.supportingDepartments.add("POLICE");
            decision.secondaryRequests.add(new SupportRequestInfo(
                    "POLICE",
                    "Evacuation zone perimeter, crowd management or road diversion required",
                    urgency,
                    "PATROL_UNIT, TRAFFIC_CONTROL"
            ));
            if (!decision.requiredResources.contains("PATROL_UNIT")) {
                decision.requiredResources.add("PATROL_UNIT");
            }
        }

        // Check for Hazmat requirement
        boolean hasHazmatSignal = text.contains("chemical") || text.contains("toxic") || text.contains("gas leak")
                || text.contains("fumes") || text.contains("ammonia") || text.contains("storage") || text.contains("acid");
        if (hasHazmatSignal && !"HAZMAT".equals(decision.primaryDepartment)) {
            decision.supportingDepartments.add("HAZMAT");
            decision.secondaryRequests.add(new SupportRequestInfo(
                    "HAZMAT",
                    "Potential industrial chemical or toxic vapor hazard detected",
                    "CRITICAL",
                    "HAZMAT_UNIT, LEVEL_A_SUIT"
            ));
            if (!decision.requiredResources.contains("HAZMAT_UNIT")) {
                decision.requiredResources.add("HAZMAT_UNIT");
            }
        }

        // Flood baseline routing: Ensure Fire, Medical & Police are connected if flooding is severe
        if ("DISASTER_RESPONSE".equals(decision.primaryDepartment) && "FLOOD".equals(decision.primaryCategory)) {
            if (!decision.supportingDepartments.contains("FIRE_RESCUE")) {
                decision.supportingDepartments.add("FIRE_RESCUE");
                decision.secondaryRequests.add(new SupportRequestInfo(
                        "FIRE_RESCUE",
                        "NDRF Water Rescue & Fire Extrication Coordination",
                        urgency,
                        "RESCUE_BOAT, LIFE_JACKET"
                ));
            }
            if (!decision.supportingDepartments.contains("POLICE")) {
                decision.supportingDepartments.add("POLICE");
                decision.secondaryRequests.add(new SupportRequestInfo(
                        "POLICE",
                        "Flooded sector perimeter cordoning & road diversion",
                        "HIGH",
                        "TRAFFIC_CONTROL, PATROL_UNIT"
                ));
            }
        }

        return decision;
    }

    /**
     * Applies routing decisions to the incident and persists linked ServiceRequests & Alerts for supporting departments.
     */
    public void applyRoutingAndGenerateSupportRequests(Incident incident) {
        RoutingDecision decision = routeIncident(incident);

        // Set incident operational metadata
        if (incident.getOriginalType() == null || incident.getOriginalType().isEmpty()) {
            incident.setOriginalType(incident.getType());
        }
        incident.setCategory(decision.primaryCategory);
        incident.setPrimaryDepartment(decision.primaryDepartment);
        incident.setAssignedDepartments(new ArrayList<>(decision.supportingDepartments));
        incident.setRequiredResources(new ArrayList<>(decision.requiredResources));
        incident.setSlaMinutes(decision.slaMinutes);
        if (incident.getSlaDeadline() == null) {
            incident.setSlaDeadline(LocalDateTime.now().plusMinutes(decision.slaMinutes));
        }

        StringBuilder aiRec = new StringBuilder();
        aiRec.append(String.format("Primary Command: %s (%s) • SLA: %dm.\n", decision.primaryDepartment, decision.primaryCategory, decision.slaMinutes));
        if (!decision.supportingDepartments.isEmpty()) {
            aiRec.append(String.format("Auto-Routed Supporting Agencies: %s.\n", String.join(", ", decision.supportingDepartments)));
        }
        aiRec.append(String.format("Suggested Capabilities: %s.", String.join(", ", decision.requiredResources)));
        incident.setAiRecommendations(aiRec.toString());

        // Create linked ServiceRequests for supporting departments
        for (SupportRequestInfo reqInfo : decision.secondaryRequests) {
            try {
                ServiceRequest sr = ServiceRequest.builder()
                        .incidentId(incident.getId())
                        .requestedByDepartment(decision.primaryDepartment)
                        .requestedDepartment(reqInfo.department)
                        .reason(reqInfo.reason)
                        .urgency(reqInfo.urgency)
                        .status("PENDING")
                        .requestedResources(reqInfo.requestedResources)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                ServiceRequest savedReq = serviceRequestRepository.save(sr);
                if (mongoSyncService != null) {
                    mongoSyncService.syncServiceRequest(savedReq);
                }

                // Create targeted alert for the supporting department
                Alert supportAlert = Alert.builder()
                        .id("ALT-SR-" + System.currentTimeMillis() + "-" + Math.abs(reqInfo.department.hashCode() % 1000))
                        .type("SERVICE_REQUEST")
                        .title("MUTUAL AID TASK: " + reqInfo.department)
                        .message(String.format("Incident %s (%s) requests %s assistance: %s",
                                incident.getId(), incident.getTitle(), reqInfo.department, reqInfo.reason))
                        .incidentId(incident.getId())
                        .targetDepartment(reqInfo.department)
                        .actionRequired("Acknowledge & Assign " + reqInfo.department + " Unit")
                        .active(true)
                        .time("Just now")
                        .createdAt(LocalDateTime.now())
                        .build();

                alertRepository.save(supportAlert);
                if (mongoSyncService != null) {
                    mongoSyncService.syncAlert(supportAlert);
                }

                logger.info("Auto-generated ServiceRequest REQ-{} for department {} on incident {}",
                        savedReq.getId(), reqInfo.department, incident.getId());
            } catch (Exception e) {
                logger.error("Failed to create auto ServiceRequest for {}: {}", reqInfo.department, e.getMessage());
            }
        }
    }
}
