package com.resqgrid.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
