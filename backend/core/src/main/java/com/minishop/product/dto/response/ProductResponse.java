package com.minishop.product.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record ProductResponse(
        Long id,
        Long categoryId,
        String categoryName,
        String name,
        BigDecimal price,
        BigDecimal originalPrice,
        int stock,
        String imageUrl,
        String description,
        boolean active,
        String brand,
        String ageRange,
        String flavor,
        String benefits,
        BigDecimal protein,
        BigDecimal fat,
        BigDecimal fiber,
        String ingredients,
        String feedingGuide,
        String origin,
        String shelfLife,
        List<ProductVariantResponse> variants) {}
