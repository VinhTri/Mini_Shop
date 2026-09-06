package com.minishop.category.service;

import com.minishop.category.dto.request.CategoryRequest;
import com.minishop.category.dto.response.CategoryResponse;
import java.util.List;

public interface CategoryService {

    List<CategoryResponse> findPublic();

    List<CategoryResponse> findAllForAdmin();

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);

    CategoryResponse toResponse(com.minishop.category.entity.Category category);
}
