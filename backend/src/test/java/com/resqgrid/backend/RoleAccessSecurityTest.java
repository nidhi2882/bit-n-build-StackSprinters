package com.resqgrid.backend;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.User;
import com.resqgrid.backend.repository.IncidentRepository;
import com.resqgrid.backend.security.UserPrincipal;
import com.resqgrid.backend.service.IncidentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyList;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RoleAccessSecurityTest {

    @Mock
    private IncidentRepository incidentRepository;

    @InjectMocks
    private IncidentService incidentService;

    private Incident fireIncident;
    private Incident floodIncident;
    private Incident citizenIncident;

    private UserPrincipal superAdminUser;
    private UserPrincipal fireAdminUser;
    private UserPrincipal floodAdminUser;
    private UserPrincipal responseTeamUser;
    private UserPrincipal citizenUser;

    @BeforeEach
    void setUp() {
        fireIncident = Incident.builder()
                .id("INC-FIRE-1")
                .title("Factory Fire")
                .type("FIRE")
                .reporterEmail("fire.reporter@test.com")
                .assignedResourceIds(Collections.singletonList("RES-FIRE-1"))
                .build();

        floodIncident = Incident.builder()
                .id("INC-FLOOD-1")
                .title("River Overflow")
                .type("FLOOD")
                .reporterEmail("flood.reporter@test.com")
                .assignedResourceIds(Collections.singletonList("RES-001"))
                .build();

        citizenIncident = Incident.builder()
                .id("INC-CITIZEN-1")
                .title("Pothole Hazard")
                .type("UTILITY")
                .reporterEmail("aarav@test.com")
                .assignedResourceIds(Collections.emptyList())
                .build();

        User superAdminEntity = User.builder()
                .id(1L)
                .email("superadmin@resqgrid.gov")
                .role("Super Admin")
                .build();
        superAdminUser = new UserPrincipal(superAdminEntity);

        User fireAdminEntity = User.builder()
                .id(2L)
                .email("fire.admin@resqgrid.gov")
                .role("Department Admin")
                .departmentCategory("CAT_FIRE")
                .build();
        fireAdminUser = new UserPrincipal(fireAdminEntity);

        User floodAdminEntity = User.builder()
                .id(3L)
                .email("flood.admin@resqgrid.gov")
                .role("Department Admin")
                .departmentCategory("CAT_FLOOD")
                .build();
        floodAdminUser = new UserPrincipal(floodAdminEntity);

        User responderEntity = User.builder()
                .id(4L)
                .email("responder@ndrf.gov")
                .role("Response Team")
                .unitId("RES-001")
                .departmentCategory("CAT_FLOOD")
                .build();
        responseTeamUser = new UserPrincipal(responderEntity);

        User citizenEntity = User.builder()
                .id(5L)
                .email("aarav@test.com")
                .role("Citizen")
                .build();
        citizenUser = new UserPrincipal(citizenEntity);
    }

    @Test
    void testSuperAdminRoleScopingReturnsAllIncidents() {
        when(incidentRepository.findAllByOrderByReportedAtDesc())
                .thenReturn(Arrays.asList(fireIncident, floodIncident, citizenIncident));

        List<Incident> results = incidentService.getScopedIncidents(superAdminUser);

        assertEquals(3, results.size());
        verify(incidentRepository, times(1)).findAllByOrderByReportedAtDesc();
    }

    @Test
    void testFireAdminRoleScopingReturnsOnlyFireIncidents() {
        when(incidentRepository.findByTypeIgnoreCaseInOrderByReportedAtDesc(anyList()))
                .thenReturn(Collections.singletonList(fireIncident));

        List<Incident> results = incidentService.getScopedIncidents(fireAdminUser);

        assertEquals(1, results.size());
        assertEquals("FIRE", results.get(0).getType());
        verify(incidentRepository, times(1)).findByTypeIgnoreCaseInOrderByReportedAtDesc(anyList());
    }

    @Test
    void testFloodAdminRoleScopingReturnsOnlyFloodIncidents() {
        when(incidentRepository.findByTypeIgnoreCaseInOrderByReportedAtDesc(anyList()))
                .thenReturn(Collections.singletonList(floodIncident));

        List<Incident> results = incidentService.getScopedIncidents(floodAdminUser);

        assertEquals(1, results.size());
        assertEquals("FLOOD", results.get(0).getType());
        verify(incidentRepository, times(1)).findByTypeIgnoreCaseInOrderByReportedAtDesc(anyList());
    }

    @Test
    void testResponseTeamRoleScopingReturnsOnlyAssignedUnitIncidents() {
        when(incidentRepository.findByAssignedResourceIdsContainingOrderByReportedAtDesc("RES-001"))
                .thenReturn(Collections.singletonList(floodIncident));

        List<Incident> results = incidentService.getScopedIncidents(responseTeamUser);

        assertEquals(1, results.size());
        assertEquals("INC-FLOOD-1", results.get(0).getId());
        verify(incidentRepository, times(1)).findByAssignedResourceIdsContainingOrderByReportedAtDesc("RES-001");
    }

    @Test
    void testCitizenRoleScopingReturnsOnlyOwnSubmittedReports() {
        when(incidentRepository.findByReporterEmailOrderByReportedAtDesc("aarav@test.com"))
                .thenReturn(Collections.singletonList(citizenIncident));

        List<Incident> results = incidentService.getScopedIncidents(citizenUser);

        assertEquals(1, results.size());
        assertEquals("aarav@test.com", results.get(0).getReporterEmail());
        verify(incidentRepository, times(1)).findByReporterEmailOrderByReportedAtDesc("aarav@test.com");
    }
}
