package com.minishop.interaction.dto;
import java.time.Instant;
public record ReviewResponse(Long id, Long productId, String productName, String userName, int rating, String comment, String adminReply, Instant createdAt, Instant repliedAt) {}
