package com.resqgrid.backend.scheduler;

import com.resqgrid.backend.entity.Alert;
import com.resqgrid.backend.entity.ServiceRequest;
import com.resqgrid.backend.repository.AlertRepository;
import com.resqgrid.backend.repository.ServiceRequestRepository;
import com.resqgrid.backend.service.MongoSyncService;
import com.resqgrid.backend.service.ServiceRequestService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ServiceRequestEscalationScheduler {

    private static final Logger log = LoggerFactory.getLogger(ServiceRequestEscalationScheduler.class);

    private final ServiceRequestRepository serviceRequestRepository;
    private final AlertRepository alertRepository;
    private final ServiceRequestService serviceRequestService;
    private final MongoSyncService mongoSyncService;

    @Autowired
    public ServiceRequestEscalationScheduler(ServiceRequestRepository serviceRequestRepository,
                                             AlertRepository alertRepository,
                                             ServiceRequestService serviceRequestService,
                                             MongoSyncService mongoSyncService) {
        this.serviceRequestRepository = serviceRequestRepository;
        this.alertRepository = alertRepository;
        this.serviceRequestService = serviceRequestService;
        this.mongoSyncService = mongoSyncService;
    }

    @Scheduled(fixedRate = 60000)
    public void checkForStaleCriticalRequests() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        List<ServiceRequest> staleRequests = serviceRequestRepository
                .findByStatusAndUrgencyAndCreatedAtBefore("PENDING", "CRITICAL", fiveMinutesAgo);

        if (!staleRequests.isEmpty()) {
            log.warn("[AUTO-ESCALATION] Found {} CRITICAL Service Requests pending > 5 minutes!", staleRequests.size());

            for (ServiceRequest req : staleRequests) {
                String alertId = "ALT-ESC-SR-" + req.getId();
                if (!alertRepository.existsById(alertId)) {
                    log.info("[AUTO-ESCALATION] Escalating stale CRITICAL Service Request #{} for Incident {} to SUPER_ADMIN",
                            req.getId(), req.getIncidentId());

                    Alert criticalAlert = Alert.builder()
                            .id(alertId)
                            .type("CRITICAL_ESCALATION")
                            .title("CRITICAL SERVICE REQUEST STALE: " + req.getRequestedByDepartment() + " -> " + req.getRequestedDepartment())
                            .message(String.format("Critical Service Request #%d for Incident %s has remained PENDING for > 5 mins. Immediate Super Admin intervention required.",
                                    req.getId(), req.getIncidentId()))
                            .incidentId(req.getIncidentId())
                            .actionRequired("Super Admin Intervention / Manual Dispatch Override")
                            .targetDepartment("SUPER_ADMIN")
                            .active(true)
                            .time("5m+ Pending")
                            .createdAt(LocalDateTime.now())
                            .build();

                    alertRepository.save(criticalAlert);
                    mongoSyncService.syncAlert(criticalAlert);

                    // Log activity timeline entry
                    serviceRequestService.logActivity(req.getIncidentId(),
                            String.format("AUTOMATED ESCALATION: Critical Service Request #%d pending > 5m escalated to SUPER_ADMIN.", req.getId()),
                            "SYSTEM_SCHEDULER");
                }
            }
        }
    }
}
