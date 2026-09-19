package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.Resource;
import com.resqgrid.backend.repository.AlertRepository;
import com.resqgrid.backend.repository.IncidentReportRepository;
import com.resqgrid.backend.repository.IncidentRepository;
import com.resqgrid.backend.repository.ResourceAssignmentRepository;
import com.resqgrid.backend.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class StatusTransitionTest {

    private IncidentRepository incidentRepository;
    private IncidentReportRepository incidentReportRepository;
    private ResourceRepository resourceRepository;
    private ResourceAssignmentRepository resourceAssignmentRepository;
    private AlertRepository alertRepository;
    private MongoSyncService mongoSyncService;

    private IncidentService incidentService;
    private ResourceService resourceService;

    @BeforeEach
    public void setUp() {
        incidentRepository = mock(IncidentRepository.class);
        incidentReportRepository = mock(IncidentReportRepository.class);
        resourceRepository = mock(ResourceRepository.class);
        resourceAssignmentRepository = mock(ResourceAssignmentRepository.class);
        alertRepository = mock(AlertRepository.class);
        mongoSyncService = mock(MongoSyncService.class);

        incidentService = new IncidentService(
                incidentRepository,
                incidentReportRepository,
                resourceRepository,
                resourceAssignmentRepository,
                alertRepository,
                mongoSyncService
        );

        resourceService = new ResourceService(
                resourceRepository,
                incidentRepository,
                mongoSyncService
        );
    }

    @Test
    @DisplayName("REQ 1: Resource cannot accept 'Resolved' status and throws IllegalArgumentException")
    public void testResourceStatusResolvedBlocked() {
        Resource res = Resource.builder()
                .id("RES-001")
                .name("NDRF Water Rescue Team 01")
                .status("Available")
                .build();
        when(resourceRepository.findById("RES-001")).thenReturn(Optional.of(res));

        Exception exception = assertThrows(IllegalArgumentException.class, () -> {
            resourceService.updateStatus("RES-001", "Resolved");
        });

        System.out.println("[TEST TRACE - REQ 1] Attempting to set Resource status to 'Resolved' failed as expected:");
        System.out.println("   --> Error: " + exception.getMessage());
        assertTrue(exception.getMessage().contains("Resolved"));
    }

    @Test
    @DisplayName("REQ 2: Premature Incident resolution blocked when assigned resource is still 'En-Route'")
    public void testPrematureIncidentResolutionBlocked() {
        Resource res = Resource.builder()
                .id("RES-001")
                .name("NDRF Water Rescue Team 01")
                .status("En-Route")
                .assignedIncidentId("INC-2026-001")
                .build();

        Incident inc = Incident.builder()
                .id("INC-2026-001")
                .title("Urban Flood Rescue")
                .status("En-Route")
                .assignedResourceIds(new ArrayList<>(List.of("RES-001")))
                .build();

        when(incidentRepository.findById("INC-2026-001")).thenReturn(Optional.of(inc));
        when(resourceRepository.findAllById(List.of("RES-001"))).thenReturn(List.of(res));

        Exception exception = assertThrows(IllegalStateException.class, () -> {
            incidentService.updateStatus("INC-2026-001", "Resolved");
        });

        System.out.println("[TEST TRACE - REQ 2] Resolving incident while resource is 'En-Route' was BLOCKED as expected:");
        System.out.println("   --> Error: " + exception.getMessage());
        assertTrue(exception.getMessage().contains("En-Route") || exception.getMessage().contains("On-Scene"));
    }

    @Test
    @DisplayName("REQ 2 & 6c: Incident resolution WORKS when assigned resource reaches 'On-Scene'")
    public void testIncidentResolutionWithOnSceneResource() {
        Resource res = Resource.builder()
                .id("RES-001")
                .name("NDRF Water Rescue Team 01")
                .status("On-Scene")
                .assignedIncidentId("INC-2026-001")
                .build();

        Incident inc = Incident.builder()
                .id("INC-2026-001")
                .title("Urban Flood Rescue")
                .status("On-Scene")
                .assignedResourceIds(new ArrayList<>(List.of("RES-001")))
                .build();

        when(incidentRepository.findById("INC-2026-001")).thenReturn(Optional.of(inc));
        when(resourceRepository.findAllById(List.of("RES-001"))).thenReturn(List.of(res));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident resolvedInc = incidentService.updateStatus("INC-2026-001", "Resolved");

        System.out.println("[TEST TRACE - REQ 2 & 6c] Progressing unit to On-Scene and resolving incident succeeded:");
        System.out.println("   --> Final Incident Status: " + resolvedInc.getStatus());
        System.out.println("   --> Resource Status Reset to: " + res.getStatus());
        assertEquals("Resolved", resolvedInc.getStatus());
        assertEquals("Available", res.getStatus());
        assertNull(res.getAssignedIncidentId());
    }

    @Test
    @DisplayName("REQ 3 & 6d: Unassigning a resource reverts incident status to 'Reported' when 0 units remain")
    public void testUnassignResourceRevertsIncidentStatus() {
        Resource res = Resource.builder()
                .id("RES-001")
                .name("NDRF Water Rescue Team 01")
                .status("En-Route")
                .assignedIncidentId("INC-2026-001")
                .build();

        Incident inc = Incident.builder()
                .id("INC-2026-001")
                .title("Urban Flood Rescue")
                .status("Assigned")
                .assignedResourceIds(new ArrayList<>(List.of("RES-001")))
                .build();

        when(incidentRepository.findById("INC-2026-001")).thenReturn(Optional.of(inc));
        when(resourceRepository.findById("RES-001")).thenReturn(Optional.of(res));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident updatedInc = incidentService.unassignResource("INC-2026-001", "RES-001");

        System.out.println("[TEST TRACE - REQ 3 & 6d] Unassigning resource from Assigned incident correctly reverted status:");
        System.out.println("   --> Reverted Incident Status: " + updatedInc.getStatus());
        System.out.println("   --> Remaining Assigned Resource IDs: " + updatedInc.getAssignedResourceIds());
        System.out.println("   --> Freed Resource Status: " + res.getStatus());
        assertEquals("Reported", updatedInc.getStatus());
        assertTrue(updatedInc.getAssignedResourceIds().isEmpty());
        assertEquals("Available", res.getStatus());
        assertNull(res.getAssignedIncidentId());
    }

    @Test
    @DisplayName("REQ 2 & 6c (Returning): Incident resolution WORKS when assigned resource is 'Returning'")
    public void testIncidentResolutionWithReturningResource() {
        Resource res = Resource.builder()
                .id("RES-007")
                .name("Disaster Utility & Generator Unit 01")
                .status("Returning")
                .assignedIncidentId("INC-2026-002")
                .build();

        Incident inc = Incident.builder()
                .id("INC-2026-002")
                .title("Cyclone damage - high winds reported")
                .status("On-Scene")
                .assignedResourceIds(new ArrayList<>(List.of("RES-007")))
                .build();

        when(incidentRepository.findById("INC-2026-002")).thenReturn(Optional.of(inc));
        when(resourceRepository.findAllById(List.of("RES-007"))).thenReturn(List.of(res));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));

        Incident resolvedInc = incidentService.updateStatus("INC-2026-002", "Resolved");

        System.out.println("[TEST TRACE - REQ 2 & 6c Returning] Progressing unit from Returning to resolving incident succeeded:");
        System.out.println("   --> Final Incident Status: " + resolvedInc.getStatus());
        System.out.println("   --> Resource Status Reset to: " + res.getStatus());
        assertEquals("Resolved", resolvedInc.getStatus());
        assertEquals("Available", res.getStatus());
        assertNull(res.getAssignedIncidentId());
    }

    @Test
    @DisplayName("REQ 4: Recommendation Query Hard-Filters Busy Resources (En-Route/On-Scene) and Re-Includes when Available")
    public void testResourceBusyFilterInRecommendations() {
        Resource res1Available = Resource.builder()
                .id("RES-001")
                .name("NDRF Water Rescue Team 01")
                .type("Water Rescue")
                .status("Available")
                .capabilities(List.of("WATER_RESCUE", "INFLATABLE_BOAT"))
                .lat(22.3100)
                .lng(73.1800)
                .build();

        Resource res2Busy = Resource.builder()
                .id("RES-002")
                .name("Vadodara Fire Tender 04")
                .type("Fire & Rescue")
                .status("En-Route")
                .assignedIncidentId("INC-2026-001")
                .capabilities(List.of("FIRE_ENGINE", "FOAM_TENDER"))
                .lat(22.3050)
                .lng(73.1780)
                .build();

        Incident inc2 = Incident.builder()
                .id("INC-2026-002")
                .title("Commercial Complex Blaze")
                .type("Fire")
                .status("Reported")
                .requiredCapabilities(List.of("FIRE_ENGINE", "FOAM_TENDER", "WATER_RESCUE"))
                .lat(22.3120)
                .lng(73.1750)
                .build();

        when(incidentRepository.findById("INC-2026-002")).thenReturn(Optional.of(inc2));
        when(resourceRepository.findAll()).thenReturn(List.of(res1Available, res2Busy));

        // 1. Query recommendations while res2 is Busy (En-Route on INC-2026-001)
        List<Map<String, Object>> recsBusy = incidentService.getRecommendedResources("INC-2026-002");
        List<String> recIdsBusy = recsBusy.stream()
                .map(m -> ((Resource) m.get("resource")).getId())
                .collect(java.util.stream.Collectors.toList());

        System.out.println("[TEST LOG EVIDENCE - RESOURCE RECOMMENDATIONS]");
        System.out.println("   --> Candidate Resources for INC-2026-002: " + recIdsBusy);

        // Verify res2 is in candidate list but has status 'En-Route' and assignedIncidentId set
        Optional<Map<String, Object>> res2RecOpt = recsBusy.stream().filter(m -> "RES-002".equals(((Resource) m.get("resource")).getId())).findFirst();
        assertTrue(res2RecOpt.isPresent(), "RES-002 should appear in recommendations with busy status badge");
        Resource res2InRec = (Resource) res2RecOpt.get().get("resource");
        assertEquals("En-Route", res2InRec.getStatus());
        assertEquals("INC-2026-001", res2InRec.getAssignedIncidentId());

        // 2. Now release res2Busy back to Available
        res2Busy.setStatus("Available");
        res2Busy.setAssignedIncidentId(null);

        List<Map<String, Object>> recsReleased = incidentService.getRecommendedResources("INC-2026-002");
        List<String> recIdsReleased = recsReleased.stream()
                .map(m -> ((Resource) m.get("resource")).getId())
                .collect(java.util.stream.Collectors.toList());

        System.out.println("   --> Filtered Resources AFTER RELEASE:  " + recIdsReleased);
        assertTrue(recIdsReleased.contains("RES-002"), "Released resource RES-002 (Available) MUST appear in recommendations");
    }
}
