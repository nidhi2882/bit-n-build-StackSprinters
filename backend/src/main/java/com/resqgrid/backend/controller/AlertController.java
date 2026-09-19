package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.Alert;
import com.resqgrid.backend.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    @PostMapping
    public ResponseEntity<Alert> createAlert(@RequestBody Alert alert) {
        return ResponseEntity.ok(alertService.createAlert(alert));
    }

    @PostMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismissAlert(@PathVariable String id) {
        alertService.dismissAlert(id);
        return ResponseEntity.ok().build();
    }
}
