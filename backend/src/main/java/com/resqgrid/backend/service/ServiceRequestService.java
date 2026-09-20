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
                ? currentUser.getDepartmentCategory()
                : ("CAT_" + (incident.getType() != null ? incident.getType().toUpperCase() : "GENERAL"));

        String formattedTargetDept = targetDepartment != null && targetDepartment.startsWith("CAT_")
                ? targetDepartment
                : ("CAT_" + (targetDepartment != null ? targetDepartment.toUpperCase() : "FIRE"));

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
        String role = currentUser.getRole() != null ? currentUser.getRole().toUpperCase() : "";
        if (role.contains("SUPER_ADMIN") || role.contains("SUPER ADMIN")) {
            return serviceRequestRepository.findAllByOrderByCreatedAtDesc();
        }

        String deptCat = currentUser.getDepartmentCategory();
        if (deptCat == null || deptCat.trim().isEmpty()) {
            return Collections.emptyList();
        }

        String rawCat = deptCat.toUpperCase().replace("CAT_", "");
        List<String> variants = Arrays.asList(deptCat, "CAT_" + rawCat, rawCat);
        return serviceRequestRepository.findByRequestedDepartmentIgnoreCaseInOrderByCreatedAtDesc(variants);
    }

    public List<ServiceRequest> getRequestsForIncident(String incidentId) {
        return serviceRequestRepository.findByIncidentIdOrderByCreatedAtDesc(incidentId);
    }

    public List<ServiceRequest> getAllServiceRequests() {
        return serviceRequestRepository.findAllByOrderByCreatedAtDesc();
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
                    if ("Reported".equalsIgnoreCase(incident.getStatus())) {
                        incident.setStatus("Assigned");
                    }
                    incidentRepository.save(incident);
                    mongoSyncService.syncIncident(incident);
                }
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
        logActivity(req.getIncidentId(), String.format("Service Request ACCEPTED by %s. Assigned Unit: %s",
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
        logActivity(req.getIncidentId(), String.format("Service Request DECLINED by %s. Reason: %s",
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

        // Log Timeline Activity
        logActivity(req.getIncidentId(), String.format("Service Request for %s RESOLVED.", req.getRequestedDepartment()),
                currentUser != null ? currentUser.getUsername() : req.getRequestedDepartment());

        return saved;
    }
}
