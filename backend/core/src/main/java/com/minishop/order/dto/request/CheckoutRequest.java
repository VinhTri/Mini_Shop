package com.minishop.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.minishop.order.enums.PaymentMethod;
import java.util.List;

public record CheckoutRequest(
        @NotBlank @Size(max = 80) String fullName,
        @NotBlank @Size(max = 20) String phone,
        @NotBlank @Size(max = 255) String address,
        @Size(max = 200, message = "Ghi chú tối đa 200 ký tự") String note,
        @NotNull PaymentMethod paymentMethod,
        List<Long> cartItemIds) {}
