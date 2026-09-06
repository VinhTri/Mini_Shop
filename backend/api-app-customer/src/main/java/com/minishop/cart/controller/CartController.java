package com.minishop.cart.controller;

import com.minishop.cart.dto.request.CartItemRequest;
import com.minishop.cart.dto.request.QuantityRequest;
import com.minishop.cart.dto.response.CartResponse;
import com.minishop.cart.service.CartService;
import com.minishop.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Cart")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> get() {
        return ApiResponse.ok("Thành công", cartService.getCart());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CartResponse>> add(@Valid @RequestBody CartItemRequest request) {
        return ApiResponse.ok("Đã thêm vào giỏ", cartService.add(request));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> update(
            @PathVariable Long itemId, @Valid @RequestBody QuantityRequest request) {
        return ApiResponse.ok("Cập nhật giỏ hàng thành công", cartService.update(itemId, request.quantity()));
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<ApiResponse<CartResponse>> remove(@PathVariable Long itemId) {
        return ApiResponse.ok("Đã xóa khỏi giỏ", cartService.remove(itemId));
    }
}
