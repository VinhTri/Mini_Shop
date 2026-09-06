package com.minishop.order.controller;

import com.minishop.common.dto.ApiResponse;
import com.minishop.common.dto.PageResponse;
import com.minishop.order.dto.request.CheckoutRequest;
import com.minishop.order.dto.request.ReturnRequest;
import com.minishop.order.dto.request.RefundBankRequest;
import com.minishop.order.dto.request.ExchangeRequest;
import com.minishop.order.dto.response.OrderResponse;
import com.minishop.order.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ApiResponse.ok("Đặt hàng thành công!", orderService.checkout(request));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> mine(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok("Thành công", orderService.myOrders(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> one(@PathVariable Long id) {
        return ApiResponse.ok("Thành công", orderService.findMine(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancel(@PathVariable Long id) {
        return ApiResponse.ok("Hủy đơn thành công", orderService.cancelMine(id));
    }

    @PostMapping("/{id}/return-request")
    public ResponseEntity<ApiResponse<OrderResponse>> requestReturn(
            @PathVariable Long id, @Valid @RequestBody ReturnRequest request) {
        return ApiResponse.ok("Đã gửi yêu cầu đổi trả",
                orderService.requestReturn(id, request.reason(), request.description()));
    }

    @PostMapping("/{id}/refund-bank")
    public ResponseEntity<ApiResponse<OrderResponse>> refundBank(
            @PathVariable Long id, @Valid @RequestBody RefundBankRequest request) {
        return ApiResponse.ok("Đã lưu thông tin nhận tiền hoàn",
                orderService.submitRefundBank(id, request.bankName(), request.accountName(), request.accountNumber()));
    }

    @PostMapping("/{id}/exchange-request")
    public ResponseEntity<ApiResponse<OrderResponse>> requestExchange(
            @PathVariable Long id, @Valid @RequestBody ExchangeRequest request) {
        return ApiResponse.ok("Đã gửi yêu cầu đổi hàng", orderService.requestExchange(id,
                request.productId(), request.requestedVariant(), request.reason(), request.description()));
    }
}
