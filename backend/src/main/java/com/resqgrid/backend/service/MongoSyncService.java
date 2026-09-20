package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

/**
 * Service to ensure all ResQGrid operations are persisted and synchronized
 * directly to MongoDB Atlas cloud collections in real time.
 */
@Service
public class MongoSyncService {

    private static final Logger log = LoggerFactory.getLogger(MongoSyncService.class);

    private final MongoTemplate mongoTemplate;

    @Autowired
    public MongoSyncService(@Autowired(required = false) MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public boolean isConnected() {
        return mongoTemplate != null;
    }

    public void syncUser(User user) {
        if (mongoTemplate == null || user == null) return;
        try {
            mongoTemplate.save(user, "users");
            log.debug("User synced to MongoDB Atlas: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to sync user to MongoDB Atlas: {}", e.getMessage());
        }
    }

    public void syncIncident(Incident incident) {
        if (mongoTemplate == null || incident == null) return;
        try {
            mongoTemplate.save(incident, "incidents");
            log.info("Incident synced to MongoDB Atlas 'incidents': {} ({})", incident.getId(), incident.getTitle());
        } catch (Exception e) {
            log.warn("Failed to sync incident to MongoDB Atlas: {}", e.getMessage());
        }
    }

    public void syncResource(Resource resource) {
        if (mongoTemplate == null || resource == null) return;
        try {
            mongoTemplate.save(resource, "resources");
            log.debug("Resource synced to MongoDB Atlas 'resources': {}", resource.getId());
        } catch (Exception e) {
            log.warn("Failed to sync resource to MongoDB Atlas: {}", e.getMessage());
        }
    }

    public void syncHospital(Hospital hospital) {
        if (mongoTemplate == null || hospital == null) return;
        try {
            mongoTemplate.save(hospital, "hospitals");
            log.info("Hospital synced to MongoDB Atlas 'hospitals': {} (Trauma: {}/{})",
                    hospital.getId(), hospital.getTraumaBedsOccupied(), hospital.getTraumaBedsTotal());
        } catch (Exception e) {
            log.warn("Failed to sync hospital to MongoDB Atlas: {}", e.getMessage());
        }
    }

    public void syncAlert(Alert alert) {
        if (mongoTemplate == null || alert == null) return;
        try {
            mongoTemplate.save(alert, "alerts");
            log.info("Alert broadcast synced to MongoDB Atlas 'alerts': {} ({})", alert.getId(), alert.getTitle());
        } catch (Exception e) {
            log.warn("Failed to sync alert to MongoDB Atlas: {}", e.getMessage());
        }
    }

    public void syncIncidentReport(IncidentReport report) {
        if (mongoTemplate == null || report == null) return;
        try {
            mongoTemplate.save(report, "incident_reports");
            log.debug("IncidentReport synced to MongoDB Atlas 'incident_reports': {}", report.getId());
        } catch (Exception e) {
            log.warn("Failed to sync incident report to MongoDB Atlas: {}", e.getMessage());
        }
    }

    public void syncResourceAssignment(ResourceAssignment assignment) {
        if (mongoTemplate == null || assignment == null) return;
        try {
            mongoTemplate.save(assignment, "resource_assignments");
            log.info("ResourceAssignment synced to MongoDB Atlas: Res {} -> Inc {}",
                    assignment.getResourceId(), assignment.getIncidentId());
        } catch (Exception e) {
            log.warn("Failed to sync resource assignment to MongoDB Atlas: {}", e.getMessage());
        }
    }

    public void syncCategory(EmergencyCategory category) {
        if (mongoTemplate == null || category == null) return;
        try {
            mongoTemplate.save(category, "emergency_categories");
        } catch (Exception e) {
            log.warn("Failed to sync category to MongoDB Atlas: {}", e.getMessage());
        }
    }

    public void syncSubType(EmergencySubType subType) {
        if (mongoTemplate == null || subType == null) return;
        try {
            mongoTemplate.save(subType, "emergency_sub_types");
        } catch (Exception e) {
            log.warn("Failed to sync sub-type to MongoDB Atlas: {}", e.getMessage());
        }
    }

    public void syncServiceRequest(ServiceRequest request) {
        if (mongoTemplate == null || request == null) return;
        try {
            mongoTemplate.save(request, "service_requests");
            log.info("ServiceRequest synced to MongoDB Atlas 'service_requests': REQ-{}", request.getId());
        } catch (Exception e) {
            log.warn("Failed to sync service request to MongoDB Atlas: {}", e.getMessage());
        }
    }
}
