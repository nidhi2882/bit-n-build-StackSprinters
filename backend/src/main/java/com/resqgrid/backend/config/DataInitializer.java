package com.resqgrid.backend.config;

import com.resqgrid.backend.entity.*;
import com.resqgrid.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

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
    private final MongoTemplate mongoTemplate;

    @Autowired
    public DataInitializer(
            UserRepository userRepository,
            IncidentRepository incidentRepository,
            ResourceRepository resourceRepository,
            HospitalRepository hospitalRepository,
            AlertRepository alertRepository,
            EmergencyCategoryRepository categoryRepository,
            EmergencySubTypeRepository subTypeRepository,
            @Autowired(required = false) MongoTemplate mongoTemplate) {
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
        this.resourceRepository = resourceRepository;
        this.hospitalRepository = hospitalRepository;
        this.alertRepository = alertRepository;
        this.categoryRepository = categoryRepository;
        this.subTypeRepository = subTypeRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
        seedTaxonomy();

        if (mongoTemplate != null) {
            try {
                if (!mongoTemplate.collectionExists("incidents") || mongoTemplate.getCollection("incidents").countDocuments() == 0) {
                    log.info("Populating MongoDB database 'resqgrid'...");
                }
            } catch (Exception e) {
                log.warn("Mongo check notice: {}", e.getMessage());
            }
        }

        if (incidentRepository.count() > 0 && mongoTemplate != null && mongoTemplate.collectionExists("incidents") && mongoTemplate.getCollection("incidents").countDocuments() > 0) {
            log.info("Database already seeded with demo emergency data.");
            return;
        }

        log.info("Seeding ResQGrid initial demo emergency datasets...");

        // 1. Seed Users for All 5 Roles
        User operator = User.builder()
                .name("Vikram Mehta")
                .email("operator@resqgrid.gov")
                .password("operator123")
                .role("Emergency Operator")
                .phone("+91 98765 43210")
                .organization("Vadodara Emergency Response Center (VERC)")
                .createdAt(LocalDateTime.now())
                .build();

        User responder = User.builder()
                .name("Commander Rajesh Rao")
                .email("responder@ndrf.gov")
                .password("responder123")
                .role("Response Team")
                .phone("+91 98234 56789")
                .organization("6th Bn NDRF Jarod")
                .createdAt(LocalDateTime.now())
                .build();

        User hospitalAdmin = User.builder()
                .name("Dr. Sunita Patel")
                .email("hospital@ssg.org")
                .password("hospital123")
                .role("Hospital Admin")
                .phone("+91 98111 22334")
                .organization("SSG Hospital Trauma Center")
                .createdAt(LocalDateTime.now())
                .build();

        User authority = User.builder()
                .name("Collector Ananya Sharma, IAS")
                .email("authority@vadodara.gov")
                .password("authority123")
                .role("Authority Admin")
                .phone("+91 98000 11223")
                .organization("District Disaster Management Authority (DDMA)")
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.saveAll(Arrays.asList(operator, responder, hospitalAdmin, authority));

        // 2. Seed Resources (Teams, Vehicles, Equipment)
        Resource res1 = Resource.builder()
                .id("RES-001")
                .name("NDRF Water Rescue Squad 03")
                .type("NDRF Water Rescue")
                .status("Available")
                .lat(22.3180)
                .lng(73.1650)
                .baseStation("Jarod NDRF Base")
                .contact("+91 98251 12345")
                .teamLeader("Insp. Rajesh Rao")
                .personnelCount(12)
                .capabilities(Arrays.asList("Water Rescue", "Inflatable Boat", "Diving Team", "First Aid"))
                .build();

        Resource res2 = Resource.builder()
                .id("RES-002")
                .name("Fire & Rescue Unit Heavy Tender 02")
                .type("Fire Engine")
                .status("Assigned")
                .lat(22.2950)
                .lng(73.2050)
                .baseStation("Dandia Bazar Fire Station")
                .contact("+91 98252 23456")
                .teamLeader("Station Officer K. Solanki")
                .personnelCount(6)
                .capabilities(Arrays.asList("Fire Engine", "Hydraulic Cutter", "Foam Tender"))
                .assignedIncidentId("INC-2026-002")
                .build();

        Resource res3 = Resource.builder()
                .id("RES-003")
                .name("108 Advanced Life Support Ambulance 07")
                .type("Advanced Ambulance")
                .status("Available")
                .lat(22.3010)
                .lng(73.1820)
                .baseStation("SSG Hospital Trauma Bay")
                .contact("+91 98253 34567")
                .teamLeader("Paramedic Anita Joshi")
                .personnelCount(3)
                .capabilities(Arrays.asList("Emergency Medical", "Cardiac Defibrillator", "Ventilator", "Oxygen Supply"))
                .build();

        Resource res4 = Resource.builder()
                .id("RES-004")
                .name("State Hazmat Neutralization Squad")
                .type("Hazmat Unit")
                .status("Available")
                .lat(22.3350)
                .lng(73.1550)
                .baseStation("Nandesari Industrial Center")
                .contact("+91 98254 45678")
                .teamLeader("Dr. P. Trivedi")
                .personnelCount(8)
                .capabilities(Arrays.asList("Chemical Containment", "Hazmat Suits", "Gas Scrubbers", "Decontamination"))
                .build();

        resourceRepository.saveAll(Arrays.asList(res1, res2, res3, res4));

        // 3. Seed Hospitals
        Hospital h1 = Hospital.builder()
                .id("HOSP-001")
                .name("SSG Civil Hospital (Trauma Center)")
                .locationName("Jail Road, Anandpura, Vadodara")
                .lat(22.3040)
                .lng(73.1930)
                .contact("+91 265 2424848")
                .traumaBedsTotal(40)
                .traumaBedsOccupied(34)
                .icuBedsTotal(20)
                .icuBedsOccupied(17)
                .bloodUnitsAvailable(85)
                .ambulanceBayStatus("Clear")
                .status("Optimal")
                .build();

        Hospital h2 = Hospital.builder()
                .id("HOSP-002")
                .name("Sterling Multi-Specialty Hospital")
                .locationName("Race Course Circle, Alkapuri, Vadodara")
                .lat(22.3160)
                .lng(73.1720)
                .contact("+91 265 6644000")
                .traumaBedsTotal(25)
                .traumaBedsOccupied(23)
                .icuBedsTotal(15)
                .icuBedsOccupied(14)
                .bloodUnitsAvailable(42)
                .ambulanceBayStatus("Congested")
                .status("Near Capacity")
                .build();

        Hospital h3 = Hospital.builder()
                .id("HOSP-003")
                .name("Bhailal Amin General Hospital")
                .locationName("Gorwa, Vadodara")
                .lat(22.3320)
                .lng(73.1680)
                .contact("+91 265 6780000")
                .traumaBedsTotal(30)
                .traumaBedsOccupied(18)
                .icuBedsTotal(12)
                .icuBedsOccupied(8)
                .bloodUnitsAvailable(60)
                .ambulanceBayStatus("Clear")
                .status("Optimal")
                .build();

        hospitalRepository.saveAll(Arrays.asList(h1, h2, h3));

        // 4. Seed Incidents (Matches Vadodara Demo Flood Emergency Scenario)
        Incident inc1 = Incident.builder()
                .id("INC-2026-001")
                .type("Flood")
                .title("Flash Flood & Trapped Citizens")
                .description("Water levels reached 4 feet following dam release. 14 residents stranded on rooftop in Subhanpura.")
                .severity(5)
                .status("Reported")
                .locationName("Subhanpura Sector 4, Vadodara")
                .lat(22.3120)
                .lng(73.1750)
                .reportedAt(LocalDateTime.now().minusMinutes(10))
                .reporterRole("Citizen & Water Sensor Node-4")
                .aiSummary("High priority flash flood emergency. Trapped civilian casualties suspected. Immediate inflatable motor boat and diving team required.")
                .aiConfidence(0.96)
                .duplicateCount(3)
                .requiredCapabilities(Arrays.asList("Water Rescue", "Inflatable Boat", "Medical Evacuation"))
                .build();

        Incident inc2 = Incident.builder()
                .id("INC-2026-002")
                .type("Fire")
                .title("Commercial Building Structure Fire")
                .description("Heavy smoke and visible flames on 3rd floor of textile warehouse. Electrical short circuit suspected.")
                .severity(4)
                .status("Assigned")
                .locationName("GIDC Industrial Estate, Makarpura")
                .lat(22.2580)
                .lng(73.1980)
                .reportedAt(LocalDateTime.now().minusMinutes(22))
                .reporterRole("Industrial Security")
                .aiSummary("Structure fire in high-density industrial zone. Moderate risk of fire spreading to adjacent chemical storage unit.")
                .aiConfidence(0.91)
                .duplicateCount(1)
                .requiredCapabilities(Arrays.asList("Fire Engine", "Foam Tender", "Hazmat Shield"))
                .assignedResourceIds(List.of("RES-002"))
                .build();

        Incident inc3 = Incident.builder()
                .id("INC-2026-003")
                .type("Hazardous")
                .title("Ammonia Gas Leak at Processing Plant")
                .description("Pipe rupture reported during maintenance. Strong chemical odor affecting 300m radius.")
                .severity(4)
                .status("Classified")
                .locationName("Alkapuri Transport Hub")
                .lat(22.3100)
                .lng(73.1880)
                .reportedAt(LocalDateTime.now().minusMinutes(35))
                .reporterRole("Gas Sensor Array")
                .aiSummary("Toxic inhalant hazard detected. Perimeter evacuation advised. Hazmat neutralization squad required.")
                .aiConfidence(0.94)
                .duplicateCount(2)
                .requiredCapabilities(Arrays.asList("Chemical Containment", "Hazmat Suits"))
                .build();

        incidentRepository.saveAll(Arrays.asList(inc1, inc2, inc3));

        // 5. Seed Alerts
        Alert alert1 = Alert.builder()
                .id("ALT-001")
                .type("CRITICAL")
                .title("CRITICAL: 14 Citizens Trapped in Rising Flood")
                .message("Subhanpura Sector 4 - No rescue unit dispatched yet. Dam release water level increasing rapidly.")
                .time("10m ago")
                .incidentId("INC-2026-001")
                .actionRequired("Immediate NDRF Boat Assignment Required")
                .active(true)
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .build();

        Alert alert2 = Alert.builder()
                .id("ALT-002")
                .type("WARNING")
                .title("Hospital Capacity Warning: Sterling Multi-Specialty")
                .message("Trauma beds at 92% occupancy (23/25). Ambulances rerouted to SSG Civil Hospital.")
                .time("18m ago")
                .incidentId(null)
                .actionRequired("Reroute Ambulances")
                .active(true)
                .createdAt(LocalDateTime.now().minusMinutes(18))
                .build();

        alertRepository.saveAll(Arrays.asList(alert1, alert2));

        if (mongoTemplate != null) {
            try {
                log.info("Populating MongoDB database 'resqgrid'...");
                List<User> usersList = Arrays.asList(operator, responder, hospitalAdmin, authority);
                List<Resource> resourcesList = Arrays.asList(res1, res2, res3, res4);
                List<Hospital> hospitalsList = Arrays.asList(h1, h2, h3);
                List<Incident> incidentsList = Arrays.asList(inc1, inc2, inc3);
                List<Alert> alertsList = Arrays.asList(alert1, alert2);

                usersList.forEach(u -> mongoTemplate.save(u, "users"));
                resourcesList.forEach(r -> mongoTemplate.save(r, "resources"));
                hospitalsList.forEach(h -> mongoTemplate.save(h, "hospitals"));
                incidentsList.forEach(i -> mongoTemplate.save(i, "incidents"));
                alertsList.forEach(a -> mongoTemplate.save(a, "alerts"));
                log.info("MongoDB database 'resqgrid' successfully seeded with collections: users, resources, hospitals, incidents, alerts!");
            } catch (Exception e) {
                log.warn("Direct MongoDB seeding notice: {}", e.getMessage());
            }
        }

        log.info("ResQGrid demo datasets initialized successfully!");
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
