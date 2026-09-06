package com.minishop.category.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoryRequest(
        @NotBlank @Size(max = 120) String name,
        Boolean active,
        Integer sortOrder,
        @NotBlank
                @Pattern(
                        regexp = "dry-food|wet-food|treats|milk|catnip|bowls|litter|scratch|groom|carrier|bed|fashion",
                        message = "Icon danh mục không hợp lệ")
                String iconKey) {}
