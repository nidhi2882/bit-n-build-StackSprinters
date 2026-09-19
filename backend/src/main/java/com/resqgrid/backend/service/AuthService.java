package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.User;
import com.resqgrid.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public Map<String, Object> login(String email, String password, String role) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
            // In dev/hackathon demo, allow login with matching email
            if (password != null && !password.isEmpty() && !password.equals(user.getPassword())) {
                // If demo user password doesn't match default, update it for seamless test
                user.setPassword(password);
                userRepository.save(user);
            }
        } else {
            // Auto-provision demo user if requested role does not exist yet
            user = User.builder()
                    .name(email.contains("@") ? email.substring(0, email.indexOf("@")) : "Operator")
                    .email(email)
                    .password(password != null ? password : "password123")
                    .role(role != null ? role : "Emergency Operator")
                    .organization("Emergency Operations Center")
                    .createdAt(LocalDateTime.now())
                    .build();
            user = userRepository.save(user);
        }

        String token = "resqgrid-jwt-" + UUID.randomUUID().toString();

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", "USR-" + user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        userData.put("phone", user.getPhone());
        userData.put("organization", user.getOrganization());
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
            throw new RuntimeException("Email already registered: " + newUser.getEmail());
        }

        if (newUser.getRole() == null || newUser.getRole().trim().isEmpty()) {
            newUser.setRole("Citizen");
        }
        newUser.setCreatedAt(LocalDateTime.now());
        User saved = userRepository.save(newUser);

        return login(saved.getEmail(), saved.getPassword(), saved.getRole());
    }
}
