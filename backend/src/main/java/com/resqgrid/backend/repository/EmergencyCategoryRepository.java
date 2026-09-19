package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.EmergencyCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmergencyCategoryRepository extends JpaRepository<EmergencyCategory, String> {
    Optional<EmergencyCategory> findByNameIgnoreCase(String name);
}
