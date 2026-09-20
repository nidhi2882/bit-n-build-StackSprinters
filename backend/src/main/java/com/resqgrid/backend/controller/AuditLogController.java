package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.AuditLog;
import com.resqgrid.backend.security.UserPrincipal;
import com.resqgrid.backend.service.AuditLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-log")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String action,
            @AuthenticationPrincipal UserPrincipal principal) {
        
        if (principal != null && !"SUPER_ADMIN".equalsIgnoreCase(principal.getRole()) && !"Super Admin".equalsIgnoreCase(principal.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Super Admin access required for CAD Operational Audit Log.");
        }

        if (department != null && !department.trim().isEmpty()) {
            return ResponseEntity.ok(auditLogService.getLogsByDepartment(department.trim().toUpperCase()));
        }
        if (action != null && !action.trim().isEmpty()) {
            return ResponseEntity.ok(auditLogService.getLogsByAction(action.trim().toUpperCase()));
        }
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }
}
