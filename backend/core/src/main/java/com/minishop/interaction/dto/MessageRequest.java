package com.minishop.interaction.dto;
import jakarta.validation.constraints.*;
public record MessageRequest(@NotBlank @Size(max=1500) String content) {}
