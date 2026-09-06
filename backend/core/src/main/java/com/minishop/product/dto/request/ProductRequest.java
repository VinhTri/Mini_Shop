package com.minishop.product.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;

public record ProductRequest(
        @NotBlank @Size(max = 160) String name,
        @NotNull Long categoryId,
        @Size(max = 120) String brand,
        @Size(max = 2000) String description,
        @Size(max = 80) String ageRange,
        @Size(max = 120) String flavor,
        @Size(max = 1000) String benefits,
        @Min(0) @DecimalMax("100") BigDecimal protein,
        @Min(0) @DecimalMax("100") BigDecimal fat,
        @Min(0) @DecimalMax("100") BigDecimal fiber,
        @Size(max = 3000) String ingredients,
        @Size(max = 3000) String feedingGuide,
        String imageUrl,
        @Size(max = 120) String origin,
        @Size(max = 120) String shelfLife,
        Boolean active,
        @NotEmpty List<@Valid ProductVariantRequest> variants) {}
