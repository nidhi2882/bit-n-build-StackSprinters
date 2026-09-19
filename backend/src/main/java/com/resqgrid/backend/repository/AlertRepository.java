package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, String> {
    List<Alert> findByActiveTrueOrderByCreatedAtDesc();
    List<Alert> findByIncidentId(String incidentId);
    List<Alert> findByTypeIgnoreCase(String type);
}
