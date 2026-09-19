package com.resqgrid.backend.service;

import com.resqgrid.backend.entity.EmergencyCategory;
import com.resqgrid.backend.entity.EmergencySubType;
import com.resqgrid.backend.repository.EmergencyCategoryRepository;
import com.resqgrid.backend.repository.EmergencySubTypeRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TaxonomyService {

    private final EmergencyCategoryRepository categoryRepository;
    private final EmergencySubTypeRepository subTypeRepository;

    public TaxonomyService(EmergencyCategoryRepository categoryRepository, EmergencySubTypeRepository subTypeRepository) {
        this.categoryRepository = categoryRepository;
        this.subTypeRepository = subTypeRepository;
    }

    public List<EmergencyCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<EmergencyCategory> getCategoryById(String id) {
        return categoryRepository.findById(id);
    }

    public List<EmergencySubType> getAllSubTypes() {
        return subTypeRepository.findAll();
    }

    public List<EmergencySubType> getSubTypesByCategoryId(String categoryId) {
        return subTypeRepository.findByCategoryId(categoryId);
    }

    public Map<String, Object> getTaxonomyMatrix() {
        List<EmergencyCategory> categories = categoryRepository.findAll();
        List<Map<String, Object>> matrix = new ArrayList<>();

        for (EmergencyCategory cat : categories) {
            Map<String, Object> item = new HashMap<>();
            item.put("category", cat);
            item.put("subTypes", subTypeRepository.findByCategoryId(cat.getId()));
            matrix.add(item);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("totalCategories", categories.size());
        response.put("taxonomy", matrix);
        return response;
    }

    public List<String> resolveDefaultCapabilities(String categoryId, String subTypeId) {
        if (subTypeId != null && !subTypeId.trim().isEmpty()) {
            Optional<EmergencySubType> subType = subTypeRepository.findById(subTypeId);
            if (subType.isPresent() && !subType.get().getDefaultCapabilities().isEmpty()) {
                return subType.get().getDefaultCapabilities();
            }
        }
        if (categoryId != null && !categoryId.trim().isEmpty()) {
            Optional<EmergencyCategory> category = categoryRepository.findById(categoryId);
            if (category.isPresent() && !category.get().getDefaultRequiredCapabilities().isEmpty()) {
                return category.get().getDefaultRequiredCapabilities();
            }
        }
        return Arrays.asList("First Aid", "Triage Assessment");
    }
}
