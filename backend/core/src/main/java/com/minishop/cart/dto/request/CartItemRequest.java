package com.minishop.cart.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CartItemRequest(
        @NotNull Long productId,
        @NotNull String variantSku,
        @NotNull @Min(1) Integer quantity) {}
