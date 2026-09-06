package com.minishop.order.dto.response;

import java.math.BigDecimal;

public record StatsResponse(long ordersToday, BigDecimal revenue, long lowStock) {}
