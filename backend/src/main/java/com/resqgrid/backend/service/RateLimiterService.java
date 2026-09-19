package com.resqgrid.backend.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
public class RateLimiterService {

    // Window duration: 60 seconds
    private static final long WINDOW_MILLIS = 60_000;
    // Default limit: 12 requests per minute per IP for public citizen ingestion
    private static final int DEFAULT_MAX_REQUESTS = 12;

    private final ConcurrentHashMap<String, ConcurrentLinkedQueue<Long>> requestHistory = new ConcurrentHashMap<>();

    public boolean isAllowed(String clientIdentifier) {
        return isAllowed(clientIdentifier, DEFAULT_MAX_REQUESTS);
    }

    public boolean isAllowed(String clientIdentifier, int maxRequests) {
        if (clientIdentifier == null || clientIdentifier.trim().isEmpty()) {
            return true;
        }

        long now = Instant.now().toEpochMilli();
        ConcurrentLinkedQueue<Long> timestamps = requestHistory.computeIfAbsent(clientIdentifier, k -> new ConcurrentLinkedQueue<>());

        // Evict timestamps older than the window
        while (!timestamps.isEmpty() && timestamps.peek() < now - WINDOW_MILLIS) {
            timestamps.poll();
        }

        if (timestamps.size() >= maxRequests) {
            return false;
        }

        timestamps.add(now);
        return true;
    }

    public void clear(String clientIdentifier) {
        requestHistory.remove(clientIdentifier);
    }
}
