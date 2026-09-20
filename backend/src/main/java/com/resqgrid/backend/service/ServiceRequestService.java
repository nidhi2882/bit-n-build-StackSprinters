package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.*;
import com.resqgrid.backend.repository.*;
import com.resqgrid.backend.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ServiceRequestService {

    private static final Logger log = LoggerFactory.getLogger(ServiceRequestService.class);

    private final ServiceRequestRepository serviceRequestRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentActivityRepository incidentActivityRepository;
    private final ResourceRepository resourceRepository;
    private final AlertRepository alertRepository;
    private final MongoSyncService mongoSyncService;

    @Autowired
    public ServiceRequestService(ServiceRequestRepository serviceRequestRepository,
                                 IncidentRepository incidentRepository,
                                 IncidentActivityRepository incidentActivityRepository,
                                 ResourceRepository resourceRepository,
                                 AlertRepository alertRepository,
                                 MongoSyncService mongoSyncService) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.incidentRepository = incidentRepository;
        this.incidentActivityRepository = incidentActivityRepository;
        this.resourceRepository = resourceRepository;
        this.alertRepository = alertRepository;
        this.mongoSyncService = mongoSyncService;
    }

    public void logActivity(String incidentId, String text, String actor) {
        IncidentActivity activity = IncidentActivity.builder()
                .incidentId(incidentId)
                .activityText(text)
                .actor(actor != null ? actor : "SYSTEM")
                .createdAt(LocalDateTime.now())
                .build();
        incidentActivityRepository.save(activity);
    }

    public List<IncidentActivity> getActivitiesForIncident(String incidentId) {
        return incidentActivityRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId);
    }

    @Transactional
    public ServiceRequest createServiceRequest(String incidentId, String targetDepartment, String reason, String urgency, UserPrincipal currentUser) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new RuntimeException("Incident not found: " + incidentId));

        String byDept = (currentUser != null && currentUser.getDepartmentCategory() != null)
                ? currentUser.getDepartmentCategory().toUpperCase().replace("CAT_", "")
                : (incident.getCategory() != null ? incident.getCategory().toUpperCase() : "FLOOD");

        DepartmentCategory targetCat = DepartmentCategory.fromString(targetDepartment);
        String formattedTargetDept = targetCat != null ? targetCat.name() : (targetDepartment != null ? targetDepartment.toUpperCase().replace("CAT_", "") : "FIRE");

        ServiceRequest request = ServiceRequest.builder()
                .incidentId(incidentId)
                .requestedByDepartment(byDept)
                .requestedDepartment(formattedTargetDept)
                .reason(reason)
                .urgency(urgency != null ? urgency.toUpperCase() : "NORMAL")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ServiceRequest saved = serviceRequestRepository.save(request);

        // Timeline activity log
        logActivity(incidentId, String.format("Cross-Department Service Request created by %s targeting %s (Urgency: %s). Reason: %s",
                byDept, formattedTargetDept, saved.getUrgency(), reason), currentUser != null ? currentUser.getUsername() : byDept);

        // Targeted Alert for requested department
        Alert alert = Alert.builder()
                .id("ALT-SR-" + System.currentTimeMillis())
                .type("SERVICE_REQUEST")
                .title("INCOMING SERVICE REQUEST: " + formattedTargetDept)
                .message(String.format("Incident %s (%s) requests assistance from %s (Urgency %s): %s",
                        incident.getId(), incident.getTitle(), formattedTargetDept, saved.getUrgency(), reason))
                .incidentId(incidentId)
                .targetDepartment(formattedTargetDept)
                .actionRequired("Review and Accept/Decline Aid Request")
                .active(true)
                .time("Just now")
                .createdAt(LocalDateTime.now())
                .build();
        alertRepository.save(alert);
        mongoSyncService.syncAlert(alert);

        return saved;
    }

    public List<ServiceRequest> getIncomingRequests(UserPrincipal currentUser) {
        if (currentUser == null) return Collections.emptyList();
        String role = currentUser.getRole() != null ? currentUser.getRole().toUpperCase().replace(" ", "_") : "";
        if (role.contains("SUPER_ADMIN")) {
            return serviceRequestRepository.findAllByOrderByCreatedAtDesc();
        }

        String deptCat = currentUser.getDepartmentCategory();
        if (deptCat == null || deptCat.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String rawCat = deptCat.toUpperCase().replace("CAT_", "");
        List<ServiceRequest> all = serviceRequestRepository.findAllByOrderByCreatedAtDesc();
        List<ServiceRequest> incoming = new ArrayList<>();
        for (ServiceRequest req : all) {
            String to = req.getRequestedDepartment() != null ? req.getRequestedDepartment().toUpperCase().replace("CAT_", "") : "";
            if (to.equalsIgnoreCase(rawCat)) {
                incoming.add(req);
            }
        }
        return incoming;
    }

    public List<ServiceRequest> getSentRequests(UserPrincipal currentUser) {
        if (currentUser == null) return Collections.emptyList();
        String role = currentUser.getRole() != null ? currentUser.getRole().toUpperCase().replace(" ", "_") : "";
        if (role.contains("SUPER_ADMIN")) {
            return serviceRequestRepository.findAllByOrderByCreatedAtDesc();
        }

        String deptCat = currentUser.getDepartmentCategory();
        if (deptCat == null || deptCat.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String rawCat = deptCat.toUpperCase().replace("CAT_", "");
        List<ServiceRequest> all = serviceRequestRepository.findAllByOrderByCreatedAtDesc();
        List<ServiceRequest> sent = new ArrayList<>();
        for (ServiceRequest req : all) {
            String by = req.getRequestedByDepartment() != null ? req.getRequestedByDepartment().toUpperCase().replace("CAT_", "") : "";
            if (by.equalsIgnoreCase(rawCat)) {
                sent.add(req);
            }
        }
        return sent;
    }

    public List<ServiceRequest> getRequestsForIncident(String incidentId) {
        return serviceRequestRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId);
    }

    public List<ServiceRequest> getAllServiceRequests() {
        return serviceRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<String> getIncidentIdsAccessibleViaAcceptedRequests(String departmentCategory) {
        if (departmentCategory == null || departmentCategory.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String rawCat = departmentCategory.toUpperCase().replace("CAT_", "");
        List<ServiceRequest> all = serviceRequestRepository.findAll();
        List<String> incidentIds = new ArrayList<>();
        for (ServiceRequest req : all) {
            if ("ACCEPTED".equalsIgnoreCase(req.getStatus())) {
                String toDept = req.getRequestedDepartment() != null ? req.getRequestedDepartment().toUpperCase().replace("CAT_", "") : "";
                if (toDept.equalsIgnoreCase(rawCat)) {
                    incidentIds.add(req.getIncidentId());
                }
            }
        }
        return incidentIds;
    }

    @Transactional
    public ServiceRequest acceptServiceRequest(Long requestId, String assignedUnitId, UserPrincipal currentUser) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service Request not found: " + requestId));

        req.setStatus("ACCEPTED");
        req.setAssignedUnitId(assignedUnitId);
        req.setUpdatedAt(LocalDateTime.now());
        ServiceRequest saved = serviceRequestRepository.save(req);

        // Assign unit to incident if unit provided
        if (assignedUnitId != null && !assignedUnitId.trim().isEmpty()) {
            Incident incident = incidentRepository.findById(req.getIncidentId()).orElse(null);
            if (incident != null) {
                if (incident.getAssignedResourceIds() == null) {
                    incident.setAssignedResourceIds(new ArrayList<>());
                }
                if (!incident.getAssignedResourceIds().contains(assignedUnitId)) {
                    incident.getAssignedResourceIds().add(assignedUnitId);
                }
                incident.setAssignedUnitId(assignedUnitId);
                if ("Reported".equalsIgnoreCase(incident.getStatus())) {
                    incident.setStatus("Assigned");
                }
                incidentRepository.save(incident);
                mongoSyncService.syncIncident(incident);
            }

            Resource unit = resourceRepository.findById(assignedUnitId).orElse(null);
            if (unit != null) {
                unit.setStatus("En-Route");
                unit.setAssignedIncidentId(req.getIncidentId());
                resourceRepository.save(unit);
                mongoSyncService.syncResource(unit);
            }
        }

        // Log Timeline Activity
        logActivity(req.getIncidentId(), String.format("Mutual Aid Service Request ACCEPTED by %s. Assigned Unit: %s",
                req.getRequestedDepartment(), assignedUnitId != null ? assignedUnitId : "Pending Unit"),
                currentUser != null ? currentUser.getUsername() : req.getRequestedDepartment());

        // Targeted Alert notifying requesting department
        Alert alert = Alert.builder()
                .id("ALT-SR-ACC-" + System.currentTimeMillis())
                .type("SERVICE_REQUEST_ACCEPTED")
                .title("SERVICE REQUEST ACCEPTED by " + req.getRequestedDepartment())
                .message(String.format("%s accepted the service request for Incident %s. Unit %s dispatched.",
                        req.getRequestedDepartment(), req.getIncidentId(), assignedUnitId != null ? assignedUnitId : "TBD"))
                .incidentId(req.getIncidentId())
                .targetDepartment(req.getRequestedByDepartment())
                .actionRequired("Acknowledge Staged Mutual Aid")
                .active(true)
                .time("Just now")
                .createdAt(LocalDateTime.now())
                .build();
        alertRepository.save(alert);
        mongoSyncService.syncAlert(alert);

        return saved;
    }

    @Transactional
    public ServiceRequest declineServiceRequest(Long requestId, String declineReason, UserPrincipal currentUser) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service Request not found: " + requestId));

        req.setStatus("DECLINED");
        req.setDeclineReason(declineReason);
        req.setUpdatedAt(LocalDateTime.now());
        ServiceRequest saved = serviceRequestRepository.save(req);

        // Log Timeline Activity
        logActivity(req.getIncidentId(), String.format("Mutual Aid Service Request DECLINED by %s. Reason: %s",
                req.getRequestedDepartment(), declineReason != null ? declineReason : "No reason provided"),
                currentUser != null ? currentUser.getUsername() : req.getRequestedDepartment());

        // Targeted Alert notifying requesting department
        Alert alert = Alert.builder()
                .id("ALT-SR-DEC-" + System.currentTimeMillis())
                .type("SERVICE_REQUEST_DECLINED")
                .title("SERVICE REQUEST DECLINED by " + req.getRequestedDepartment())
                .message(String.format("%s declined service request for Incident %s. Reason: %s",
                        req.getRequestedDepartment(), req.getIncidentId(), declineReason != null ? declineReason : "None"))
                .incidentId(req.getIncidentId())
                .targetDepartment(req.getRequestedByDepartment())
                .actionRequired("Re-route Requisition to Alternative Dept")
                .active(true)
                .time("Just now")
                .createdAt(LocalDateTime.now())
                .build();
        alertRepository.save(alert);
        mongoSyncService.syncAlert(alert);

        return saved;
    }

    @Transactional
    public ServiceRequest resolveServiceRequest(Long requestId, UserPrincipal currentUser) {
        ServiceRequest req = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service Request not found: " + requestId));

        req.setStatus("RESOLVED");
        req.setUpdatedAt(LocalDateTime.now());
        ServiceRequest saved = serviceRequestRepository.save(req);

        logActivity(req.getIncidentId(), String.format("Mutual Aid Service Request for %s RESOLVED.", req.getRequestedDepartment()),
                currentUser != null ? currentUser.getUsername() : req.getRequestedDepartment());

        // Deactivate the SERVICE_REQUEST alerts for this incident so the completed
        // request's notification is cleared from department panels.
        for (Alert a : alertRepository.findByIncidentId(req.getIncidentId())) {
            String type = a.getType() != null ? a.getType().toUpperCase() : "";
            if (Boolean.TRUE.equals(a.getActive()) && type.contains("SERVICE_REQUEST")) {
                a.setActive(false);
                alertRepository.save(a);
                mongoSyncService.syncAlert(a);
            }
        }

        return saved;
    }

    @Transactional
    public int autoEscalateCriticalRequests() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(5);
        List<ServiceRequest> pendingCritical = serviceRequestRepository.findByStatusIgnoreCaseAndUrgencyIgnoreCaseAndCreatedAtBefore(
                "PENDING", "CRITICAL", cutoff);

        int count = 0;
        for (ServiceRequest req : pendingCritical) {
            String currentReason = req.getReason() != null ? req.getReason() : "";
            if (!currentReason.contains("[AUTO-ESCALATED TO SUPER_ADMIN]")) {
                req.setReason(currentReason + " [AUTO-ESCALATED TO SUPER_ADMIN: Unacknowledged for > 5 min]");
                req.setUpdatedAt(LocalDateTime.now());
                serviceRequestRepository.save(req);

                logActivity(req.getIncidentId(),
                        String.format("CRITICAL MUTUAL AID TIMEOUT: Service request %d to %s auto-escalated to SUPER_ADMIN.",
                                req.getId(), req.getRequestedDepartment()), "CAD_AUTOMATION");

                Alert alert = Alert.builder()
                        .id("ALT-ESC-" + System.currentTimeMillis() + "-" + req.getId())
                        .type("CRITICAL_ESCALATION")
                        .title("CRITICAL AID AUTO-ESCALATED TO COMMAND")
                        .message(String.format("Service request %d (Incident %s) to %s pending > 5 min. Immediate Super Admin intervention requested.",
                                req.getId(), req.getIncidentId(), req.getRequestedDepartment()))
                        .incidentId(req.getIncidentId())
                        .targetDepartment("SUPER_ADMIN")
                        .actionRequired("Intervene and Override Dispatch")
                        .active(true)
                        .time("Just now")
                        .createdAt(LocalDateTime.now())
                        .build();
                alertRepository.save(alert);
                mongoSyncService.syncAlert(alert);
                count++;
            }
        }
        return count;
    }
}
