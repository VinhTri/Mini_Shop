package com.minishop.order.service;

import com.minishop.common.dto.PageResponse;
import com.minishop.order.dto.request.CheckoutRequest;
import com.minishop.order.dto.response.OrderResponse;
import com.minishop.order.dto.response.StatsResponse;
import com.minishop.order.enums.OrderStatus;
import com.minishop.order.enums.ReturnStatus;
import com.minishop.order.enums.ExchangeStatus;

public interface OrderService {

    OrderResponse checkout(CheckoutRequest request);

    PageResponse<OrderResponse> myOrders(int page, int size);

    OrderResponse findMine(Long id);

    OrderResponse cancelMine(Long id);

    PageResponse<OrderResponse> adminOrders(OrderStatus status, int page, int size);

    OrderResponse changeStatus(Long id, OrderStatus next);

    OrderResponse requestReturn(Long id, String reason, String description);

    OrderResponse submitRefundBank(Long id, String bankName, String accountName, String accountNumber);

    OrderResponse changeReturnStatus(Long id, ReturnStatus next);

    OrderResponse requestExchange(Long id, Long productId, String requestedVariant, String reason, String description);

    OrderResponse changeExchangeStatus(Long id, ExchangeStatus next);

    StatsResponse stats();
}
