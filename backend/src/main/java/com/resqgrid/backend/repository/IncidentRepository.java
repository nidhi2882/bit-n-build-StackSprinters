package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {
    List<Incident> findByReporterEmailOrderByReportedAtDesc(String reporterEmail);
    List<Incident> findByReporterIdOrderByReportedAtDesc(String reporterId);
    List<Incident> findByTypeIgnoreCaseInOrderByReportedAtDesc(List<String> types);
    List<Incident> findByCategoryIgnoreCaseOrderByReportedAtDesc(String category);
    List<Incident> findByPrimaryDepartmentIgnoreCaseOrderByReportedAtDesc(String primaryDepartment);
    List<Incident> findByIdInOrderByReportedAtDesc(List<String> ids);
    List<Incident> findByAssignedResourceIdsContainingOrderByReportedAtDesc(String unitId);
    List<Incident> findAllByOrderByReportedAtDesc();
}
