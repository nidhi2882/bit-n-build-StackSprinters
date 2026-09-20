package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {

    List<ServiceRequest> findByRequestedDepartmentIgnoreCaseInOrderByCreatedAtDesc(List<String> requestedDepartments);

    List<ServiceRequest> findByIncidentIdOrderByCreatedAtDesc(String incidentId);

    List<ServiceRequest> findByStatusAndUrgencyAndCreatedAtBefore(String status, String urgency, LocalDateTime timeThreshold);

    List<ServiceRequest> findByRequestedDepartmentIgnoreCaseInAndStatus(List<String> requestedDepartments, String status);

    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
}
