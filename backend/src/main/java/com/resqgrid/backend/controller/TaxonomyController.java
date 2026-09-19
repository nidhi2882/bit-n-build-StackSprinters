package com.resqgrid.backend.controller;

import com.resqgrid.backend.entity.EmergencyCategory;
import com.resqgrid.backend.entity.EmergencySubType;
import com.resqgrid.backend.service.TaxonomyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/taxonomy")
@RequiredArgsConstructor
public class TaxonomyController {

    private final TaxonomyService taxonomyService;

    @GetMapping("/categories")
    public ResponseEntity<List<EmergencyCategory>> getCategories() {
        return ResponseEntity.ok(taxonomyService.getAllCategories());
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<EmergencyCategory> getCategoryById(@PathVariable String id) {
        return taxonomyService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/subtypes")
    public ResponseEntity<List<EmergencySubType>> getSubTypes(@RequestParam(required = false) String categoryId) {
        if (categoryId != null && !categoryId.trim().isEmpty()) {
            return ResponseEntity.ok(taxonomyService.getSubTypesByCategoryId(categoryId));
        }
        return ResponseEntity.ok(taxonomyService.getAllSubTypes());
    }

    @GetMapping("/matrix")
    public ResponseEntity<Map<String, Object>> getTaxonomyMatrix() {
        return ResponseEntity.ok(taxonomyService.getTaxonomyMatrix());
    }
}
