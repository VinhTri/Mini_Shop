package com.minishop.interaction.entity;

import com.minishop.product.entity.Product;
import com.minishop.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "product_conversations", uniqueConstraints = @UniqueConstraint(columnNames = {"product_id", "user_id"}))
public class ProductConversation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "product_id") private Product product;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "user_id") private User user;
    @Column(nullable = false) private Instant updatedAt;
    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt asc") private List<ChatMessage> messages = new ArrayList<>();
    @PrePersist void create() { if (updatedAt == null) updatedAt = Instant.now(); }
}
