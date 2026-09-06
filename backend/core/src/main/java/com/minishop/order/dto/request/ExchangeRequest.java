package com.minishop.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ExchangeRequest(
        @NotNull Long productId,
        @NotBlank @Size(max = 80) String requestedVariant,
        @NotBlank @Size(max = 120) String reason,
        @NotBlank @Size(min = 10, max = 1500, message = "Mô tả đổi hàng phải có từ 10 đến 1500 ký tự") String description) {}
