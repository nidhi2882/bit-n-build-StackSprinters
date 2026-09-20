package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Alert;
import com.resqgrid.backend.repository.AlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AlertService {

    private final AlertRepository alertRepository;
    private final MongoSyncService mongoSyncService;

    public AlertService(AlertRepository alertRepository, MongoSyncService mongoSyncService) {
        this.alertRepository = alertRepository;
        this.mongoSyncService = mongoSyncService;
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByActiveTrueOrderByCreatedAtDesc();
    }

    /**
     * Returns active alerts relevant to the current user.
     * - SUPER_ADMIN / AUTHORITY_ADMIN: all active alerts (full command visibility).
     * - DEPARTMENT_ADMIN: only alerts targeted at their department, plus broadcast
     *   alerts that have no specific target department.
     * - Everyone else: broadcast (untargeted) alerts only.
     * This guarantees every routed request/incident alert reaches the correct admin.
     */
    public List<Alert> getScopedActiveAlerts(com.resqgrid.backend.security.UserPrincipal user) {
        List<Alert> active = alertRepository.findByActiveTrueOrderByCreatedAtDesc();
        if (user == null) {
            return active;
        }

        String role = user.getRole() != null ? user.getRole().toUpperCase().replace(" ", "_") : "";
        if (role.contains("SUPER_ADMIN") || role.contains("AUTHORITY_ADMIN")) {
            return active;
        }

        String deptCategory = user.getDepartmentCategory();
        if (deptCategory == null || deptCategory.trim().isEmpty()) {
            // No department scope -> only untargeted broadcast alerts
            return active.stream()
                    .filter(a -> a.getTargetDepartment() == null || a.getTargetDepartment().trim().isEmpty())
                    .collect(java.util.stream.Collectors.toList());
        }

        com.resqgrid.backend.entity.DepartmentCategory dc = com.resqgrid.backend.entity.DepartmentCategory.fromString(deptCategory);
        final String userCat = dc != null ? dc.name() : deptCategory.toUpperCase().replace("CAT_", "").trim();

        return active.stream()
                .filter(a -> {
                    String target = a.getTargetDepartment();
                    if (target == null || target.trim().isEmpty()) {
                        return true; // broadcast
                    }
                    com.resqgrid.backend.entity.DepartmentCategory targetDc =
                            com.resqgrid.backend.entity.DepartmentCategory.fromString(target);
                    String targetCat = targetDc != null ? targetDc.name() : target.toUpperCase().replace("CAT_", "").trim();
                    return userCat.equalsIgnoreCase(targetCat);
                })
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void dismissAlert(String alertId) {
        alertRepository.findById(alertId).ifPresent(alert -> {
            alert.setActive(false);
            Alert saved = alertRepository.save(alert);
            mongoSyncService.syncAlert(saved);
        });
    }

    /**
     * Deactivates all active alerts tied to an incident. Called when an incident is
     * resolved/cancelled so its notifications are removed from every admin's panel.
     */
    @Transactional
    public int dismissAlertsForIncident(String incidentId) {
        if (incidentId == null || incidentId.trim().isEmpty()) {
            return 0;
        }
        List<Alert> alerts = alertRepository.findByIncidentId(incidentId);
        int count = 0;
        for (Alert alert : alerts) {
            if (Boolean.TRUE.equals(alert.getActive())) {
                alert.setActive(false);
                Alert saved = alertRepository.save(alert);
                mongoSyncService.syncAlert(saved);
                count++;
            }
        }
        return count;
    }

    @Transactional
    public Alert createAlert(Alert alert) {
        if (alert.getId() == null) {
            alert.setId("ALT-" + System.currentTimeMillis());
        }
        alert.setActive(true);
        Alert saved = alertRepository.save(alert);
        mongoSyncService.syncAlert(saved);
        return saved;
    }
}
