package com.resqgrid.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OsrmService {

    private static final Logger log = LoggerFactory.getLogger(OsrmService.class);

    private final RestTemplate restTemplate;
    private final String osrmServerUrl;

    public OsrmService(
            RestTemplateBuilder builder,
            @Value("${app.osrm.url:http://router.project-osrm.org}") String osrmServerUrl) {
        this.osrmServerUrl = osrmServerUrl;
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofMillis(2000))
                .setReadTimeout(Duration.ofMillis(2500))
                .build();
    }

    /**
     * Calculates road network driving distance (in km) and travel time (in minutes) via OSRM API.
     * Returns a Map with "distanceKm", "durationMins", and "isOsrmRouted".
     */
    public Map<String, Object> calculateRoute(Double originLat, Double originLon, Double destLat, Double destLon) {
        Map<String, Object> result = new HashMap<>();
        if (originLat == null || originLon == null || destLat == null || destLon == null) {
            result.put("distanceKm", 5.0);
            result.put("durationMins", 15);
            result.put("isOsrmRouted", false);
            return result;
        }

        try {
            // OSRM format: /route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=false
            String url = String.format("%s/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=false",
                    osrmServerUrl, originLon, originLat, destLon, destLat);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && "Ok".equalsIgnoreCase((String) response.get("code"))) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> routes = (List<Map<String, Object>>) response.get("routes");
                if (routes != null && !routes.isEmpty()) {
                    Map<String, Object> route = routes.get(0);
                    double distMeters = ((Number) route.get("distance")).doubleValue();
                    double durSeconds = ((Number) route.get("duration")).doubleValue();

                    double distKm = Math.round((distMeters / 1000.0) * 100.0) / 100.0;
                    int durMins = Math.max(1, (int) Math.round(durSeconds / 60.0));

                    result.put("distanceKm", distKm);
                    result.put("durationMins", durMins);
                    result.put("isOsrmRouted", true);
                    log.info("[OSRM Engine] Road network route calculated: {} km, {} mins", distKm, durMins);
                    return result;
                }
            }
        } catch (Exception e) {
            log.debug("[OSRM Engine] Fallback to Haversine geodetic distance due to: {}", e.getMessage());
        }

        // Fallback Haversine Calculation
        double haversineDistKm = haversine(originLat, originLon, destLat, destLon);
        double distKm = Math.round(haversineDistKm * 10.0) / 10.0;
        int durMins = Math.max(2, (int) Math.round(distKm * 3.5));

        result.put("distanceKm", distKm);
        result.put("durationMins", durMins);
        result.put("isOsrmRouted", false);
        return result;
    }

    private double haversine(Double lat1, Double lon1, Double lat2, Double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);
        a = Math.min(1.0, Math.max(0.0, a));
        return R * 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    }
}
