package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.User;
import com.resqgrid.backend.repository.UserRepository;
import com.resqgrid.backend.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final MongoSyncService mongoSyncService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider, MongoSyncService mongoSyncService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.mongoSyncService = mongoSyncService;
    }

    public Map<String, Object> login(String email, String password, String role) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            // Verify password using BCrypt
            if (password != null && !password.isEmpty()) {
                if (!passwordEncoder.matches(password, user.getPassword()) && !password.equals(user.getPassword())) {
                    throw new IllegalArgumentException("Invalid email or password");
                }
                // If stored in plain text from earlier scaffold, re-encode with BCrypt
                if (!user.getPassword().startsWith("$2a$")) {
                    user.setPassword(passwordEncoder.encode(password));
                    userRepository.save(user);
                }
            }
            mongoSyncService.syncUser(user);
        } else {
            // Auto-provision demo user if requested
            String rawPassword = password != null ? password : "password123";
            user = User.builder()
                    .name(email.contains("@") ? email.substring(0, email.indexOf("@")) : "Operator")
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role != null ? role : "Emergency Operator")
                    .organization("Emergency Operations Center")
                    .authorityId("AUTH-NYC-01")
                    .createdAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
            mongoSyncService.syncUser(user);
        }

        // Generate HMAC SHA-256 signed JWT token
        String token = tokenProvider.generateToken(user);

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", "USR-" + user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        userData.put("phone", user.getPhone());
        userData.put("organization", user.getOrganization());
        userData.put("authorityId", user.getAuthorityId());
        userData.put("departmentId", user.getDepartmentId());
        userData.put("facilityId", user.getFacilityId());

        if ("Response Team".equalsIgnoreCase(user.getRole())) {
            userData.put("unitName", "NDRF Squad 03");
        } else if ("Hospital Admin".equalsIgnoreCase(user.getRole())) {
            userData.put("hospitalId", "HOSP-001");
        }
        response.put("user", userData);

        return response;
    }

    public Map<String, Object> register(User newUser) {
        if (newUser.getEmail() != null && userRepository.existsByEmail(newUser.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + newUser.getEmail());
        }

        if (newUser.getRole() == null || newUser.getRole().trim().isEmpty()) {
            newUser.setRole("Citizen");
        }

        String rawPassword = newUser.getPassword() != null ? newUser.getPassword() : "password123";
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        newUser.setCreatedAt(LocalDateTime.now());
        User saved = userRepository.save(newUser);
        mongoSyncService.syncUser(saved);

        return login(saved.getEmail(), rawPassword, saved.getRole());
    }
}
