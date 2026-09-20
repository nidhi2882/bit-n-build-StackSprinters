package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.User;
import com.resqgrid.backend.repository.UserRepository;
import com.resqgrid.backend.security.UserPrincipal;
import com.resqgrid.backend.service.AuditLogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null && !"SUPER_ADMIN".equalsIgnoreCase(principal.getRole()) && !"Super Admin".equalsIgnoreCase(principal.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Super Admin access required for User Management.");
        }
        List<User> users = userRepository.findAll();
        // Mask passwords before returning
        users.forEach(u -> u.setPassword("[PROTECTED]"));
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user, @AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null && !"SUPER_ADMIN".equalsIgnoreCase(principal.getRole()) && !"Super Admin".equalsIgnoreCase(principal.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Super Admin access required to create users.");
        }
        if (user.getEmail() == null || userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Email already registered or missing.");
        }
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            user.setPassword("resq1234");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);

        auditLogService.log("USER_CREATED", "USER", String.valueOf(saved.getId()),
                principal != null ? String.valueOf(principal.getId()) : "SYSTEM",
                principal != null ? principal.getRole() : "SUPER_ADMIN",
                principal != null ? principal.getName() : "Commander",
                user.getDepartmentCategory(),
                "Created user " + saved.getEmail() + " with role " + saved.getRole(),
                null);

        saved.setPassword("[PROTECTED]");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User updated, @AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null && !"SUPER_ADMIN".equalsIgnoreCase(principal.getRole()) && !"Super Admin".equalsIgnoreCase(principal.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Super Admin access required to edit users.");
        }
        return userRepository.findById(id).map(user -> {
            if (updated.getName() != null) user.setName(updated.getName());
            if (updated.getRole() != null) user.setRole(updated.getRole());
            if (updated.getDepartmentCategory() != null) user.setDepartmentCategory(updated.getDepartmentCategory());
            if (updated.getPhone() != null) user.setPhone(updated.getPhone());
            if (updated.getOrganization() != null) user.setOrganization(updated.getOrganization());
            if (updated.getUnitId() != null) user.setUnitId(updated.getUnitId());
            if (updated.getPassword() != null && !updated.getPassword().isEmpty() && !updated.getPassword().startsWith("$2a$") && !"[PROTECTED]".equals(updated.getPassword())) {
                user.setPassword(passwordEncoder.encode(updated.getPassword()));
            }
            User saved = userRepository.save(user);
            auditLogService.log("USER_UPDATED", "USER", String.valueOf(saved.getId()),
                    principal != null ? String.valueOf(principal.getId()) : "SYSTEM",
                    principal != null ? principal.getRole() : "SUPER_ADMIN",
                    principal != null ? principal.getName() : "Commander",
                    saved.getDepartmentCategory(),
                    "Updated profile for user " + saved.getEmail(),
                    null);
            saved.setPassword("[PROTECTED]");
            return ResponseEntity.ok(saved);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        if (principal != null && !"SUPER_ADMIN".equalsIgnoreCase(principal.getRole()) && !"Super Admin".equalsIgnoreCase(principal.getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Super Admin access required to delete users.");
        }
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            auditLogService.log("USER_DELETED", "USER", String.valueOf(id),
                    principal != null ? String.valueOf(principal.getId()) : "SYSTEM",
                    principal != null ? principal.getRole() : "SUPER_ADMIN",
                    principal != null ? principal.getName() : "Commander",
                    user.getDepartmentCategory(),
                    "Deleted user " + user.getEmail(),
                    null);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
