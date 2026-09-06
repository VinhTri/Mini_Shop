package com.minishop.order.dto.request;

import com.minishop.order.enums.ReturnStatus;
import jakarta.validation.constraints.NotNull;

public record ReturnStatusRequest(@NotNull ReturnStatus status) {}
