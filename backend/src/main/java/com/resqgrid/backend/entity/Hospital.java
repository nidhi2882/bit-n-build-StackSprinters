package com.resqgrid.backend.entity;

import javax.persistence.*;

@Entity
@Table(name = "hospitals")
public class Hospital {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "location_name")
    private String locationName;

    private Double lat;

    private Double lng;

    private String contact;

    @Column(name = "trauma_beds_total")
    private Integer traumaBedsTotal;

    @Column(name = "trauma_beds_occupied")
    private Integer traumaBedsOccupied;

    @Column(name = "icu_beds_total")
    private Integer icuBedsTotal;

    @Column(name = "icu_beds_occupied")
    private Integer icuBedsOccupied;

    @Column(name = "blood_units_available")
    private Integer bloodUnitsAvailable;

    @Column(name = "ambulance_bay_status")
    private String ambulanceBayStatus;

    @Column(nullable = false)
    private String status;

    public Hospital() {}

    public Hospital(String id, String name, String locationName, Double lat, Double lng, String contact, Integer traumaBedsTotal, Integer traumaBedsOccupied, Integer icuBedsTotal, Integer icuBedsOccupied, Integer bloodUnitsAvailable, String ambulanceBayStatus, String status) {
        this.id = id;
        this.name = name;
        this.locationName = locationName;
        this.lat = lat;
        this.lng = lng;
        this.contact = contact;
        this.traumaBedsTotal = traumaBedsTotal;
        this.traumaBedsOccupied = traumaBedsOccupied;
        this.icuBedsTotal = icuBedsTotal;
        this.icuBedsOccupied = icuBedsOccupied;
        this.bloodUnitsAvailable = bloodUnitsAvailable;
        this.ambulanceBayStatus = ambulanceBayStatus;
        this.status = status != null ? status : "Optimal";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }

    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }

    public Integer getTraumaBedsTotal() { return traumaBedsTotal; }
    public void setTraumaBedsTotal(Integer traumaBedsTotal) { this.traumaBedsTotal = traumaBedsTotal; }

    public Integer getTraumaBedsOccupied() { return traumaBedsOccupied; }
    public void setTraumaBedsOccupied(Integer traumaBedsOccupied) { this.traumaBedsOccupied = traumaBedsOccupied; }

    public Integer getIcuBedsTotal() { return icuBedsTotal; }
    public void setIcuBedsTotal(Integer icuBedsTotal) { this.icuBedsTotal = icuBedsTotal; }

    public Integer getIcuBedsOccupied() { return icuBedsOccupied; }
    public void setIcuBedsOccupied(Integer icuBedsOccupied) { this.icuBedsOccupied = icuBedsOccupied; }

    public Integer getBloodUnitsAvailable() { return bloodUnitsAvailable; }
    public void setBloodUnitsAvailable(Integer bloodUnitsAvailable) { this.bloodUnitsAvailable = bloodUnitsAvailable; }

    public String getAmbulanceBayStatus() { return ambulanceBayStatus; }
    public void setAmbulanceBayStatus(String ambulanceBayStatus) { this.ambulanceBayStatus = ambulanceBayStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static HospitalBuilder builder() { return new HospitalBuilder(); }

    public static class HospitalBuilder {
        private String id;
        private String name;
        private String locationName;
        private Double lat;
        private Double lng;
        private String contact;
        private Integer traumaBedsTotal;
        private Integer traumaBedsOccupied;
        private Integer icuBedsTotal;
        private Integer icuBedsOccupied;
        private Integer bloodUnitsAvailable;
        private String ambulanceBayStatus;
        private String status = "Optimal";

        public HospitalBuilder id(String id) { this.id = id; return this; }
        public HospitalBuilder name(String name) { this.name = name; return this; }
        public HospitalBuilder locationName(String locationName) { this.locationName = locationName; return this; }
        public HospitalBuilder lat(Double lat) { this.lat = lat; return this; }
        public HospitalBuilder lng(Double lng) { this.lng = lng; return this; }
        public HospitalBuilder contact(String contact) { this.contact = contact; return this; }
        public HospitalBuilder traumaBedsTotal(Integer traumaBedsTotal) { this.traumaBedsTotal = traumaBedsTotal; return this; }
        public HospitalBuilder traumaBedsOccupied(Integer traumaBedsOccupied) { this.traumaBedsOccupied = traumaBedsOccupied; return this; }
        public HospitalBuilder icuBedsTotal(Integer icuBedsTotal) { this.icuBedsTotal = icuBedsTotal; return this; }
        public HospitalBuilder icuBedsOccupied(Integer icuBedsOccupied) { this.icuBedsOccupied = icuBedsOccupied; return this; }
        public HospitalBuilder bloodUnitsAvailable(Integer bloodUnitsAvailable) { this.bloodUnitsAvailable = bloodUnitsAvailable; return this; }
        public HospitalBuilder ambulanceBayStatus(String ambulanceBayStatus) { this.ambulanceBayStatus = ambulanceBayStatus; return this; }
        public HospitalBuilder status(String status) { this.status = status; return this; }

        public Hospital build() {
            return new Hospital(id, name, locationName, lat, lng, contact, traumaBedsTotal, traumaBedsOccupied, icuBedsTotal, icuBedsOccupied, bloodUnitsAvailable, ambulanceBayStatus, status);
        }
    }
}
