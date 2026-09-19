package com.resqgrid.backend;

import com.resqgrid.backend.entity.User;
import com.resqgrid.backend.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private com.resqgrid.backend.repository.UserRepository userRepository;

    @Test
    void testPublicLoginEndpointAllowed() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"test@resqgrid.org\",\"password\":\"password123\",\"role\":\"Citizen\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void testProtectedIncidentsEndpointWithoutTokenFails401() throws Exception {
        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testProtectedIncidentsEndpointWithValidJwtSucceeds() throws Exception {
        User testUser = User.builder()
                .name("Integration Test User")
                .email("admin@resqgrid.org")
                .password("testpass123")
                .role("Authority Admin")
                .authorityId("AUTH-NYC-01")
                .build();
        userRepository.save(testUser);

        String token = tokenProvider.generateToken(testUser);

        mockMvc.perform(get("/api/incidents")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
