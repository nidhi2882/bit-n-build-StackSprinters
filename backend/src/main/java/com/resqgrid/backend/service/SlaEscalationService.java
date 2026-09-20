package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.repository.IncidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
@EnableScheduling
public class SlaEscalationService {

    private static final Logger log = LoggerFactory.getLogger(SlaEscalationService.class);

    private final IncidentRepository incidentRepository;
    private final RealTimeEventPublisher eventPublisher;
    private final AuditLogService auditLogService;

    // Track escalated incident IDs to prevent repeated duplicate breach alerts
    private final Set<String> escalatedLevel5Incidents = Collections.synchronizedSet(new HashSet<>());
    private final Set<String> escalatedLevel4Incidents = Collections.synchronizedSet(new HashSet<>());

    public SlaEscalationService(IncidentRepository incidentRepository,
                                RealTimeEventPublisher eventPublisher,
                                AuditLogService auditLogService) {
        this.incidentRepository = incidentRepository;
        this.eventPublisher = eventPublisher;
        this.auditLogService = auditLogService;
    }

    /**
     * Scheduled SLA Evaluation Worker:
     * - Level 5 Critical unassigned > 5 mins -> SLA Breach alert, escalate to Authority Director
     * - Level 4 High unassigned > 15 mins -> Warning alert to Department Admin
     */
    @Scheduled(fixedDelay = 60000)
    public Map<String, Object> evaluateSlaRules() {
        LocalDateTime now = LocalDateTime.now();
        List<Incident> activeIncidents = incidentRepository.findAllByOrderByReportedAtDesc();
        int breachesTriggered = 0;
        int warningsTriggered = 0;

        for (Incident inc : activeIncidents) {
            if (inc.getId() == null) continue;

            // Only evaluate unassigned / reported incidents
            if (inc.getStatus() != null && !inc.getStatus().equalsIgnoreCase("Reported") && !inc.getStatus().equalsIgnoreCase("Open")) {
                continue;
            }

            if (inc.getReportedAt() == null) continue;
            long minutesElapsed = Duration.between(inc.getReportedAt(), now).toMinutes();

            // Rule 1: Level 5 Critical SLA (5 Minutes Threshold)
            if (inc.getSeverity() != null && inc.getSeverity() >= 5) {
                if (minutesElapsed >= 5 && !escalatedLevel5Incidents.contains(inc.getId())) {
                    escalatedLevel5Incidents.add(inc.getId());
                    breachesTriggered++;

                    String alertMsg = String.format("SLA BREACH: Level-5 incident %s (%s) unassigned for %d minutes! Auto-escalated to Authority Admin Director.",
                            inc.getId(), inc.getTitle() != null ? inc.getTitle() : "Critical Emergency", minutesElapsed);

                    log.warn(alertMsg);
                    eventPublisher.publishAlertEscalated(alertMsg, inc.getId(), "CRITICAL_BREACH");
                    auditLogService.log("SLA_BREACH_ESCALATION", "Incident", inc.getId(), "SYSTEM_SLA_WORKER", "SYSTEM", "SLA Engine", inc.getCategory(), alertMsg, "127.0.0.1");
                }
            }
            // Rule 2: Level 4 High SLA (15 Minutes Threshold)
            else if (inc.getSeverity() != null && inc.getSeverity() == 4) {
                if (minutesElapsed >= 15 && !escalatedLevel4Incidents.contains(inc.getId())) {
                    escalatedLevel4Incidents.add(inc.getId());
                    warningsTriggered++;

                    String alertMsg = String.format("SLA WARNING: Level-4 incident %s (%s) pending unit assignment for %d minutes.",
                            inc.getId(), inc.getTitle() != null ? inc.getTitle() : "High Priority", minutesElapsed);

                    log.warn(alertMsg);
                    eventPublisher.publishAlertEscalated(alertMsg, inc.getId(), "WARNING");
                    auditLogService.log("SLA_WARNING_ESCALATION", "Incident", inc.getId(), "SYSTEM_SLA_WORKER", "SYSTEM", "SLA Engine", inc.getCategory(), alertMsg, "127.0.0.1");
                }
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("evaluatedAt", now.toString());
        summary.put("breachesTriggered", breachesTriggered);
        summary.put("warningsTriggered", warningsTriggered);
        summary.put("totalEscalatedL5", escalatedLevel5Incidents.size());
        summary.put("totalEscalatedL4", escalatedLevel4Incidents.size());
        return summary;
    }

    public Map<String, Object> getSlaMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("l5ThresholdMinutes", 5);
        metrics.put("l4ThresholdMinutes", 15);
        metrics.put("escalatedL5IncidentIds", new ArrayList<>(escalatedLevel5Incidents));
        metrics.put("escalatedL4IncidentIds", new ArrayList<>(escalatedLevel4Incidents));
        metrics.put("status", "ACTIVE_MONITORING");
        return metrics;
    }
}
