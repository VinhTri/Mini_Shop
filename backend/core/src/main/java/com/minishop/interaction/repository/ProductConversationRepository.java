package com.minishop.interaction.repository;
import com.minishop.interaction.entity.ProductConversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductConversationRepository extends JpaRepository<ProductConversation, Long> {
    Optional<ProductConversation> findByProductIdAndUserId(Long productId, Long userId);
    List<ProductConversation> findAllByOrderByUpdatedAtDesc();
}
