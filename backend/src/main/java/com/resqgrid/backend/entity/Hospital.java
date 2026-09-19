package com.resqgrid.backend.entity;

import javax.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hospitals")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hospital {

    @Id
    @Column(length = 64)
    private String id; // e.g. "HOSP-001"

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
    private String ambulanceBayStatus; // "Clear", "Congested", "Full"

    @Column(nullable = false)
    private String status; // "Optimal", "Near Capacity", "Critical"
}
