package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, String> {
    List<Resource> findByStatusIgnoreCase(String status);
    List<Resource> findByTypeIgnoreCase(String type);
    List<Resource> findByDepartmentCategoryIgnoreCase(String departmentCategory);
    List<Resource> findByDepartmentCategoryIgnoreCaseAndStatusIgnoreCase(String departmentCategory, String status);
    List<Resource> findByAssignedIncidentId(String incidentId);
}
