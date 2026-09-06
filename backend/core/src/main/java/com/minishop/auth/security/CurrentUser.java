package com.minishop.auth.security;

import com.minishop.common.exception.AppException;
import com.minishop.common.exception.ErrorCode;
import com.minishop.user.entity.User;
import com.minishop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    public String email() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return auth.getName();
    }

    public User require() {
        return userRepository.findByEmail(email()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }

    public boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null
                && auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
