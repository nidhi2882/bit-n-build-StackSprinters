package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.IncidentActivity;
import com.resqgrid.backend.entity.ServiceRequest;
import com.resqgrid.backend.security.UserPrincipal;
import com.resqgrid.backend.service.ServiceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public ServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @PostMapping("/api/incidents/{id}/service-requests")
    public ResponseEntity<ServiceRequest> createServiceRequest(
            @PathVariable String id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String targetDepartment = payload.get("requestedDepartment");
        String reason = payload.get("reason");
        String urgency = payload.get("urgency");

        ServiceRequest request = serviceRequestService.createServiceRequest(id, targetDepartment, reason, urgency, currentUser);
        return ResponseEntity.ok(request);
    }

    @GetMapping("/api/service-requests/incoming")
    public ResponseEntity<List<ServiceRequest>> getIncomingRequests(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(serviceRequestService.getIncomingRequests(currentUser));
    }

    @GetMapping("/api/incidents/{id}/service-requests")
    public ResponseEntity<List<ServiceRequest>> getRequestsForIncident(@PathVariable String id) {
        return ResponseEntity.ok(serviceRequestService.getRequestsForIncident(id));
    }

    @GetMapping("/api/incidents/{id}/activities")
    public ResponseEntity<List<IncidentActivity>> getActivitiesForIncident(@PathVariable String id) {
        return ResponseEntity.ok(serviceRequestService.getActivitiesForIncident(id));
    }

    @GetMapping("/api/service-requests")
    public ResponseEntity<List<ServiceRequest>> getAllServiceRequests() {
        return ResponseEntity.ok(serviceRequestService.getAllServiceRequests());
    }

    @RequestMapping(value = "/api/service-requests/{id}/accept", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ServiceRequest> acceptServiceRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String assignedUnitId = payload != null ? payload.get("assignedUnitId") : null;
        return ResponseEntity.ok(serviceRequestService.acceptServiceRequest(id, assignedUnitId, currentUser));
    }

    @RequestMapping(value = "/api/service-requests/{id}/decline", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ServiceRequest> declineServiceRequest(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        String reason = payload != null ? payload.get("reason") : null;
        return ResponseEntity.ok(serviceRequestService.declineServiceRequest(id, reason, currentUser));
    }

    @RequestMapping(value = "/api/service-requests/{id}/resolve", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ServiceRequest> resolveServiceRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(serviceRequestService.resolveServiceRequest(id, currentUser));
    }
}
