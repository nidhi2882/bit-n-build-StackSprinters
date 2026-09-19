package com.resqgrid.backend;

import com.resqgrid.backend.entity.User;
import com.resqgrid.backend.repository.UserRepository;
import com.resqgrid.backend.security.JwtTokenProvider;
import com.resqgrid.backend.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private com.resqgrid.backend.service.MongoSyncService mongoSyncService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .name("Test Operator")
                .email("operator@test.com")
                .password("$2a$10$encodedpasswordhash")
                .role("Emergency Operator")
                .authorityId("AUTH-NYC-01")
                .build();
    }

    @Test
    void testLoginSuccess() {
        when(userRepository.findByEmail("operator@test.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("password123", sampleUser.getPassword())).thenReturn(true);
        when(tokenProvider.generateToken(any(User.class))).thenReturn("signed.jwt.token");

        Map<String, Object> result = authService.login("operator@test.com", "password123", "Emergency Operator");

        assertNotNull(result);
        assertEquals("signed.jwt.token", result.get("token"));
        assertTrue(result.containsKey("user"));
    }

    @Test
    void testLoginInvalidPasswordThrowsException() {
        when(userRepository.findByEmail("operator@test.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", sampleUser.getPassword())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> {
            authService.login("operator@test.com", "wrongpassword", "Emergency Operator");
        });
    }
}
