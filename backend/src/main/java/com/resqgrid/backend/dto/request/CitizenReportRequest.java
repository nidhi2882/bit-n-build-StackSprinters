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
}
