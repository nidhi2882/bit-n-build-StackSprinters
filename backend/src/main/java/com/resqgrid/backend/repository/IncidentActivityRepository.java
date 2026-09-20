package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.IncidentActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentActivityRepository extends JpaRepository<IncidentActivity, Long> {

    List<IncidentActivity> findByIncidentIdOrderByCreatedAtDesc(String incidentId);
}
