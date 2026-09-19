package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.ResourceAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ResourceAssignmentRepository extends JpaRepository<ResourceAssignment, Long> {
    List<ResourceAssignment> findByIncidentId(String incidentId);
    List<ResourceAssignment> findByResourceId(String resourceId);
    List<ResourceAssignment> findByStatus(String status);
}
