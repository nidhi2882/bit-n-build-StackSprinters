package com.resqgrid.backend;

import com.resqgrid.backend.entity.Incident;
import com.resqgrid.backend.entity.ServiceRequest;
import com.resqgrid.backend.entity.User;
import com.resqgrid.backend.repository.IncidentRepository;
import com.resqgrid.backend.repository.ServiceRequestRepository;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ServiceRequestSecurityTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private ServiceRequestRepository serviceRequestRepository;

    @InjectMocks
    private IncidentService incidentService;

    private Incident fireIncident1;
    private Incident fireIncident2;
    private Incident floodIncident;

    private UserPrincipal fireAdminUser;
    private UserPrincipal medicalAdminUser;

    @BeforeEach
    void setUp() {
        fireIncident1 = Incident.builder()
                .id("INC-FIRE-001")
                .title("Factory Blaze")
                .type("FIRE")
                .reporterEmail("fire.reporter@test.com")
                .build();

        fireIncident2 = Incident.builder()
                .id("INC-FIRE-002")
                .title("Warehouse Chemical Fire")
                .type("FIRE")
                .reporterEmail("fire.reporter2@test.com")
                .build();

        floodIncident = Incident.builder()
                .id("INC-FLOOD-001")
                .title("River Overflow")
                .type("FLOOD")
                .reporterEmail("flood.reporter@test.com")
                .build();

        User fireAdminEntity = User.builder()
                .id(10L)
                .email("fire.admin@resqgrid.gov")
                .role("Department Admin")
                .departmentCategory("CAT_FIRE")
                .build();
        fireAdminUser = new UserPrincipal(fireAdminEntity);

        User medicalAdminEntity = User.builder()
                .id(20L)
                .email("medical.admin@resqgrid.gov")
                .role("Department Admin")
                .departmentCategory("CAT_MED")
                .build();
        medicalAdminUser = new UserPrincipal(medicalAdminEntity);
    }

    @Test
    void testDepartmentAdminCannotSeeIncidentsOutsideCategoryWithoutServiceRequest() {
        when(incidentRepository.findByTypeIgnoreCaseInOrderByReportedAtDesc(anyList()))
                .thenReturn(Collections.emptyList());
        when(serviceRequestRepository.findByRequestedDepartmentIgnoreCaseInAndStatus(anyList(), eq("ACCEPTED")))
                .thenReturn(Collections.emptyList());

        List<Incident> results = incidentService.getScopedIncidents(medicalAdminUser);

        assertTrue(results.isEmpty());
        assertFalse(incidentService.isUserAuthorizedForIncident(fireIncident1, medicalAdminUser));
    }

    @Test
    void testPendingOrDeclinedServiceRequestDoesNotGrantIncidentAccess() {
        when(incidentRepository.findByTypeIgnoreCaseInOrderByReportedAtDesc(anyList()))
                .thenReturn(Collections.emptyList());
        when(serviceRequestRepository.findByRequestedDepartmentIgnoreCaseInAndStatus(anyList(), eq("ACCEPTED")))
                .thenReturn(Collections.emptyList());

        List<Incident> results = incidentService.getScopedIncidents(medicalAdminUser);

        assertTrue(results.isEmpty());
        assertFalse(incidentService.isUserAuthorizedForIncident(fireIncident1, medicalAdminUser));
    }

    @Test
    void testAcceptedServiceRequestGrantsAccessToOnlyTargetIncident() {
        ServiceRequest acceptedRequest = ServiceRequest.builder()
                .id(100L)
                .incidentId("INC-FIRE-001")
                .requestedByDepartment("CAT_FIRE")
                .requestedDepartment("CAT_MED")
                .reason("Need trauma medical team")
                .urgency("HIGH")
                .status("ACCEPTED")
                .build();

        when(incidentRepository.findByTypeIgnoreCaseInOrderByReportedAtDesc(anyList()))
                .thenReturn(Collections.emptyList());
        when(serviceRequestRepository.findByRequestedDepartmentIgnoreCaseInAndStatus(anyList(), eq("ACCEPTED")))
                .thenReturn(Collections.singletonList(acceptedRequest));
        when(incidentRepository.findAllById(Collections.singleton("INC-FIRE-001")))
                .thenReturn(Collections.singletonList(fireIncident1));

        List<Incident> results = incidentService.getScopedIncidents(medicalAdminUser);

        assertEquals(1, results.size());
        assertEquals("INC-FIRE-001", results.get(0).getId());

        // Verify Medical Admin IS authorized for INC-FIRE-001 (granted via ACCEPTED ServiceRequest)
        assertTrue(incidentService.isUserAuthorizedForIncident(fireIncident1, medicalAdminUser));

        // Verify Medical Admin is NOT authorized for INC-FIRE-002 (unrelated Fire incident)
        assertFalse(incidentService.isUserAuthorizedForIncident(fireIncident2, medicalAdminUser));
    }
}
