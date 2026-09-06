package com.minishop.cart.repository;

import com.minishop.cart.entity.CartItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUserId(Long userId);

    Optional<CartItem> findByUserIdAndProductIdAndVariantSku(Long userId, Long productId, String variantSku);

    Optional<CartItem> findByIdAndUserId(Long id, Long userId);

    void deleteByUserId(Long userId);
}
