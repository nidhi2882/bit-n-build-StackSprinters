package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.IncidentReport;
import com.resqgrid.backend.repository.IncidentReportRepository;
import com.resqgrid.backend.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final IncidentReportRepository incidentReportRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentService incidentService;

    public List<IncidentReport> getAllReports() {
        return incidentReportRepository.findAll();
    }

    public List<IncidentReport> getReportsByIncidentId(String incidentId) {
        return incidentReportRepository.findByIncidentId(incidentId);
    }

    @Transactional
    public IncidentReport createReport(IncidentReport report) {
        if (report.getId() == null || report.getId().trim().isEmpty()) {
            long count = incidentReportRepository.count();
            report.setId(String.format("REP-%03d", count + 1));
        }
        if (report.getCreatedAt() == null) {
            report.setCreatedAt(LocalDateTime.now());
        }
        if (report.getTime() == null) {
            report.setTime("Just now");
        }

        IncidentReport saved = incidentReportRepository.save(report);

        // If an incident ID is linked, increment its duplicate report count
        if (saved.getIncidentId() != null && !saved.getIncidentId().trim().isEmpty()) {
            incidentRepository.findById(saved.getIncidentId()).ifPresent(inc -> {
                inc.setDuplicateCount(inc.getDuplicateCount() == null ? 1 : inc.getDuplicateCount() + 1);
                incidentRepository.save(inc);
            });
        }

        return saved;
    }
}
