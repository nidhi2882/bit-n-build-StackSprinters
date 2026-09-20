package com.resqgrid.backend.controller;

import com.resqgrid.backend.service.RealTimeEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
public class RealTimeTelemetryController {

    private final RealTimeEventPublisher eventPublisher;

    public RealTimeTelemetryController(RealTimeEventPublisher eventPublisher) {
        this.eventPublisher = eventPublisher;
    }

    public static class LocationPingRequest {
        private Long unitId;
        private Double latitude;
        private Double longitude;
        private String status;

        public Long getUnitId() { return unitId; }
        public void setUnitId(Long unitId) { this.unitId = unitId; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    @PostMapping("/ping")
    public ResponseEntity<?> pingLocation(@RequestBody LocationPingRequest request) {
        eventPublisher.publishResourceLocation(
                request.getUnitId(),
                request.getLatitude() != null ? request.getLatitude() : 0.0,
                request.getLongitude() != null ? request.getLongitude() : 0.0,
                request.getStatus() != null ? request.getStatus() : "AVAILABLE"
        );
        return ResponseEntity.ok(Map.of("status", "PUBLISHED", "unitId", request.getUnitId() != null ? request.getUnitId() : 0L));
    }
}
