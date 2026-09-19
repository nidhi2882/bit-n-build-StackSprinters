package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.Hospital;
import com.resqgrid.backend.service.HospitalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hospitals")
@RequiredArgsConstructor
public class HospitalController {

    private final HospitalService hospitalService;

    @GetMapping
    public ResponseEntity<List<Hospital>> getAllHospitals() {
        return ResponseEntity.ok(hospitalService.getAllHospitals());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Hospital> getHospitalById(@PathVariable String id) {
        return hospitalService.getHospitalById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/capacity")
    public ResponseEntity<Hospital> updateCapacity(@PathVariable String id, @RequestBody Map<String, Object> payload) {
        Integer traumaOccupied = payload.get("traumaBedsOccupied") != null ? ((Number) payload.get("traumaBedsOccupied")).intValue() : null;
        Integer icuOccupied = payload.get("icuBedsOccupied") != null ? ((Number) payload.get("icuBedsOccupied")).intValue() : null;
        String ambulanceBayStatus = (String) payload.get("ambulanceBayStatus");

        return ResponseEntity.ok(hospitalService.updateCapacity(id, traumaOccupied, icuOccupied, ambulanceBayStatus));
    }
}
