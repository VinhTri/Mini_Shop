package com.minishop.auth.dto.response;

import com.minishop.user.dto.response.UserResponse;

public record AuthResponse(String token, UserResponse user) {}
