package com.minishop.product.controller;

import com.minishop.common.dto.ApiResponse;
import com.minishop.interaction.dto.*;
import com.minishop.interaction.service.InteractionService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/products/{productId}") @RequiredArgsConstructor
public class ProductInteractionController {
    private final InteractionService service;
    @GetMapping("/reviews") public ResponseEntity<ApiResponse<List<ReviewResponse>>> reviews(@PathVariable Long productId) { return ApiResponse.ok("Thành công", service.productReviews(productId)); }
    @PostMapping("/reviews") public ResponseEntity<ApiResponse<ReviewResponse>> review(@PathVariable Long productId, @Valid @RequestBody ReviewRequest request) { return ApiResponse.ok("Đã lưu đánh giá", service.reviewProduct(productId, request)); }
    @GetMapping("/chat") public ResponseEntity<ApiResponse<ConversationResponse>> chat(@PathVariable Long productId) { return ApiResponse.ok("Thành công", service.myConversation(productId)); }
    @PostMapping("/chat") public ResponseEntity<ApiResponse<ConversationResponse>> send(@PathVariable Long productId, @Valid @RequestBody MessageRequest request) { return ApiResponse.ok("Đã gửi tin nhắn", service.send(productId, request)); }
}
