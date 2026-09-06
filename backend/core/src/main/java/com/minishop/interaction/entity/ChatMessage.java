package com.minishop.interaction.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "chat_messages")
public class ChatMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "conversation_id") private ProductConversation conversation;
    @Column(nullable = false) private boolean fromAdmin;
    @Column(nullable = false, length = 1500) private String content;
    @Column(nullable = false) private Instant createdAt;
    @PrePersist void create() { if (createdAt == null) createdAt = Instant.now(); }
}
