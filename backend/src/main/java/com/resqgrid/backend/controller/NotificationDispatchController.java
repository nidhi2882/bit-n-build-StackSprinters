package com.resqgrid.backend.controller;

import com.resqgrid.backend.service.MultiChannelNotificationService;
import com.resqgrid.backend.service.MultiChannelNotificationService.NotificationDispatchRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationDispatchController {

    private final MultiChannelNotificationService notificationService;

    public NotificationDispatchController(MultiChannelNotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/dispatch")
    public ResponseEntity<Map<String, Object>> dispatchAlert(@RequestBody NotificationDispatchRequest request) {
        return ResponseEntity.ok(notificationService.dispatchMultiChannel(request));
    }

    @GetMapping("/channels")
    public ResponseEntity<Map<String, Object>> getChannelStatus() {
        return ResponseEntity.ok(notificationService.getChannelStatus());
    }
}
