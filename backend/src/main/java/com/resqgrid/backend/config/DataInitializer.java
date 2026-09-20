package com.resqgrid.backend.config;

import com.resqgrid.backend.entity.*;
import com.resqgrid.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final ResourceRepository resourceRepository;
    private final HospitalRepository hospitalRepository;
    private final AlertRepository alertRepository;
    private final EmergencyCategoryRepository categoryRepository;
    private final EmergencySubTypeRepository subTypeRepository;
    private final ServiceRequestRepository serviceRequestRepository;
    private final MongoTemplate mongoTemplate;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public DataInitializer(
            UserRepository userRepository,
            IncidentRepository incidentRepository,
            ResourceRepository resourceRepository,
            HospitalRepository hospitalRepository,
            AlertRepository alertRepository,
            EmergencyCategoryRepository categoryRepository,
            EmergencySubTypeRepository subTypeRepository,
            ServiceRequestRepository serviceRequestRepository,
            @Autowired(required = false) MongoTemplate mongoTemplate,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
        this.resourceRepository = resourceRepository;
        this.hospitalRepository = hospitalRepository;
        this.alertRepository = alertRepository;
        this.categoryRepository = categoryRepository;
        this.subTypeRepository = subTypeRepository;
        this.serviceRequestRepository = serviceRequestRepository;
        this.mongoTemplate = mongoTemplate;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedTaxonomy();

        // Hydrate from MongoDB Atlas cloud database if any portal-entered records exist
        if (mongoTemplate != null) {
            try {
                if (mongoTemplate.collectionExists("users")) {
                    List<User> atlasUsers = mongoTemplate.findAll(User.class, "users");
                    if (!atlasUsers.isEmpty() && userRepository.count() == 0) userRepository.saveAll(atlasUsers);
                }
                if (mongoTemplate.collectionExists("incidents")) {
                    List<Incident> atlasIncidents = mongoTemplate.findAll(Incident.class, "incidents");
                    if (!atlasIncidents.isEmpty() && incidentRepository.count() == 0) incidentRepository.saveAll(atlasIncidents);
                }
                if (mongoTemplate.collectionExists("alerts")) {
                    List<Alert> atlasAlerts = mongoTemplate.findAll(Alert.class, "alerts");
                    if (!atlasAlerts.isEmpty() && alertRepository.count() == 0) alertRepository.saveAll(atlasAlerts);
                }
                if (mongoTemplate.collectionExists("resources")) {
                    List<Resource> atlasResources = mongoTemplate.findAll(Resource.class, "resources");
                    if (!atlasResources.isEmpty() && resourceRepository.count() == 0) resourceRepository.saveAll(atlasResources);
                }
                if (mongoTemplate.collectionExists("hospitals")) {
                    List<Hospital> atlasHospitals = mongoTemplate.findAll(Hospital.class, "hospitals");
                    if (!atlasHospitals.isEmpty() && hospitalRepository.count() == 0) hospitalRepository.saveAll(atlasHospitals);
                }
            } catch (Exception e) {
                log.warn("MongoDB Atlas sync check notice: {}", e.getMessage());
            }
        }

        seedUsers();
        seedIncidents();
        seedResources();
        seedServiceRequests();
        seedHistoricalIncidents();

        log.info("ResQGrid initialized with full 9-department data and credentials ready.");
    }

    private void seedUsers() {
        // Super Admins
        upsertUser("David Chandler (Super Admin)", "david.chandler@resqgrid.gov", "admin123", "SUPER_ADMIN", null, "+91 90000 00000", "ResQGrid Command & Control Center");
        upsertUser("Super Admin Control", "superadmin@resqgrid.gov", "superadmin123", "SUPER_ADMIN", null, "+91 90000 00001", "ResQGrid Command & Control Center");

        // 9 Department Admins
        upsertUser("Commander Rajesh Rao (Flood Admin)", "flood.admin@resqgrid.gov", "floodadmin123", "DEPARTMENT_ADMIN", "FLOOD", "+91 98234 56789", "NDRF Flood Command");
        upsertUser("Captain Suresh Kumar (Fire Admin)", "fire.admin@resqgrid.gov", "fireadmin123", "DEPARTMENT_ADMIN", "FIRE", "+91 98234 56790", "Vadodara Fire Department");
        upsertUser("Dr. Sunita Patel (Medical Admin)", "medical.admin@resqgrid.gov", "medadmin123", "DEPARTMENT_ADMIN", "MEDICAL", "+91 98111 22334", "SSG Hospital ER");
        upsertUser("Chief Devendra Joshi (Crash Admin)", "crash.admin@resqgrid.gov", "crashadmin123", "DEPARTMENT_ADMIN", "CRASH", "+91 98234 56797", "Highway Crash Response Division");
        upsertUser("Dr. Priya Nair (Hazmat Admin)", "hazmat.admin@resqgrid.gov", "hazmatadmin123", "DEPARTMENT_ADMIN", "HAZMAT", "+91 98234 56793", "Industrial Hazmat Command");
        upsertUser("Major Vikram Singh (Collapse Admin)", "collapse.admin@resqgrid.gov", "collapseadmin123", "DEPARTMENT_ADMIN", "COLLAPSE", "+91 98234 56792", "USAR Structural Collapse Wing");
        upsertUser("Director Anil Verma (Cyclone Admin)", "cyclone.admin@resqgrid.gov", "cycloneadmin123", "DEPARTMENT_ADMIN", "CYCLONE", "+91 98234 56798", "Cyclone Disaster Management");
        upsertUser("Captain Ankit Mehta (SAR Admin)", "rescue.admin@resqgrid.gov", "rescueadmin123", "DEPARTMENT_ADMIN", "SEARCH_RESCUE", "+91 98234 56796", "Mountain & Wilderness SAR Command");
        upsertUser("Inspector Ramesh Patel (Police Admin)", "police.admin@resqgrid.gov", "policeadmin123", "DEPARTMENT_ADMIN", "POLICE", "+91 98234 56794", "Vadodara Police Department");

        // Citizens
        upsertUser("Aarav Patel", "citizen@resqgrid.gov", "citizen123", "CITIZEN", null, "+91 97234 11223", "Citizen Community Network");
        upsertUser("Aarav Patel", "citizen@resqgrid.org", "citizen123", "CITIZEN", null, "+91 97234 11223", "Citizen Community Network");
    }

    private void upsertUser(String name, String email, String rawPassword, String role, String departmentCategory, String phone, String organization) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .departmentCategory(departmentCategory)
                    .phone(phone)
                    .organization(organization)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(user);
            log.info("Created user: {} ({}) with role {}", email, name, role);
        } else {
            boolean updated = false;
            if (user.getPassword() == null || !user.getPassword().startsWith("$2a$")) {
                user.setPassword(passwordEncoder.encode(rawPassword));
                updated = true;
            }
            if (role != null && !role.equalsIgnoreCase(user.getRole())) {
                user.setRole(role);
                updated = true;
            }
            if (departmentCategory != null && !departmentCategory.equalsIgnoreCase(user.getDepartmentCategory())) {
                user.setDepartmentCategory(departmentCategory);
                updated = true;
            }
            if (updated) {
                userRepository.save(user);
            }
        }
        if (mongoTemplate != null && user != null) {
            try {
                mongoTemplate.save(user, "users");
            } catch (Exception ignored) {}
        }
    }

    private void seedIncidents() {
        if (incidentRepository.count() >= 9) {
            return;
        }

        List<Incident> sampleIncidents = Arrays.asList(
                Incident.builder()
                        .id("INC-2026-001")
                        .title("Flash Flood Inundation near Vishwamitri Bridge")
                        .type("FLOOD")
                        .category("FLOOD")
                        .description("Water level rising rapidly over 4 feet near bridge. 12 stranded residents reported on rooftops.")
                        .severity(4)
                        .status("Reported")
                        .locationName("Vishwamitri River Bridge, Vadodara")
                        .lat(22.3100)
                        .lng(73.1800)
                        .reporterRole("Citizen")
                        .reporterEmail("citizen@resqgrid.gov")
                        .reporterName("Aarav Patel")
                        .reporterPhone("+91 97234 11223")
                        .aiSummary("Critical urban flood surge. Requires boat deployment.")
                        .aiConfidence(0.95)
                        .requiredCapabilities(Arrays.asList("Water Rescue", "Inflatable Boat"))
                        .reportedAt(LocalDateTime.now().minusMinutes(50))
                        .build(),

                Incident.builder()
                        .id("INC-2026-002")
                        .title("Structural Fire at Chemical Warehouse")
                        .type("FIRE")
                        .category("FIRE")
                        .description("Dense chemical smoke reported in GIDC Nandesari industrial block. Explosion risk.")
                        .severity(5)
                        .status("En Route")
                        .assignedUnitId("RES-002")
                        .assignedResourceIds(Arrays.asList("RES-002"))
                        .locationName("GIDC Nandesari Industrial Estate")
                        .lat(22.3500)
                        .lng(73.1500)
                        .reporterRole("Citizen")
                        .reporterEmail("citizen@resqgrid.gov")
                        .aiSummary("Level-5 Chemical & Structural Fire. Hazmat & foam tender required.")
                        .aiConfidence(0.98)
                        .requiredCapabilities(Arrays.asList("Fire Engine", "Foam Tender", "Hazmat Unit"))
                        .reportedAt(LocalDateTime.now().minusMinutes(35))
                        .build(),

                Incident.builder()
                        .id("INC-2026-003")
                        .title("Highway Multi-Vehicle Crash & Medical Emergency")
                        .type("MEDICAL")
                        .category("MEDICAL")
                        .description("Collided bus and tanker near Golden Chowkdi. 3 injured passengers need critical evacuation.")
                        .severity(3)
                        .status("Assigned")
                        .assignedUnitId("RES-003")
                        .assignedResourceIds(Arrays.asList("RES-003"))
                        .locationName("Golden Chowkdi, NH-48")
                        .lat(22.3300)
                        .lng(73.2200)
                        .reporterRole("Citizen")
                        .reporterEmail("citizen@resqgrid.gov")
                        .aiSummary("Medical emergency requiring ambulance and trauma response.")
                        .aiConfidence(0.91)
                        .requiredCapabilities(Arrays.asList("Emergency Medical", "Advanced Ambulance"))
                        .reportedAt(LocalDateTime.now().minusMinutes(25))
                        .build(),

                Incident.builder()
                        .id("INC-2026-004")
                        .title("Multi-Car Pileup on Expressway NH-48")
                        .type("CRASH")
                        .category("CRASH")
                        .description("Five vehicles collided with one overturned heavy truck blocking two lanes.")
                        .severity(4)
                        .status("Reported")
                        .locationName("NH-48 Milepost 114, Vadodara Bypass")
                        .lat(22.3420)
                        .lng(73.2150)
                        .reporterRole("Citizen")
                        .reporterEmail("citizen@resqgrid.gov")
                        .aiSummary("Major highway crash with entrapment risk.")
                        .aiConfidence(0.93)
                        .requiredCapabilities(Arrays.asList("Extrication Equipment", "Heavy Tow"))
                        .reportedAt(LocalDateTime.now().minusMinutes(18))
                        .build(),

                Incident.builder()
                        .id("INC-2026-005")
                        .title("Ammonia Pipeline Rupture in Fertilizer Zone")
                        .type("HAZMAT")
                        .category("HAZMAT")
                        .description("High-pressure vapor cloud detected near valve station. Evacuation radius 800m.")
                        .severity(5)
                        .status("Reported")
                        .locationName("GSFC Plant Area 3, Fertilizer Nagar")
                        .lat(22.3680)
                        .lng(73.1420)
                        .reporterRole("Operator")
                        .reporterEmail("operator@resqgrid.gov")
                        .aiSummary("Hazardous chemical leak requiring Level-A HAZMAT protective response.")
                        .aiConfidence(0.97)
                        .requiredCapabilities(Arrays.asList("HAZMAT Level A", "Decontamination"))
                        .reportedAt(LocalDateTime.now().minusMinutes(12))
                        .build(),

                Incident.builder()
                        .id("INC-2026-006")
                        .title("Commercial Complex Structural Partial Collapse")
                        .type("COLLAPSE")
                        .category("COLLAPSE")
                        .description("Underground parking excavation collapse caused partial wall failure. 4 workers trapped.")
                        .severity(5)
                        .status("Reported")
                        .locationName("Alkapuri Commercial Plaza, RC Dutt Road")
                        .lat(22.3120)
                        .lng(73.1710)
                        .reporterRole("Citizen")
                        .reporterEmail("citizen@resqgrid.gov")
                        .aiSummary("Structural collapse with void entrapment.")
                        .aiConfidence(0.96)
                        .requiredCapabilities(Arrays.asList("USAR Team", "Concrete Breaker", "Search Dogs"))
                        .reportedAt(LocalDateTime.now().minusMinutes(10))
                        .build(),

                Incident.builder()
                        .id("INC-2026-007")
                        .title("Category 3 Cyclone Inundation & Wind Damage")
                        .type("CYCLONE")
                        .category("CYCLONE")
                        .description("High-speed gales 110 km/h uprooted massive trees and severed overhead power lines.")
                        .severity(4)
                        .status("Reported")
                        .locationName("Sayaji Garden & Perimeter Road")
                        .lat(22.3160)
                        .lng(73.1890)
                        .reporterRole("Citizen")
                        .reporterEmail("citizen@resqgrid.gov")
                        .aiSummary("Cyclone damage with downed live power lines.")
                        .aiConfidence(0.89)
                        .requiredCapabilities(Arrays.asList("Tree Clearing", "High Voltage Crew", "Debris Clearance"))
                        .reportedAt(LocalDateTime.now().minusMinutes(8))
                        .build(),

                Incident.builder()
                        .id("INC-2026-008")
                        .title("Lost Trekkers in Pavagadh Forest Ridge")
                        .type("SEARCH_RESCUE")
                        .category("SEARCH_RESCUE")
                        .description("A group of 3 hikers failed to return before dusk; last contact near northern ridge cliff.")
                        .severity(3)
                        .status("Reported")
                        .locationName("Pavagadh Hill North Trail, Ridge Sector 4")
                        .lat(22.4600)
                        .lng(73.5200)
                        .reporterRole("Citizen")
                        .reporterEmail("citizen@resqgrid.gov")
                        .aiSummary("Wilderness search and rescue operation with night-vision and thermal drones required.")
                        .aiConfidence(0.92)
                        .requiredCapabilities(Arrays.asList("Thermal Drone", "Rope Rescue", "Search Dogs"))
                        .reportedAt(LocalDateTime.now().minusMinutes(4))
                        .build(),

                Incident.builder()
                        .id("INC-2026-009")
                        .title("Perimeter Breach & Civil Disturbance near Substation")
                        .type("POLICE")
                        .category("POLICE")
                        .description("Unruly mob attempting unauthorized access to primary electrical grid station.")
                        .severity(3)
                        .status("Reported")
                        .locationName("Makarpura Substation West Gate")
                        .lat(22.2580)
                        .lng(73.1950)
                        .reporterRole("Operator")
                        .reporterEmail("operator@resqgrid.gov")
                        .aiSummary("Civil crowd control and perimeter security enforcement required.")
                        .aiConfidence(0.94)
                        .requiredCapabilities(Arrays.asList("Crowd Control", "Barricades", "Tactical Unit"))
                        .reportedAt(LocalDateTime.now().minusMinutes(2))
                        .build()
        );

        for (Incident inc : sampleIncidents) {
            if (!incidentRepository.existsById(inc.getId())) {
                incidentRepository.save(inc);
            }
        }
    }

    /**
     * Seeds a spread of historical/varied incidents (mostly resolved, across all 9 categories,
     * with realistic reportedAt/dispatchedAt/resolvedAt timestamps) so analytics charts —
     * category volume, severity distribution, status mix, response-time percentiles, SLA
     * compliance and the hourly trend — render with meaningful, dynamic data.
     */
    private void seedHistoricalIncidents() {
        if (incidentRepository.count() >= 30) {
            return;
        }
        log.info("Seeding historical incident dataset to enrich analytics charts...");

        String[] cats = {"FLOOD", "FIRE", "MEDICAL", "CRASH", "HAZMAT", "COLLAPSE", "CYCLONE", "SEARCH_RESCUE", "POLICE"};
        String[] locations = {"Alkapuri", "Sayajigunj", "Manjalpur", "Gotri Road", "Waghodia", "Karelibaug", "Fatehgunj", "Akota", "Sama", "Nizampura"};
        java.util.Random rnd = new java.util.Random(42);
        LocalDateTime now = LocalDateTime.now();

        int startIdx = 20; // avoid clashing with INC-2026-001..009 and SOS ids
        java.util.List<Incident> batch = new java.util.ArrayList<>();
        for (int i = 0; i < 22; i++) {
            String cat = cats[i % cats.length];
            int severity = 1 + rnd.nextInt(5);
            int reportedMinutesAgo = 20 + rnd.nextInt(460); // within last ~8 hours
            LocalDateTime reportedAt = now.minusMinutes(reportedMinutesAgo);
            int slaMinutes = severity >= 4 ? 10 : 15;

            // ~70% resolved, rest spread across active statuses
            int roll = rnd.nextInt(10);
            String status;
            LocalDateTime dispatchedAt = null;
            LocalDateTime resolvedAt = null;
            String assignedUnit = null;

            int responseMinutes = 2 + rnd.nextInt(14); // 2..15 min response
            if (roll < 7) {
                status = "Resolved";
                dispatchedAt = reportedAt.plusMinutes(responseMinutes);
                resolvedAt = dispatchedAt.plusMinutes(15 + rnd.nextInt(60));
                assignedUnit = "RES-00" + (1 + (i % 9));
            } else if (roll == 7) {
                status = "On-Scene";
                dispatchedAt = reportedAt.plusMinutes(responseMinutes);
                assignedUnit = "RES-00" + (1 + (i % 9));
            } else if (roll == 8) {
                status = "En-Route";
                dispatchedAt = reportedAt.plusMinutes(responseMinutes);
                assignedUnit = "RES-00" + (1 + (i % 9));
            } else {
                status = "Reported";
            }

            String id = String.format("INC-2026-%03d", startIdx + i);
            if (incidentRepository.existsById(id)) continue;

            Incident inc = Incident.builder()
                    .id(id)
                    .title(cat.substring(0, 1) + cat.substring(1).toLowerCase().replace("_", " ") + " incident at " + locations[i % locations.length])
                    .type(cat)
                    .category(cat)
                    .description("Auto-seeded historical " + cat + " incident for analytics enrichment.")
                    .severity(severity)
                    .status(status)
                    .assignedUnitId(assignedUnit)
                    .assignedResourceIds(assignedUnit != null ? Arrays.asList(assignedUnit) : new java.util.ArrayList<>())
                    .locationName(locations[i % locations.length] + ", Vadodara")
                    .lat(22.28 + rnd.nextDouble() * 0.12)
                    .lng(73.14 + rnd.nextDouble() * 0.10)
                    .reporterRole("Citizen")
                    .reporterEmail("citizen@resqgrid.gov")
                    .reporterName("Aarav Patel")
                    .affectedPeople(rnd.nextInt(20))
                    .casualties(severity >= 4 ? rnd.nextInt(6) : rnd.nextInt(2))
                    .slaMinutes(slaMinutes)
                    .aiConfidence(0.80 + rnd.nextDouble() * 0.19)
                    .reportedAt(reportedAt)
                    .dispatchedAt(dispatchedAt)
                    .resolvedAt(resolvedAt)
                    .build();
            batch.add(inc);
        }

        incidentRepository.saveAll(batch);
        log.info("Seeded {} historical incidents for analytics.", batch.size());
    }

    private void seedResources() {
        log.info("Seeding ResQGrid Units for all 9 departments into Resource Registry...");
        List<Resource> seedResources = Arrays.asList(
                new Resource("RES-001", "NDRF Water Rescue Team 01", "Water Rescue", "Available", 22.3100, 73.1800, "Jarod Base", "+91 98234 56789", "Commander Rajesh Rao", 12, Arrays.asList("WATER_RESCUE", "INFLATABLE_BOAT", "HEAVY_PUMP"), null, "WATER-01", "FLOOD"),
                new Resource("RES-002", "Vadodara Fire Tender 04", "Fire & Rescue", "En-Route", 22.3050, 73.1780, "Dandiyabazar Fire Station", "+91 98234 56790", "Captain Suresh Kumar", 6, Arrays.asList("FIRE_ENGINE", "FOAM_TENDER", "LADDER_TRUCK"), "INC-2026-002", "ENGINE-04", "FIRE"),
                new Resource("RES-003", "SSG Trauma ALS Ambulance 02", "Advanced Ambulance", "On-Scene", 22.3020, 73.1880, "SSG Hospital ER", "+91 98234 56791", "Dr. Amit Shah", 4, Arrays.asList("ADVANCED_AMBULANCE", "TRAUMA_TEAM", "PARAMEDIC_TEAM"), "INC-2026-003", "MEDIC-02", "MEDICAL"),
                new Resource("RES-004", "Highway Crash Extrication Unit 01", "Crash & Extrication", "Available", 22.3400, 73.2100, "Golden Chowkdi Depot", "+91 98234 56797", "Chief Devendra Joshi", 5, Arrays.asList("EXTRICATION_EQUIPMENT", "HYDRAULIC_CUTTER", "HEAVY_TOW"), null, "CRASH-01", "CRASH"),
                new Resource("RES-005", "Hazmat Decon Unit 01", "Hazmat Unit", "Available", 22.3150, 73.1950, "GSFC Industrial Complex", "+91 98234 56793", "Inspector Priya Nair", 8, Arrays.asList("HAZMAT_SUIT_LEVEL_A", "GAS_DETECTOR", "DECONTAMINATION_UNIT"), null, "HAZMAT-01", "HAZMAT"),
                new Resource("RES-006", "USAR Heavy Collapse Rescue 01", "Urban Search & Rescue", "Available", 22.3380, 73.1740, "Gorwa USAR Station", "+91 98234 56792", "Major Vikram Singh", 15, Arrays.asList("SEARCH_DOGS", "CONCRETE_CUTTER", "HEAVY_CRANE"), null, "COLLAPSE-01", "COLLAPSE"),
                new Resource("RES-007", "Cyclone Rapid Response & Utility 01", "Cyclone Relief", "Available", 22.3250, 73.1850, "Akota Utility Depot", "+91 98234 56798", "Director Anil Verma", 10, Arrays.asList("EMERGENCY_GENERATOR", "TREE_TRIMMER", "DEBRIS_CLEARER"), null, "CYCLONE-01", "CYCLONE"),
                new Resource("RES-008", "Specialized K9 & SAR Search Unit 01", "Search & Rescue", "Available", 22.3100, 73.1750, "Gotri SAR Command", "+91 98234 56796", "Captain Ankit Mehta", 5, Arrays.asList("DRONE_THERMAL", "SEARCH_DOGS", "ROPE_RESCUE"), null, "SAR-01", "SEARCH_RESCUE"),
                new Resource("RES-009", "Vadodara Police Tactical Unit 01", "Tactical & Patrol", "Available", 22.3200, 73.1700, "Alkapuri Police Station", "+91 98234 56794", "Inspector Ramesh Patel", 8, Arrays.asList("TRAFFIC_CONTROL", "CROWD_CONTROL", "BARRICADES"), null, "POLICE-01", "POLICE")
        );

        for (Resource res : seedResources) {
            resourceRepository.save(res);
            if (mongoTemplate != null) {
                try {
                    mongoTemplate.save(res, "resources");
                } catch (Exception ignored) {}
            }
        }
        sanitizeResourceData();
    }

    private void seedServiceRequests() {
        if (serviceRequestRepository.count() > 0) {
            return;
        }

        log.info("Seeding cross-department service requests...");
        ServiceRequest req1 = new ServiceRequest(
                null,
                "INC-2026-001",
                "FLOOD",
                "FIRE",
                "High-capacity de-watering submersible pump needed at Vishwamitri bridge pillar immediately.",
                "CRITICAL",
                "PENDING",
                null,
                null,
                LocalDateTime.now().minusMinutes(15),
                LocalDateTime.now().minusMinutes(15)
        );

        ServiceRequest req2 = new ServiceRequest(
                null,
                "INC-2026-002",
                "FIRE",
                "MEDICAL",
                "Burn triage unit and 2 paramedics required on standby during chemical warehouse extinguishment.",
                "HIGH",
                "ACCEPTED",
                "RES-003",
                null,
                LocalDateTime.now().minusMinutes(22),
                LocalDateTime.now().minusMinutes(10)
        );

        ServiceRequest req3 = new ServiceRequest(
                null,
                "INC-2026-004",
                "CRASH",
                "POLICE",
                "Expressway lane closure and traffic diversion team needed at Golden Chowkdi crash site.",
                "CRITICAL",
                "PENDING",
                null,
                null,
                LocalDateTime.now().minusMinutes(5),
                LocalDateTime.now().minusMinutes(5)
        );

        serviceRequestRepository.saveAll(Arrays.asList(req1, req2, req3));
    }

    private void sanitizeResourceData() {
        log.info("Sanitizing Resource registry statuses to purge invalid values like 'Resolved'...");
        List<Resource> allResources = resourceRepository.findAll();
        List<String> validStatuses = Arrays.asList("Available", "En-Route", "On-Scene", "Returning");
        for (Resource res : allResources) {
            String st = res.getStatus();
            boolean isInvalid = st == null || "Resolved".equalsIgnoreCase(st) || "Completed".equalsIgnoreCase(st) || validStatuses.stream().noneMatch(v -> v.equalsIgnoreCase(st));
            if (isInvalid) {
                log.info("Correcting invalid resource status for unit {} ({}) from '{}' to 'Available'", res.getId(), res.getName(), st);
                res.setStatus("Available");
                res.setAssignedIncidentId(null);
                resourceRepository.save(res);
                if (mongoTemplate != null) {
                    try {
                        mongoTemplate.save(res, "resources");
                    } catch (Exception e) {
                        log.warn("Mongo resource sanitize save notice for {}: {}", res.getId(), e.getMessage());
                    }
                }
            }
        }
    }

    private void seedTaxonomy() {
        if (categoryRepository.count() > 0) {
            return;
        }
        log.info("Seeding Phase 2 Emergency Taxonomy master categories and sub-types...");

        EmergencyCategory c1 = EmergencyCategory.builder()
                .id("CAT_FLOOD").name("Flood & Inundation").primaryDepartment("Disaster Management, Fire & Rescue")
                .defaultPriorityCode("P1").icon("🌊").color("#3b82f6")
                .description("Flash flood, river overflow, dam break, urban waterlogging")
                .defaultRequiredCapabilities(Arrays.asList("WATER_RESCUE", "INFLATABLE_BOAT", "HEAVY_PUMP", "TEMPORARY_SHELTER"))
                .build();

        EmergencyCategory c2 = EmergencyCategory.builder()
                .id("CAT_FIRE").name("Fire & Explosion").primaryDepartment("Fire & Rescue, Hazmat")
                .defaultPriorityCode("P1").icon("🔥").color("#ef4444")
                .description("Structural fire, wildfire, vehicle fire, industrial explosion")
                .defaultRequiredCapabilities(Arrays.asList("FIRE_ENGINE", "FOAM_TENDER", "LADDER_TRUCK", "BREATHING_APPARATUS"))
                .build();

        EmergencyCategory c3 = EmergencyCategory.builder()
                .id("CAT_MED").name("Medical & Mass Casualty").primaryDepartment("EMS / Ambulance, Hospitals")
                .defaultPriorityCode("P1").icon("🚑").color("#10b981")
                .description("Mass casualty incident, cardiac emergency, epidemic cluster")
                .defaultRequiredCapabilities(Arrays.asList("ADVANCED_AMBULANCE", "TRAUMA_TEAM", "ICU_BED_CAPACITY", "TRIAGE_KIT"))
                .build();

        EmergencyCategory c4 = EmergencyCategory.builder()
                .id("CAT_TRAFFIC").name("Road & Traffic Incident").primaryDepartment("Police, EMS, Highway Safety")
                .defaultPriorityCode("P2").icon("🚗").color("#f97316")
                .description("Multi-vehicle pile-up, hazmat tanker rollover, bridge blockage")
                .defaultRequiredCapabilities(Arrays.asList("EXTRICATION_EQUIPMENT", "TRAFFIC_CONTROL", "AMBULANCE", "TOW_TRUCK"))
                .build();

        EmergencyCategory c5 = EmergencyCategory.builder()
                .id("CAT_HAZMAT").name("Industrial & Hazmat").primaryDepartment("Hazmat Specialist Unit, Fire & Rescue")
                .defaultPriorityCode("P1").icon("☣️").color("#a855f7")
                .description("Chemical spill, toxic gas leak, radiation anomaly")
                .defaultRequiredCapabilities(Arrays.asList("HAZMAT_SUIT_LEVEL_A", "GAS_DETECTOR", "DECONTAMINATION_UNIT"))
                .build();

        EmergencyCategory c6 = EmergencyCategory.builder()
                .id("CAT_COLLAPSE").name("Structural Failure").primaryDepartment("Urban Search & Rescue (USAR), Engineering")
                .defaultPriorityCode("P1").icon("🏚️").color("#eab308")
                .description("Building collapse, crane fall, bridge failure, trench cave-in")
                .defaultRequiredCapabilities(Arrays.asList("SEARCH_DOGS", "CONCRETE_CUTTER", "HEAVY_CRANE", "STRUCTURAL_ENGINEER"))
                .build();

        EmergencyCategory c7 = EmergencyCategory.builder()
                .id("CAT_SEISMIC").name("Geological & Seismic").primaryDepartment("Disaster Management, USAR")
                .defaultPriorityCode("P1").icon("🌋").color("#854d0e")
                .description("Earthquake, landslide, mudslide, sinkhole")
                .defaultRequiredCapabilities(Arrays.asList("USAR_TEAM", "EARTHMOVER", "GEOLOGICAL_SURVEYOR", "SHELTER_KIT"))
                .build();

        EmergencyCategory c8 = EmergencyCategory.builder()
                .id("CAT_STORM").name("Weather & Meteorological").primaryDepartment("Disaster Management, Power Utility")
                .defaultPriorityCode("P2").icon("🌪️").color("#06b6d4")
                .description("Cyclone, hurricane, severe blizzard, heatwave")
                .defaultRequiredCapabilities(Arrays.asList("TREE_TRIMMER", "POWER_RESTORATION_CREW", "EMERGENCY_GENERATOR"))
                .build();

        EmergencyCategory c9 = EmergencyCategory.builder()
                .id("CAT_UTILITY").name("Utility & Infrastructure").primaryDepartment("Public Utilities Department")
                .defaultPriorityCode("P3").icon("⚡").color("#6366f1")
                .description("Main power grid failure, water main break, telecom blackout")
                .defaultRequiredCapabilities(Arrays.asList("HIGH_VOLTAGE_CREW", "WATER_REPAIR_CREW", "GENSET_MOBILE"))
                .build();

        EmergencyCategory c10 = EmergencyCategory.builder()
                .id("CAT_SAR").name("Search & Rescue").primaryDepartment("Police, Search & Rescue Volunteers")
                .defaultPriorityCode("P2").icon("🔍").color("#ec4899")
                .description("Wilderness missing person, cave/well rescue, water rescue")
                .defaultRequiredCapabilities(Arrays.asList("DRONE_THERMAL", "SEARCH_DOGS", "NIGHT_VISION", "ROPE_RESCUE"))
                .build();

        EmergencyCategory c11 = EmergencyCategory.builder()
                .id("CAT_HAZARD").name("Environmental Hazard").primaryDepartment("Environmental Protection Agency")
                .defaultPriorityCode("P3").icon("⚠️").color("#14b8a6")
                .description("Oil spill, beach contamination, biohazard dumping")
                .defaultRequiredCapabilities(Arrays.asList("BOOM_BARRIER", "SKIMMER", "CONTAINMENT_VESSEL"))
                .build();

        EmergencyCategory c12 = EmergencyCategory.builder()
                .id("CAT_SECURITY").name("Public Safety & Crowd").primaryDepartment("Police Department")
                .defaultPriorityCode("P1").icon("🛡️").color("#64748b")
                .description("Civil disturbance, stampede risk, VIP security incident")
                .defaultRequiredCapabilities(Arrays.asList("CROWD_CONTROL", "BARRICADES", "TACTICAL_UNIT"))
                .build();

        List<EmergencyCategory> allCats = Arrays.asList(c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12);
        categoryRepository.saveAll(allCats);

        // Subtypes
        List<EmergencySubType> subTypes = Arrays.asList(
                EmergencySubType.builder().id("SUB_FL_FLASH").categoryId("CAT_FLOOD").name("Flash Flood Inundation")
                        .primaryDepartment("Disaster Management").defaultSeverity(5).dispatchSlaMins(5).maxResponseSlaMins(15)
                        .defaultCapabilities(Arrays.asList("WATER_RESCUE", "INFLATABLE_BOAT", "HIGH_CAPACITY_PUMP")).build(),
                EmergencySubType.builder().id("SUB_FL_RIVER").categoryId("CAT_FLOOD").name("River / Dam Overflow")
                        .primaryDepartment("Disaster Management").defaultSeverity(5).dispatchSlaMins(5).maxResponseSlaMins(15)
                        .defaultCapabilities(Arrays.asList("WATER_RESCUE", "HEAVY_PUMP", "TEMPORARY_SHELTER")).build(),
                EmergencySubType.builder().id("SUB_FL_URBAN").categoryId("CAT_FLOOD").name("Urban Waterlogging")
                        .primaryDepartment("Fire & Rescue").defaultSeverity(3).dispatchSlaMins(30).maxResponseSlaMins(60)
                        .defaultCapabilities(Arrays.asList("DRAINAGE_UNIT", "TRAFFIC_BARRICADE")).build(),

                EmergencySubType.builder().id("SUB_FR_STRUCT").categoryId("CAT_FIRE").name("Structural / Building Fire")
                        .primaryDepartment("Fire & Rescue").defaultSeverity(4).dispatchSlaMins(15).maxResponseSlaMins(30)
                        .defaultCapabilities(Arrays.asList("FIRE_ENGINE", "LADDER_TRUCK", "BREATHING_APPARATUS")).build(),
                EmergencySubType.builder().id("SUB_FR_WILD").categoryId("CAT_FIRE").name("Wildfire / Forest Fire")
                        .primaryDepartment("Fire & Rescue").defaultSeverity(4).dispatchSlaMins(15).maxResponseSlaMins(30)
                        .defaultCapabilities(Arrays.asList("FOREST_FIRE_TRUCK", "WATER_BOMBER_LIAISON")).build(),
                EmergencySubType.builder().id("SUB_FR_INDUS").categoryId("CAT_FIRE").name("Industrial / Chemical Fire")
                        .primaryDepartment("Fire & Rescue + Hazmat").defaultSeverity(5).dispatchSlaMins(5).maxResponseSlaMins(15)
                        .defaultCapabilities(Arrays.asList("FOAM_TENDER", "HAZMAT_SUIT", "GAS_DETECTOR")).build(),

                EmergencySubType.builder().id("SUB_MD_MASS").categoryId("CAT_MED").name("Mass Casualty Incident")
                        .primaryDepartment("EMS / Hospitals").defaultSeverity(5).dispatchSlaMins(5).maxResponseSlaMins(15)
                        .defaultCapabilities(Arrays.asList("ADVANCED_AMBULANCE", "TRAUMA_TEAM", "ICU_BEDS")).build(),
                EmergencySubType.builder().id("SUB_MD_CRIT").categoryId("CAT_MED").name("Individual Critical Medical")
                        .primaryDepartment("EMS").defaultSeverity(4).dispatchSlaMins(15).maxResponseSlaMins(30)
                        .defaultCapabilities(Arrays.asList("BASIC_AMBULANCE", "PARAMEDIC_TEAM")).build(),

                EmergencySubType.builder().id("SUB_TR_COLL").categoryId("CAT_TRAFFIC").name("Multi-Vehicle Highway Collision")
                        .primaryDepartment("Police + EMS + Fire").defaultSeverity(4).dispatchSlaMins(15).maxResponseSlaMins(30)
                        .defaultCapabilities(Arrays.asList("EXTRICATION_EQUIPMENT", "AMBULANCE", "TRAFFIC_CONTROL")).build(),
                EmergencySubType.builder().id("SUB_TR_HAZ").categoryId("CAT_TRAFFIC").name("Tanker Rollover (Hazmat)")
                        .primaryDepartment("Fire + Hazmat + Police").defaultSeverity(5).dispatchSlaMins(5).maxResponseSlaMins(15)
                        .defaultCapabilities(Arrays.asList("HAZMAT_CONTAINMENT", "TRAFFIC_DIVERSION")).build(),

                EmergencySubType.builder().id("SUB_HZ_GAS").categoryId("CAT_HAZMAT").name("Toxic Gas Leak")
                        .primaryDepartment("Hazmat Specialist").defaultSeverity(5).dispatchSlaMins(5).maxResponseSlaMins(15)
                        .defaultCapabilities(Arrays.asList("LEVEL_A_SUIT", "GAS_SEAL_KIT", "DECON_UNIT")).build(),
                EmergencySubType.builder().id("SUB_HZ_SPILL").categoryId("CAT_HAZMAT").name("Chemical / Acid Spill")
                        .primaryDepartment("Hazmat Specialist").defaultSeverity(4).dispatchSlaMins(15).maxResponseSlaMins(30)
                        .defaultCapabilities(Arrays.asList("NEUTRALIZATION_AGENT", "ABSORBENT_BOOM")).build(),

                EmergencySubType.builder().id("SUB_CL_BLDG").categoryId("CAT_COLLAPSE").name("Building Collapse")
                        .primaryDepartment("USAR + Engineering").defaultSeverity(5).dispatchSlaMins(5).maxResponseSlaMins(15)
                        .defaultCapabilities(Arrays.asList("SEARCH_DOGS", "CONCRETE_BREAKER", "CRANE")).build(),

                EmergencySubType.builder().id("SUB_SM_QUAKE").categoryId("CAT_SEISMIC").name("Earthquake / Landslide")
                        .primaryDepartment("Disaster Management").defaultSeverity(5).dispatchSlaMins(5).maxResponseSlaMins(15)
                        .defaultCapabilities(Arrays.asList("USAR_TEAM", "HEAVY_EARTHMOVER", "SHELTER_KIT")).build(),

                EmergencySubType.builder().id("SUB_ST_CYCL").categoryId("CAT_STORM").name("Cyclone / Typhoon")
                        .primaryDepartment("Disaster Management").defaultSeverity(4).dispatchSlaMins(15).maxResponseSlaMins(30)
                        .defaultCapabilities(Arrays.asList("TREE_CLEARER", "POWER_CREW", "GENSET")).build(),

                EmergencySubType.builder().id("SUB_UT_POWER").categoryId("CAT_UTILITY").name("Grid Power Blackout")
                        .primaryDepartment("Utility Dept").defaultSeverity(3).dispatchSlaMins(30).maxResponseSlaMins(60)
                        .defaultCapabilities(Arrays.asList("HIGH_VOLTAGE_CREW", "EMERGENCY_GENERATOR")).build(),

                EmergencySubType.builder().id("SUB_SR_MISS").categoryId("CAT_SAR").name("Missing Person / Wilderness")
                        .primaryDepartment("Police + Search Team").defaultSeverity(3).dispatchSlaMins(30).maxResponseSlaMins(60)
                        .defaultCapabilities(Arrays.asList("THERMAL_DRONE", "SEARCH_DOGS", "TRACKER")).build(),

                EmergencySubType.builder().id("SUB_HZ_ENV").categoryId("CAT_HAZARD").name("Oil Spill / Environmental")
                        .primaryDepartment("Environmental Protection Agency").defaultSeverity(3).dispatchSlaMins(30).maxResponseSlaMins(60)
                        .defaultCapabilities(Arrays.asList("BOOM_BARRIER", "SKIMMER", "CONTAINMENT_VESSEL")).build(),

                EmergencySubType.builder().id("SUB_SC_CROWD").categoryId("CAT_SECURITY").name("Stampede / Crowd Risk")
                        .primaryDepartment("Police").defaultSeverity(4).dispatchSlaMins(15).maxResponseSlaMins(30)
                        .defaultCapabilities(Arrays.asList("CROWD_CONTROL", "TACTICAL_UNIT", "BARRICADES")).build()
        );
        subTypeRepository.saveAll(subTypes);

        if (mongoTemplate != null) {
            try {
                allCats.forEach(c -> mongoTemplate.save(c, "emergency_categories"));
                subTypes.forEach(s -> mongoTemplate.save(s, "emergency_sub_types"));
                log.info("MongoDB seeded with emergency_categories and emergency_sub_types collections!");
            } catch (Exception e) {
                log.warn("Mongo taxonomy seeding notice: {}", e.getMessage());
            }
        }
        log.info("Phase 2 Emergency Taxonomy seeded successfully (12 categories, {} sub-types).", subTypes.size());
    }
}
