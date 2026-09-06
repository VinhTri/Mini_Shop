package com.minishop.interaction.entity;

import com.minishop.product.entity.Product;
import com.minishop.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "product_reviews", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "user_id"}))
public class ProductReview {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "product_id") private Product product;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @Column(nullable = false) private int rating;
    @Column(nullable = false, length = 1500) private String comment;
    @Column(length = 1500) private String adminReply;
    private Instant repliedAt;
    @Column(nullable = false) private Instant createdAt;
    @PrePersist void create() { if (createdAt == null) createdAt = Instant.now(); }
}
