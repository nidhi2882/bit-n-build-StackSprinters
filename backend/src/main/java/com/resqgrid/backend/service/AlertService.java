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

    @Transactional
    public void dismissAlert(String alertId) {
        alertRepository.findById(alertId).ifPresent(alert -> {
            alert.setActive(false);
            Alert saved = alertRepository.save(alert);
            mongoSyncService.syncAlert(saved);
        });
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
