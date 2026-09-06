package com.minishop.interaction.repository;
import com.minishop.interaction.entity.ProductReview;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<ProductReview> findAllByOrderByCreatedAtDesc();
    Optional<ProductReview> findByProductIdAndUserId(Long productId, Long userId);
}
