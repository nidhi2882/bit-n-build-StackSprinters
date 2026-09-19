package com.resqgrid.backend.dto.request;

import javax.validation.constraints.NotBlank;
import java.util.List;

public class CallCenterReportRequest {
    private String callerName;
    private String callerPhone;

    @NotBlank(message = "Title is required")
    private String title;

    private String type; // Category e.g. "CAT_FIRE", "Fire"
    private String subTypeId; // "SUB_FR_STRUCT"
    private String description;
    private String locationName;
    private Double lat;
    private Double lng;
    private Integer severity; // 1-5
    private List<String> requiredCapabilities;
    private String priorityCode; // P1 - P5
    private String notes;

    public CallCenterReportRequest() {
    }

    public CallCenterReportRequest(String callerName, String callerPhone, String title, String type, String subTypeId, String description, String locationName, Double lat, Double lng, Integer severity, List<String> requiredCapabilities, String priorityCode, String notes) {
        this.callerName = callerName;
        this.callerPhone = callerPhone;
        this.title = title;
        this.type = type;
        this.subTypeId = subTypeId;
        this.description = description;
        this.locationName = locationName;
        this.lat = lat;
        this.lng = lng;
        this.severity = severity;
        this.requiredCapabilities = requiredCapabilities;
        this.priorityCode = priorityCode;
        this.notes = notes;
    }

    public String getCallerName() { return callerName; }
    public void setCallerName(String callerName) { this.callerName = callerName; }

    public String getCallerPhone() { return callerPhone; }
    public void setCallerPhone(String callerPhone) { this.callerPhone = callerPhone; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSubTypeId() { return subTypeId; }
    public void setSubTypeId(String subTypeId) { this.subTypeId = subTypeId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public Integer getSeverity() { return severity; }
    public void setSeverity(Integer severity) { this.severity = severity; }

    public List<String> getRequiredCapabilities() { return requiredCapabilities; }
    public void setRequiredCapabilities(List<String> requiredCapabilities) { this.requiredCapabilities = requiredCapabilities; }

    public String getPriorityCode() { return priorityCode; }
    public void setPriorityCode(String priorityCode) { this.priorityCode = priorityCode; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public static CallCenterReportRequestBuilder builder() {
        return new CallCenterReportRequestBuilder();
    }

    public static class CallCenterReportRequestBuilder {
        private String callerName;
        private String callerPhone;
        private String title;
        private String type;
        private String subTypeId;
        private String description;
        private String locationName;
        private Double lat;
        private Double lng;
        private Integer severity;
        private List<String> requiredCapabilities;
        private String priorityCode;
        private String notes;

        public CallCenterReportRequestBuilder callerName(String callerName) { this.callerName = callerName; return this; }
        public CallCenterReportRequestBuilder callerPhone(String callerPhone) { this.callerPhone = callerPhone; return this; }
        public CallCenterReportRequestBuilder title(String title) { this.title = title; return this; }
        public CallCenterReportRequestBuilder type(String type) { this.type = type; return this; }
        public CallCenterReportRequestBuilder subTypeId(String subTypeId) { this.subTypeId = subTypeId; return this; }
        public CallCenterReportRequestBuilder description(String description) { this.description = description; return this; }
        public CallCenterReportRequestBuilder locationName(String locationName) { this.locationName = locationName; return this; }
        public CallCenterReportRequestBuilder lat(Double lat) { this.lat = lat; return this; }
        public CallCenterReportRequestBuilder lng(Double lng) { this.lng = lng; return this; }
        public CallCenterReportRequestBuilder severity(Integer severity) { this.severity = severity; return this; }
        public CallCenterReportRequestBuilder requiredCapabilities(List<String> requiredCapabilities) { this.requiredCapabilities = requiredCapabilities; return this; }
        public CallCenterReportRequestBuilder priorityCode(String priorityCode) { this.priorityCode = priorityCode; return this; }
        public CallCenterReportRequestBuilder notes(String notes) { this.notes = notes; return this; }

        public CallCenterReportRequest build() {
            return new CallCenterReportRequest(callerName, callerPhone, title, type, subTypeId, description, locationName, lat, lng, severity, requiredCapabilities, priorityCode, notes);
        }
    }
}
