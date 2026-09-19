package com.resqgrid.backend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TrustScoringService {

    public Map<String, Object> evaluateTrust(String source, String text, Double lat, Double lng, String phone, int corroborationCount) {
        double score = 0.70; // Baseline trust

        // Source credibility
        if (source != null) {
            String lowerSource = source.toLowerCase();
            if (lowerSource.contains("operator") || lowerSource.contains("authority")) {
                score = 1.00;
            } else if (lowerSource.contains("sensor") || lowerSource.contains("iot")) {
                score = 0.96;
            } else if (lowerSource.contains("responder") || lowerSource.contains("police") || lowerSource.contains("fire")) {
                score = 0.98;
            } else if (lowerSource.contains("citizen") || lowerSource.contains("app")) {
                score = 0.80;
            }
        }

        // GPS validity bonus
        if (lat != null && lng != null && lat != 0.0 && lng != 0.0) {
            score += 0.08;
        }

        // Contact info bonus
        if (phone != null && phone.trim().length() >= 8) {
            score += 0.05;
        }

        // Detail richness bonus
        if (text != null && text.trim().length() > 40) {
            score += 0.05;
        }

        // Corroboration bonus
        if (corroborationCount > 0) {
            score += Math.min(0.12, corroborationCount * 0.04);
        }

        score = Math.min(1.00, Math.round(score * 100.0) / 100.0);

        String level = "Medium";
        if (score >= 0.90) {
            level = "Verified / High";
        } else if (score < 0.75) {
            level = "Unverified / Moderate";
        }

        Map<String, Object> result = new HashMap<>();
        result.put("trustScore", score);
        result.put("trustLevel", level);
        result.put("isVerified", score >= 0.85);
        return result;
    }
}
