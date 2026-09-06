package com.minishop.order.dto.request;

import com.minishop.order.enums.ExchangeStatus;
import jakarta.validation.constraints.NotNull;

public record ExchangeStatusRequest(@NotNull ExchangeStatus status) {}
