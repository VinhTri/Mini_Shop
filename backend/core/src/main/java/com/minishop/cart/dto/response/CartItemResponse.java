package com.minishop.cart.dto.response;

import java.math.BigDecimal;

public record CartItemResponse(
        Long id,
        Long productId,
        String name,
        String imageUrl,
        String variantSku,
        String variantName,
        BigDecimal price,
        int quantity,
        int stock,
        BigDecimal subtotal) {}
