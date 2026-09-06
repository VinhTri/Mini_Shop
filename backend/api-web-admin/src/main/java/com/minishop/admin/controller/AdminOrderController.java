package com.minishop.admin.controller;

import com.minishop.common.dto.ApiResponse;
import com.minishop.common.dto.PageResponse;
import com.minishop.order.dto.request.StatusRequest;
import com.minishop.order.dto.request.ReturnStatusRequest;
import com.minishop.order.dto.request.ExchangeStatusRequest;
import com.minishop.order.dto.response.OrderResponse;
import com.minishop.order.dto.response.StatsResponse;
import com.minishop.order.enums.OrderStatus;
import com.minishop.order.service.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin Order")
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<StatsResponse>> stats() {
        return ApiResponse.ok("Thành công", orderService.stats());
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> list(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok("Thành công", orderService.adminOrders(status, page, size));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> one(@PathVariable Long id) {
        return ApiResponse.ok("Thành công", orderService.findMine(id));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> status(
            @PathVariable Long id, @Valid @RequestBody StatusRequest request) {
        return ApiResponse.ok("Cập nhật trạng thái đơn thành công", orderService.changeStatus(id, request.status()));
    }

    @PatchMapping("/orders/{id}/return-status")
    public ResponseEntity<ApiResponse<OrderResponse>> returnStatus(
            @PathVariable Long id, @Valid @RequestBody ReturnStatusRequest request) {
        return ApiResponse.ok("Cập nhật trạng thái đổi trả thành công",
                orderService.changeReturnStatus(id, request.status()));
    }

    @PatchMapping("/orders/{id}/exchange-status")
    public ResponseEntity<ApiResponse<OrderResponse>> exchangeStatus(
            @PathVariable Long id, @Valid @RequestBody ExchangeStatusRequest request) {
        return ApiResponse.ok("Cập nhật trạng thái đổi hàng thành công",
                orderService.changeExchangeStatus(id, request.status()));
    }
}
