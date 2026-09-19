package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.Incident;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {
    List<Incident> findByTypeIgnoreCase(String type);
    List<Incident> findByStatusIgnoreCase(String status);
    List<Incident> findBySeverityGreaterThanEqual(Integer severity);
    List<Incident> findAllByOrderByReportedAtDesc();
}
