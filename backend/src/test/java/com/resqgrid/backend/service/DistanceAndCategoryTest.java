package com.resqgrid.backend.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DistanceAndCategoryTest {

    @Test
    public void testHaversineDistance() {
        IncidentService service = new IncidentService(null, null, null, null, null, null);

        double lat1 = 22.3040, lon1 = 73.1905;
        double lat2 = 22.3018, lon2 = 73.1889;

        double distKm = service.calculateDistance(lat1, lon1, lat2, lon2);
        double distMeters = distKm * 1000.0;

        System.out.println("[JAVA TEST 1] Distance calculation for (" + lat1 + ", " + lon1 + ") to (" + lat2 + ", " + lon2 + "):");
        System.out.println("   Computed distance: " + distMeters + " meters (" + distKm + " km)");

        assertTrue(distMeters >= 250.0 && distMeters <= 350.0, "Distance should be ~290-300m, but was: " + distMeters);
        assertNotEquals(0.0, distKm, "Distance MUST NOT be 0!");
    }
}
