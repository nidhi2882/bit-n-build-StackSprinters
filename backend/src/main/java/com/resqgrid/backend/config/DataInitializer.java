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
    private final MongoTemplate mongoTemplate;

    @Autowired
    public DataInitializer(
            UserRepository userRepository,
            IncidentRepository incidentRepository,
            ResourceRepository resourceRepository,
            HospitalRepository hospitalRepository,
            AlertRepository alertRepository,
            @Autowired(required = false) MongoTemplate mongoTemplate) {
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
        this.resourceRepository = resourceRepository;
        this.hospitalRepository = hospitalRepository;
        this.alertRepository = alertRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
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
}
