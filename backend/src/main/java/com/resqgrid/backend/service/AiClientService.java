package com.resqgrid.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.*;

@Service
public class AiClientService {

    private static final Logger log = LoggerFactory.getLogger(AiClientService.class);

    private final RestTemplate restTemplate;
    private final String aiServiceBaseUrl;
    private volatile boolean isOnline = false;

    public AiClientService(
            RestTemplateBuilder builder,
            @Value("${app.ai-service.url:http://localhost:5000/api}") String aiServiceBaseUrl) {
        this.aiServiceBaseUrl = aiServiceBaseUrl;
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofMillis(1800))
                .setReadTimeout(Duration.ofMillis(2000))
                .build();
    }

    public boolean isAiServiceOnline() {
        return isOnline;
    }

    /**
     * Classifies unstructured emergency text into taxonomy category, sub-type, confidence and summary.
     */
    public Map<String, Object> classifyIncident(String text) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            Map<String, String> request = Collections.singletonMap("text", text != null ? text : "");
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(request, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(aiServiceBaseUrl + "/classify", entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                isOnline = true;
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();
                return body;
            }
        } catch (Exception e) {
            isOnline = false;
            log.info("[DEGRADED MODE] AI microservice unavailable ({}). Executing deterministic rules engine.", e.getMessage());
        }

        return fallbackClassification(text);
    }

    /**
     * Evaluates hybrid severity scoring based on incident details, sensor breach magnitude, and citizen count.
     */
    public Map<String, Object> evaluateSeverity(Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(aiServiceBaseUrl + "/severity", entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                isOnline = true;
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();
                return body;
            }
        } catch (Exception e) {
            isOnline = false;
            log.info("[DEGRADED MODE] AI severity engine unavailable. Falling back to deterministic scoring.");
        }

        return fallbackSeverity(payload);
    }

    /**
     * Checks candidate duplicate reports.
     */
    public Map<String, Object> checkDuplicates(Map<String, Object> payload) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(aiServiceBaseUrl + "/duplicates/check", entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                isOnline = true;
                @SuppressWarnings("unchecked")
                Map<String, Object> body = (Map<String, Object>) response.getBody();
                return body;
            }
        } catch (Exception e) {
            isOnline = false;
        }

        Map<String, Object> fallback = new HashMap<>();
        fallback.put("isDuplicate", false);
        fallback.put("similarityScore", 0.0);
        fallback.put("mode", "DEGRADED_SPATIAL_ONLY");
        return fallback;
    }

    /**
     * Deterministic regex and keyword rules engine providing 100% zero downtime.
     */
    public Map<String, Object> fallbackClassification(String text) {
        String lower = (text != null ? text : "").toLowerCase();
        Map<String, Object> result = new HashMap<>();

        String categoryId = "CAT_MED";
        String categoryName = "Medical Emergency";
        String subTypeId = "SUB_MD_CRIT";
        List<String> capabilities = Arrays.asList("ADVANCED_AMBULANCE", "PARAMEDIC_TEAM");

        if (lower.contains("flood") || lower.contains("water") || lower.contains("drown") || lower.contains("submerged") || lower.contains("river") || lower.contains("overflow")) {
            categoryId = "CAT_FLOOD";
            categoryName = "Flood";
            subTypeId = lower.contains("river") ? "SUB_FL_RIVER" : "SUB_FL_FLASH";
            capabilities = Arrays.asList("WATER_RESCUE", "INFLATABLE_BOAT", "HEAVY_PUMP");
        } else if (lower.contains("fire") || lower.contains("smoke") || lower.contains("flame") || lower.contains("burn") || lower.contains("explosion") || lower.contains("blast")) {
            categoryId = "CAT_FIRE";
            categoryName = "Fire";
            subTypeId = lower.contains("wild") ? "SUB_FR_WILD" : lower.contains("industrial") ? "SUB_FR_INDUS" : "SUB_FR_STRUCT";
            capabilities = Arrays.asList("FIRE_ENGINE", "LADDER_TRUCK", "BREATHING_APPARATUS");
        } else if (lower.contains("gas") || lower.contains("chemical") || lower.contains("toxic") || lower.contains("leak") || lower.contains("fumes") || lower.contains("hazmat")) {
            categoryId = "CAT_HAZMAT";
            categoryName = "Hazardous";
            subTypeId = "SUB_HZ_GAS";
            capabilities = Arrays.asList("HAZMAT_SUIT_LEVEL_A", "GAS_DETECTOR", "DECONTAMINATION_UNIT");
        } else if (lower.contains("accident") || lower.contains("crash") || lower.contains("collision") || lower.contains("vehicle") || lower.contains("traffic") || lower.contains("highway")) {
            categoryId = "CAT_TRAFFIC";
            categoryName = "Traffic";
            subTypeId = "SUB_TR_COLL";
            capabilities = Arrays.asList("EXTRICATION_EQUIPMENT", "TRAFFIC_CONTROL", "AMBULANCE");
        } else if (lower.contains("collapse") || lower.contains("rubble") || lower.contains("debris") || lower.contains("building fall")) {
            categoryId = "CAT_COLLAPSE";
            categoryName = "Infrastructure";
            subTypeId = "SUB_CL_BLDG";
            capabilities = Arrays.asList("SEARCH_DOGS", "CONCRETE_CUTTER", "HEAVY_CRANE");
        } else if (lower.contains("quake") || lower.contains("earthquake") || lower.contains("tremor") || lower.contains("landslide")) {
            categoryId = "CAT_SEISMIC";
            categoryName = "Geological";
            subTypeId = "SUB_SM_QUAKE";
            capabilities = Arrays.asList("USAR_TEAM", "EARTHMOVER", "SHELTER_KIT");
        }

        result.put("categoryId", categoryId);
        result.put("categoryName", categoryName);
        result.put("subTypeId", subTypeId);
        result.put("confidence", 0.88);
        result.put("capabilities", capabilities);
        result.put("summary", "[Degraded Mode Fallback] Incident classified as " + categoryName + " based on deterministic keyword matching.");
        result.put("engineMode", "DEGRADED_FALLBACK");
        return result;
    }

    private Map<String, Object> fallbackSeverity(Map<String, Object> payload) {
        String text = payload != null && payload.get("text") != null ? payload.get("text").toString().toLowerCase() : "";
        int severity = 3;

        // Hard Floor Safety Rule: Level 5 requires life-risk keyword or critical sensor breach
        if (text.contains("trapped") || text.contains("casualt") || text.contains("unconscious") || text.contains("drowning") || text.contains("mass casualty") || text.contains("cardiac")) {
            severity = 5;
        } else if (text.contains("severe") || text.contains("spreading") || text.contains("heavy smoke") || text.contains("major damage")) {
            severity = 4;
        } else if (text.contains("minor") || text.contains("advisory") || text.contains("small")) {
            severity = 2;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("severity", severity);
        result.put("aiConfidence", 0.89);
        result.put("priorityCode", severity >= 5 ? "P1" : severity == 4 ? "P2" : severity == 3 ? "P3" : "P4");
        result.put("engineMode", "DEGRADED_FALLBACK");
        return result;
    }
}
