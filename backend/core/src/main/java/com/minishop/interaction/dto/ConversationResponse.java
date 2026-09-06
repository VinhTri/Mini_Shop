package com.minishop.interaction.dto;
import java.time.Instant;
import java.util.List;
public record ConversationResponse(Long id, Long productId, String productName, String productImageUrl, String userName, String userEmail, Instant updatedAt, List<ChatMessageResponse> messages) {}
