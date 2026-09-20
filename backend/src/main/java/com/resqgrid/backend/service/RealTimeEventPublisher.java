package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Incident;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
public class RealTimeEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RealTimeEventPublisher.class);
    private final SimpMessagingTemplate messagingTemplate;

    public RealTimeEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Broadcasts incident:created to authority room and department room
     */
    public void publishIncidentCreated(Incident incident) {
        if (incident == null) return;
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "incident:created");
        payload.put("timestamp", Instant.now().toString());
        payload.put("incident", incident);

        // Broadcast to Super Admin / Authority room
        messagingTemplate.convertAndSend("/topic/authority/all", payload);

        // Broadcast to scoped Department room
        String cat = incident.getCategory() != null ? incident.getCategory() : incident.getType();
        if (cat != null) {
            String deptTopic = "/topic/dept/" + cat.toLowerCase().replace("cat_", "").trim();
            messagingTemplate.convertAndSend(deptTopic, payload);
        }
        log.info("Published incident:created for incident #{} to authority and department", incident.getId());
    }

    /**
     * Broadcasts incident:updated to authority room and department room
     */
    public void publishIncidentUpdated(Incident incident) {
        if (incident == null) return;
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "incident:updated");
        payload.put("timestamp", Instant.now().toString());
        payload.put("incident", incident);

        messagingTemplate.convertAndSend("/topic/authority/all", payload);

        String cat = incident.getCategory() != null ? incident.getCategory() : incident.getType();
        if (cat != null) {
            String deptTopic = "/topic/dept/" + cat.toLowerCase().replace("cat_", "").trim();
            messagingTemplate.convertAndSend(deptTopic, payload);
        }
        log.info("Published incident:updated for incident #{}", incident.getId());
    }

    /**
     * Broadcasts resource:location to authority and unit room
     */
    public void publishResourceLocation(Long unitId, double lat, double lng, String status) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "resource:location");
        payload.put("timestamp", Instant.now().toString());
        payload.put("unitId", unitId);
        payload.put("latitude", lat);
        payload.put("longitude", lng);
        payload.put("status", status != null ? status : "AVAILABLE");

        messagingTemplate.convertAndSend("/topic/authority/all", payload);
        if (unitId != null) {
            messagingTemplate.convertAndSend("/topic/unit/" + unitId, payload);
        }
        log.debug("Published resource:location for unit {}", unitId);
    }

    /**
     * Broadcasts alert:escalated SLA alert to authority and dept
     */
    public void publishAlertEscalated(String message, String incidentId, String level) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventType", "alert:escalated");
        payload.put("timestamp", Instant.now().toString());
        payload.put("incidentId", incidentId);
        payload.put("level", level);
        payload.put("message", message);

        messagingTemplate.convertAndSend("/topic/authority/all", payload);
        log.warn("Published alert:escalated SLA alert: {}", message);
    }
}
