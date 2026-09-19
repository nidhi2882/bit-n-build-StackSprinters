package com.resqgrid.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
