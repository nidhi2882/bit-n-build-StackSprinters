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

        // Ensure baseline operator and citizen accounts exist if database is fresh
        if (userRepository.count() == 0) {
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

            User citizen = User.builder()
                    .name("Aarav Patel")
                    .email("citizen@resqgrid.org")
                    .password("citizen123")
                    .role("Citizen")
                    .phone("+91 97234 11223")
                    .organization("Citizen Community Network (Akota)")
                    .createdAt(LocalDateTime.now())
                    .build();

            List<User> initialUsers = Arrays.asList(operator, responder, hospitalAdmin, authority, citizen);
            userRepository.saveAll(initialUsers);
            if (mongoTemplate != null) {
                try {
                    initialUsers.forEach(u -> mongoTemplate.save(u, "users"));
                } catch (Exception e) {
                    log.warn("Mongo user seeding notice: {}", e.getMessage());
                }
            }
        }

        log.info("ResQGrid initialized with clean state. All incident and emergency reports enter exclusively through the web portal.");
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
