package com.minishop.interaction.dto;
import java.time.Instant;
public record ChatMessageResponse(Long id, boolean fromAdmin, String content, Instant createdAt) {}
