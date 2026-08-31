package com.volta.service;

import com.volta.domain.Category;
import com.volta.dto.CategoryResponse;
import com.volta.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
  private final CategoryRepository categoryRepository;

  public List<CategoryResponse> getAllCategories() {
    return categoryRepository.findAll().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  public CategoryResponse getCategory(String id) {
    Category category = categoryRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Category not found"));
    return toResponse(category);
  }

  private CategoryResponse toResponse(Category category) {
    return new CategoryResponse(category.getId(), category.getName(), category.getIcon());
  }
}
