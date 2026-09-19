package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.IncidentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IncidentReportRepository extends JpaRepository<IncidentReport, String> {
    List<IncidentReport> findByIncidentId(String incidentId);
}
