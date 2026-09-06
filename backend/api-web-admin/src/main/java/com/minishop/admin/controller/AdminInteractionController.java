package com.minishop.admin.controller;

import com.minishop.common.dto.ApiResponse;
import com.minishop.interaction.dto.*;
import com.minishop.interaction.service.InteractionService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/admin") @RequiredArgsConstructor
public class AdminInteractionController {
    private final InteractionService service;
    @GetMapping("/reviews") public ResponseEntity<ApiResponse<List<ReviewResponse>>> reviews() { return ApiResponse.ok("Thành công", service.adminReviews()); }
    @PostMapping("/reviews/{id}/reply") public ResponseEntity<ApiResponse<ReviewResponse>> reply(@PathVariable Long id, @Valid @RequestBody MessageRequest request) { return ApiResponse.ok("Đã phản hồi", service.replyReview(id, request)); }
    @GetMapping("/conversations") public ResponseEntity<ApiResponse<List<ConversationResponse>>> chats() { return ApiResponse.ok("Thành công", service.adminConversations()); }
    @GetMapping("/conversations/{id}") public ResponseEntity<ApiResponse<ConversationResponse>> chat(@PathVariable Long id) { return ApiResponse.ok("Thành công", service.adminConversation(id)); }
    @PostMapping("/conversations/{id}/messages") public ResponseEntity<ApiResponse<ConversationResponse>> send(@PathVariable Long id, @Valid @RequestBody MessageRequest request) { return ApiResponse.ok("Đã gửi", service.adminSend(id, request)); }
}
