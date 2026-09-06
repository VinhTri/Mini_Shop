package com.minishop.admin.controller;

import com.minishop.auth.dto.request.LoginRequest;
import com.minishop.auth.dto.response.AuthResponse;
import com.minishop.auth.security.CurrentUser;
import com.minishop.auth.service.AuthService;
import com.minishop.common.dto.ApiResponse;
import com.minishop.user.dto.response.UserResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Admin Auth")
public class AdminAuthController {

    private final AuthService authService;
    private final CurrentUser currentUser;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok("Đăng nhập thành công!", authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        return ApiResponse.ok("Thành công", authService.toUser(currentUser.require()));
    }
}
