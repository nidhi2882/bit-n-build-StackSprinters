package com.resqgrid.backend.dto.request;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

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

    public SensorTelemetryRequest() {
    }

    public SensorTelemetryRequest(String sensorId, String sensorType, String metricName, Double metricValue, Double threshold, String unit, String locationName, Double lat, Double lng, String status) {
        this.sensorId = sensorId;
        this.sensorType = sensorType;
        this.metricName = metricName;
        this.metricValue = metricValue;
        this.threshold = threshold;
        this.unit = unit;
        this.locationName = locationName;
        this.lat = lat;
        this.lng = lng;
        this.status = status;
    }

    public String getSensorId() { return sensorId; }
    public void setSensorId(String sensorId) { this.sensorId = sensorId; }

    public String getSensorType() { return sensorType; }
    public void setSensorType(String sensorType) { this.sensorType = sensorType; }

    public String getMetricName() { return metricName; }
    public void setMetricName(String metricName) { this.metricName = metricName; }

    public Double getMetricValue() { return metricValue; }
    public void setMetricValue(Double metricValue) { this.metricValue = metricValue; }

    public Double getThreshold() { return threshold; }
    public void setThreshold(Double threshold) { this.threshold = threshold; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static SensorTelemetryRequestBuilder builder() {
        return new SensorTelemetryRequestBuilder();
    }

    public static class SensorTelemetryRequestBuilder {
        private String sensorId;
        private String sensorType;
        private String metricName;
        private Double metricValue;
        private Double threshold;
        private String unit;
        private String locationName;
        private Double lat;
        private Double lng;
        private String status;

        public SensorTelemetryRequestBuilder sensorId(String sensorId) { this.sensorId = sensorId; return this; }
        public SensorTelemetryRequestBuilder sensorType(String sensorType) { this.sensorType = sensorType; return this; }
        public SensorTelemetryRequestBuilder metricName(String metricName) { this.metricName = metricName; return this; }
        public SensorTelemetryRequestBuilder metricValue(Double metricValue) { this.metricValue = metricValue; return this; }
        public SensorTelemetryRequestBuilder threshold(Double threshold) { this.threshold = threshold; return this; }
        public SensorTelemetryRequestBuilder unit(String unit) { this.unit = unit; return this; }
        public SensorTelemetryRequestBuilder locationName(String locationName) { this.locationName = locationName; return this; }
        public SensorTelemetryRequestBuilder lat(Double lat) { this.lat = lat; return this; }
        public SensorTelemetryRequestBuilder lng(Double lng) { this.lng = lng; return this; }
        public SensorTelemetryRequestBuilder status(String status) { this.status = status; return this; }

        public SensorTelemetryRequest build() {
            return new SensorTelemetryRequest(sensorId, sensorType, metricName, metricValue, threshold, unit, locationName, lat, lng, status);
        }
    }
}
