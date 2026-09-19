package com.resqgrid.backend.dto.request;

import javax.validation.constraints.NotBlank;

public class HospitalTelemetryRequest {
    @NotBlank(message = "Hospital ID is required")
    private String hospitalId;

    private Integer traumaBedsOccupied;
    private Integer traumaBedsTotal;
    private Integer icuBedsOccupied;
    private Integer icuBedsTotal;
    private Integer bloodUnitsAvailable;
    private String ambulanceBayStatus; // "Clear", "Congested", "Full"

    public HospitalTelemetryRequest() {
    }

    public HospitalTelemetryRequest(String hospitalId, Integer traumaBedsOccupied, Integer traumaBedsTotal, Integer icuBedsOccupied, Integer icuBedsTotal, Integer bloodUnitsAvailable, String ambulanceBayStatus) {
        this.hospitalId = hospitalId;
        this.traumaBedsOccupied = traumaBedsOccupied;
        this.traumaBedsTotal = traumaBedsTotal;
        this.icuBedsOccupied = icuBedsOccupied;
        this.icuBedsTotal = icuBedsTotal;
        this.bloodUnitsAvailable = bloodUnitsAvailable;
        this.ambulanceBayStatus = ambulanceBayStatus;
    }

    public String getHospitalId() { return hospitalId; }
    public void setHospitalId(String hospitalId) { this.hospitalId = hospitalId; }

    public Integer getTraumaBedsOccupied() { return traumaBedsOccupied; }
    public void setTraumaBedsOccupied(Integer traumaBedsOccupied) { this.traumaBedsOccupied = traumaBedsOccupied; }

    public Integer getTraumaBedsTotal() { return traumaBedsTotal; }
    public void setTraumaBedsTotal(Integer traumaBedsTotal) { this.traumaBedsTotal = traumaBedsTotal; }

    public Integer getIcuBedsOccupied() { return icuBedsOccupied; }
    public void setIcuBedsOccupied(Integer icuBedsOccupied) { this.icuBedsOccupied = icuBedsOccupied; }

    public Integer getIcuBedsTotal() { return icuBedsTotal; }
    public void setIcuBedsTotal(Integer icuBedsTotal) { this.icuBedsTotal = icuBedsTotal; }

    public Integer getBloodUnitsAvailable() { return bloodUnitsAvailable; }
    public void setBloodUnitsAvailable(Integer bloodUnitsAvailable) { this.bloodUnitsAvailable = bloodUnitsAvailable; }

    public String getAmbulanceBayStatus() { return ambulanceBayStatus; }
    public void setAmbulanceBayStatus(String ambulanceBayStatus) { this.ambulanceBayStatus = ambulanceBayStatus; }

    public static HospitalTelemetryRequestBuilder builder() {
        return new HospitalTelemetryRequestBuilder();
    }

    public static class HospitalTelemetryRequestBuilder {
        private String hospitalId;
        private Integer traumaBedsOccupied;
        private Integer traumaBedsTotal;
        private Integer icuBedsOccupied;
        private Integer icuBedsTotal;
        private Integer bloodUnitsAvailable;
        private String ambulanceBayStatus;

        public HospitalTelemetryRequestBuilder hospitalId(String hospitalId) { this.hospitalId = hospitalId; return this; }
        public HospitalTelemetryRequestBuilder traumaBedsOccupied(Integer traumaBedsOccupied) { this.traumaBedsOccupied = traumaBedsOccupied; return this; }
        public HospitalTelemetryRequestBuilder traumaBedsTotal(Integer traumaBedsTotal) { this.traumaBedsTotal = traumaBedsTotal; return this; }
        public HospitalTelemetryRequestBuilder icuBedsOccupied(Integer icuBedsOccupied) { this.icuBedsOccupied = icuBedsOccupied; return this; }
        public HospitalTelemetryRequestBuilder icuBedsTotal(Integer icuBedsTotal) { this.icuBedsTotal = icuBedsTotal; return this; }
        public HospitalTelemetryRequestBuilder bloodUnitsAvailable(Integer bloodUnitsAvailable) { this.bloodUnitsAvailable = bloodUnitsAvailable; return this; }
        public HospitalTelemetryRequestBuilder ambulanceBayStatus(String ambulanceBayStatus) { this.ambulanceBayStatus = ambulanceBayStatus; return this; }

        public HospitalTelemetryRequest build() {
            return new HospitalTelemetryRequest(hospitalId, traumaBedsOccupied, traumaBedsTotal, icuBedsOccupied, icuBedsTotal, bloodUnitsAvailable, ambulanceBayStatus);
        }
    }
}
