package com.minishop.category.dto.response;

import java.util.List;

public record CategoryResponse(
        Long id,
        String name,
        boolean active,
        Long parentId,
        Integer sortOrder,
        String iconKey,
        long productCount,
        List<CategoryResponse> children) {}
