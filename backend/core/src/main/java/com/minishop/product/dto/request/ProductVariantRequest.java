package com.minishop.product.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductVariantRequest(
        @NotBlank @Size(max = 60) String weight,
        @Size(max = 80) String sku,
        @NotNull @Min(0) BigDecimal price,
        @Min(0) BigDecimal salePrice,
        @NotNull @Min(0) Integer stock) {}
