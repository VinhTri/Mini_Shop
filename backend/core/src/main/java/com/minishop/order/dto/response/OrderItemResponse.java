package com.minishop.order.dto.response;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId, String productName, String imageUrl, String variantSku, String variantName,
        BigDecimal price, int quantity, BigDecimal subtotal) {}
