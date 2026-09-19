package com.resqgrid.backend.dto.request;

import javax.validation.constraints.NotNull;

public class SosAlertRequest {
    @NotNull(message = "Latitude is required for SOS panic alert")
    private Double lat;

    @NotNull(message = "Longitude is required for SOS panic alert")
    private Double lng;

    private String locationName;
    private String reporterPhone;
    private String reporterName;
    private String emergencyType; // e.g. "SOS Panic", "Trapped", "Medical"
    private String notes;

    public SosAlertRequest() {
    }

    public SosAlertRequest(Double lat, Double lng, String locationName, String reporterPhone, String reporterName, String emergencyType, String notes) {
        this.lat = lat;
        this.lng = lng;
        this.locationName = locationName;
        this.reporterPhone = reporterPhone;
        this.reporterName = reporterName;
        this.emergencyType = emergencyType;
        this.notes = notes;
    }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getReporterPhone() { return reporterPhone; }
    public void setReporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getEmergencyType() { return emergencyType; }
    public void setEmergencyType(String emergencyType) { this.emergencyType = emergencyType; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public static SosAlertRequestBuilder builder() {
        return new SosAlertRequestBuilder();
    }

    public static class SosAlertRequestBuilder {
        private Double lat;
        private Double lng;
        private String locationName;
        private String reporterPhone;
        private String reporterName;
        private String emergencyType;
        private String notes;

        public SosAlertRequestBuilder lat(Double lat) { this.lat = lat; return this; }
        public SosAlertRequestBuilder lng(Double lng) { this.lng = lng; return this; }
        public SosAlertRequestBuilder locationName(String locationName) { this.locationName = locationName; return this; }
        public SosAlertRequestBuilder reporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; return this; }
        public SosAlertRequestBuilder reporterName(String reporterName) { this.reporterName = reporterName; return this; }
        public SosAlertRequestBuilder emergencyType(String emergencyType) { this.emergencyType = emergencyType; return this; }
        public SosAlertRequestBuilder notes(String notes) { this.notes = notes; return this; }

        public SosAlertRequest build() {
            return new SosAlertRequest(lat, lng, locationName, reporterPhone, reporterName, emergencyType, notes);
        }
    }
}
