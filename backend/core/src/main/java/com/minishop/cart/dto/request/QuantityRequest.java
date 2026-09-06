package com.minishop.cart.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record QuantityRequest(@NotNull @Min(0) Integer quantity) {}
