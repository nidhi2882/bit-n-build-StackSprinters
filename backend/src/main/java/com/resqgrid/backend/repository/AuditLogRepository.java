package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByTimestampDesc();
    List<AuditLog> findByDepartmentCategoryOrderByTimestampDesc(String departmentCategory);
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
}
