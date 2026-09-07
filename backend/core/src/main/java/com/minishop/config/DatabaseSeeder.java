package com.minishop.config;

import com.minishop.user.entity.User;
import com.minishop.user.enums.Role;
import com.minishop.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email}")
    private String adminEmail;

    @Value("${app.seed.admin-password}")
    private String adminPassword;

    @Value("${app.seed.user-email}")
    private String userEmail;

    @Value("${app.seed.user-password}")
    private String userPassword;

    @Override
    public void run(String... args) {
        createUserIfMissing(adminEmail, adminPassword, "Quản trị viên", Role.ADMIN);
        createUserIfMissing(userEmail, userPassword, "Khách hàng mẫu", Role.USER);
    }

    private void createUserIfMissing(String email, String rawPassword, String name, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            return;
        }
        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalStateException("Seed password must not be blank for " + email);
        }

        User account = new User();
        account.setEmail(email);
        account.setPassword(passwordEncoder.encode(rawPassword));
        account.setName(name);
        account.setRole(role);
        userRepository.save(account);
    }
}
