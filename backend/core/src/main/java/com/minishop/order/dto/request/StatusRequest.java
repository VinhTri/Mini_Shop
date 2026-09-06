package com.minishop.order.dto.request;

import com.minishop.order.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record StatusRequest(@NotNull OrderStatus status) {}
