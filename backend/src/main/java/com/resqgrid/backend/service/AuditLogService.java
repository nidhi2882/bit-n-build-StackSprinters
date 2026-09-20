package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.AuditLog;
import com.resqgrid.backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public AuditLog log(String action, String entityType, String entityId, String actorId, String actorRole, String actorName, String departmentCategory, String details, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .actorId(actorId)
                .actorRole(actorRole)
                .actorName(actorName)
                .departmentCategory(departmentCategory)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                .timestamp(LocalDateTime.now())
                .build();
        return auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    public List<AuditLog> getLogsByDepartment(String departmentCategory) {
        return auditLogRepository.findByDepartmentCategoryOrderByTimestampDesc(departmentCategory);
    }

    public List<AuditLog> getLogsByAction(String action) {
        return auditLogRepository.findByActionOrderByTimestampDesc(action);
    }
}
