package com.resqgrid.backend.controller;

import com.resqgrid.backend.service.SlaEscalationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sla")
public class SlaEscalationController {

    private final SlaEscalationService slaEscalationService;

    public SlaEscalationController(SlaEscalationService slaEscalationService) {
        this.slaEscalationService = slaEscalationService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getSlaStatus() {
        return ResponseEntity.ok(slaEscalationService.getSlaMetrics());
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> triggerEvaluation() {
        return ResponseEntity.ok(slaEscalationService.evaluateSlaRules());
    }
}
