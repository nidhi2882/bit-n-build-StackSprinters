package com.resqgrid.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorTelemetryRequest {
    @NotBlank(message = "Sensor ID is required")
    private String sensorId; // e.g. "NODE-WATER-04"

    @NotBlank(message = "Sensor Type is required")
    private String sensorType; // "WATER_LEVEL", "SMOKE_HEAT", "GAS_PPM", "SEISMIC"

    private String metricName; // "water_depth_meters", "gas_ppm", "temp_celsius"

    @NotNull(message = "Metric value is required")
    private Double metricValue;

    private Double threshold; // Safe limit, e.g. 3.0 meters
    private String unit; // "m", "ppm", "°C"
    private String locationName;
    private Double lat;
    private Double lng;
    private String status; // "NORMAL", "WARNING", "CRITICAL_BREACH"
}
