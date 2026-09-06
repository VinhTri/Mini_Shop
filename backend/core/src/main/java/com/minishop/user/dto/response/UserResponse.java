package com.minishop.user.dto.response;

import com.minishop.user.enums.Role;

public record UserResponse(Long id, String email, String name, Role role) {}
