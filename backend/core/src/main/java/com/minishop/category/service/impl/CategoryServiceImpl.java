package com.minishop.category.service.impl;

import com.minishop.category.dto.request.CategoryRequest;
import com.minishop.category.dto.response.CategoryResponse;
import com.minishop.category.entity.Category;
import com.minishop.category.repository.CategoryRepository;
import com.minishop.category.service.CategoryService;
import com.minishop.common.exception.AppException;
import com.minishop.common.exception.ErrorCode;
import com.minishop.product.repository.ProductRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    public List<CategoryResponse> findPublic() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAscNameAsc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> findAllForAdmin() {
        return categoryRepository.findAll(Sort.by("sortOrder").ascending().and(Sort.by("name").ascending())).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTS);
        }
        Category category = new Category();
        apply(category, request);
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        if (!category.getName().equalsIgnoreCase(request.name().trim())
                && categoryRepository.existsByNameIgnoreCase(request.name().trim())) {
            throw new AppException(ErrorCode.CATEGORY_NAME_EXISTS);
        }
        apply(category, request);
        return toResponse(category);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }
        if (categoryRepository.existsByParentId(id)) {
            throw new AppException(ErrorCode.CATEGORY_HAS_PRODUCTS);
        }
        if (productRepository.existsByCategoryId(id)) {
            throw new AppException(ErrorCode.CATEGORY_HAS_PRODUCTS);
        }
        categoryRepository.deleteById(id);
    }

    @Override
    public CategoryResponse toResponse(Category category) {
        Long parentId = category.getParent() == null ? null : category.getParent().getId();
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.isActive(),
                parentId,
                category.getSortOrder(),
                category.getIconKey(),
                productRepository.countByCategoryId(category.getId()),
                List.of());
    }

    private void apply(Category category, CategoryRequest request) {
        category.setName(request.name().trim());
        if (request.active() != null) {
            category.setActive(request.active());
        } else if (category.getId() == null) {
            category.setActive(true);
        }
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }
        category.setIconKey(request.iconKey());
        category.setParent(null);
    }

}
