package com.resqgrid.backend.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HospitalTelemetryRequest {
    @NotBlank(message = "Hospital ID is required")
    private String hospitalId;

    private Integer traumaBedsOccupied;
    private Integer traumaBedsTotal;
    private Integer icuBedsOccupied;
    private Integer icuBedsTotal;
    private Integer bloodUnitsAvailable;
    private String ambulanceBayStatus; // "Clear", "Congested", "Full"
}
