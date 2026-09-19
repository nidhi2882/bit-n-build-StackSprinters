package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Hospital;
import com.resqgrid.backend.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public Optional<Hospital> getHospitalById(String id) {
        return hospitalRepository.findById(id);
    }

    @Transactional
    public Hospital updateCapacity(String hospitalId, Integer traumaOccupied, Integer icuOccupied, String ambulanceBayStatus) {
        Hospital hospital = hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new RuntimeException("Hospital not found: " + hospitalId));

        if (traumaOccupied != null) {
            hospital.setTraumaBedsOccupied(Math.max(0, Math.min(hospital.getTraumaBedsTotal(), traumaOccupied)));
        }
        if (icuOccupied != null) {
            hospital.setIcuBedsOccupied(Math.max(0, Math.min(hospital.getIcuBedsTotal(), icuOccupied)));
        }
        if (ambulanceBayStatus != null && !ambulanceBayStatus.trim().isEmpty()) {
            hospital.setAmbulanceBayStatus(ambulanceBayStatus);
        }

        // Auto-calculate hospital status
        int freeTrauma = hospital.getTraumaBedsTotal() - hospital.getTraumaBedsOccupied();
        int freeIcu = hospital.getIcuBedsTotal() - hospital.getIcuBedsOccupied();

        if (freeTrauma == 0 && freeIcu == 0) {
            hospital.setStatus("Critical");
        } else if (freeTrauma <= 2 || freeIcu <= 1) {
            hospital.setStatus("Near Capacity");
        } else {
            hospital.setStatus("Optimal");
        }

        return hospitalRepository.save(hospital);
    }
}
