package com.minishop.interaction.dto;
import jakarta.validation.constraints.*;
public record ReviewRequest(@Min(1) @Max(5) int rating, @NotBlank @Size(max=1500) String comment) {}
