package com.minishop.product.dto.response;

import java.math.BigDecimal;

public record ProductVariantResponse(
        String weight, String sku, BigDecimal price, BigDecimal salePrice, int stock) {}
