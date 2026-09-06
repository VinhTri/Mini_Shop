package com.minishop.auth.service;

import com.minishop.auth.dto.request.LoginRequest;
import com.minishop.auth.dto.request.RegisterRequest;
import com.minishop.auth.dto.response.AuthResponse;
import com.minishop.user.dto.response.UserResponse;
import com.minishop.user.entity.User;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    UserResponse toUser(User user);
}
