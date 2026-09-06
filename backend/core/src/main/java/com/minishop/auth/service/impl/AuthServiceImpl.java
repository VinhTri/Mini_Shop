package com.minishop.auth.service.impl;

import com.minishop.auth.dto.request.LoginRequest;
import com.minishop.auth.dto.request.RegisterRequest;
import com.minishop.auth.dto.response.AuthResponse;
import com.minishop.auth.security.JwtUtil;
import com.minishop.auth.service.AuthService;
import com.minishop.common.exception.AppException;
import com.minishop.common.exception.ErrorCode;
import com.minishop.user.dto.response.UserResponse;
import com.minishop.user.entity.User;
import com.minishop.user.enums.Role;
import com.minishop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email().trim().toLowerCase())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setName(request.name().trim());
        user.setRole(Role.USER);
        userRepository.save(user);
        return toAuth(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository
                .findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        return toAuth(user);
    }

    @Override
    public UserResponse toUser(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }

    private AuthResponse toAuth(User user) {
        return new AuthResponse(jwtUtil.generateToken(user.getEmail(), user.getRole().name()), toUser(user));
    }
}
