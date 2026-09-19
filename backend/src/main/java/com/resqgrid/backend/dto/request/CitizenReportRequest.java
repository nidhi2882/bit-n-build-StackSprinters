package com.resqgrid.backend.dto.request;

import javax.validation.constraints.NotBlank;
import java.util.List;

public class CitizenReportRequest {
    private String type; // e.g. "Flood" or "CAT_FLOOD"
    private String subTypeId; // e.g. "SUB_FL_FLASH"

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private String locationName;
    private Double lat;
    private Double lng;
    private Integer severity; // 1-5

    private String reporterName;
    private String reporterPhone;
    private String deviceInfo;
    private List<String> photos;

    public CitizenReportRequest() {
    }

    public CitizenReportRequest(String type, String subTypeId, String title, String description, String locationName, Double lat, Double lng, Integer severity, String reporterName, String reporterPhone, String deviceInfo, List<String> photos) {
        this.type = type;
        this.subTypeId = subTypeId;
        this.title = title;
        this.description = description;
        this.locationName = locationName;
        this.lat = lat;
        this.lng = lng;
        this.severity = severity;
        this.reporterName = reporterName;
        this.reporterPhone = reporterPhone;
        this.deviceInfo = deviceInfo;
        this.photos = photos;
    }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSubTypeId() { return subTypeId; }
    public void setSubTypeId(String subTypeId) { this.subTypeId = subTypeId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

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

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public String getReporterPhone() { return reporterPhone; }
    public void setReporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; }

    public String getDeviceInfo() { return deviceInfo; }
    public void setDeviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; }

    public List<String> getPhotos() { return photos; }
    public void setPhotos(List<String> photos) { this.photos = photos; }

    public static CitizenReportRequestBuilder builder() {
        return new CitizenReportRequestBuilder();
    }

    public static class CitizenReportRequestBuilder {
        private String type;
        private String subTypeId;
        private String title;
        private String description;
        private String locationName;
        private Double lat;
        private Double lng;
        private Integer severity;
        private String reporterName;
        private String reporterPhone;
        private String deviceInfo;
        private List<String> photos;

        public CitizenReportRequestBuilder type(String type) { this.type = type; return this; }
        public CitizenReportRequestBuilder subTypeId(String subTypeId) { this.subTypeId = subTypeId; return this; }
        public CitizenReportRequestBuilder title(String title) { this.title = title; return this; }
        public CitizenReportRequestBuilder description(String description) { this.description = description; return this; }
        public CitizenReportRequestBuilder locationName(String locationName) { this.locationName = locationName; return this; }
        public CitizenReportRequestBuilder lat(Double lat) { this.lat = lat; return this; }
        public CitizenReportRequestBuilder lng(Double lng) { this.lng = lng; return this; }
        public CitizenReportRequestBuilder severity(Integer severity) { this.severity = severity; return this; }
        public CitizenReportRequestBuilder reporterName(String reporterName) { this.reporterName = reporterName; return this; }
        public CitizenReportRequestBuilder reporterPhone(String reporterPhone) { this.reporterPhone = reporterPhone; return this; }
        public CitizenReportRequestBuilder deviceInfo(String deviceInfo) { this.deviceInfo = deviceInfo; return this; }
        public CitizenReportRequestBuilder photos(List<String> photos) { this.photos = photos; return this; }

        public CitizenReportRequest build() {
            return new CitizenReportRequest(type, subTypeId, title, description, locationName, lat, lng, severity, reporterName, reporterPhone, deviceInfo, photos);
        }
    }
}
