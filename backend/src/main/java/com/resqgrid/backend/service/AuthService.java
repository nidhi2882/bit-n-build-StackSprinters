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
        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim());
        if (!userOpt.isPresent()) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        User user = userOpt.get();
        boolean matchesEncoded = passwordEncoder.matches(password, user.getPassword());
        boolean matchesPlain = password.equals(user.getPassword());

        if (!matchesEncoded && !matchesPlain) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        // If stored in plain text, upgrade to BCrypt hash
        if (!user.getPassword().startsWith("$2a$")) {
            user.setPassword(passwordEncoder.encode(password));
            userRepository.save(user);
        }

        mongoSyncService.syncUser(user);

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
        userData.put("departmentCategory", user.getDepartmentCategory());
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
        if (newUser.getEmail() == null || newUser.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (newUser.getPassword() == null || newUser.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }

        String email = newUser.getEmail().trim();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered: " + email);
        }

        if (newUser.getRole() == null || newUser.getRole().trim().isEmpty()) {
            newUser.setRole("Citizen");
        }
        if (newUser.getName() == null || newUser.getName().trim().isEmpty()) {
            newUser.setName(email.contains("@") ? email.substring(0, email.indexOf("@")) : "User");
        }

        String rawPassword = newUser.getPassword();
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(rawPassword));
        newUser.setCreatedAt(LocalDateTime.now());
        User saved = userRepository.save(newUser);
        mongoSyncService.syncUser(saved);

        return login(saved.getEmail(), rawPassword, saved.getRole());
    }
}
