package com.resqgrid.backend.repository;

import com.resqgrid.backend.entity.EmergencySubType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencySubTypeRepository extends JpaRepository<EmergencySubType, String> {
    List<EmergencySubType> findByCategoryId(String categoryId);
    Optional<EmergencySubType> findByNameIgnoreCase(String name);
}
