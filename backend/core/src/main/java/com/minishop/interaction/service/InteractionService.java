package com.minishop.interaction.service;

import com.minishop.auth.security.CurrentUser;
import com.minishop.common.exception.AppException;
import com.minishop.common.exception.ErrorCode;
import com.minishop.interaction.dto.*;
import com.minishop.interaction.entity.*;
import com.minishop.interaction.repository.*;
import com.minishop.product.repository.ProductRepository;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class InteractionService {
    private final ProductReviewRepository reviews;
    private final ProductConversationRepository conversations;
    private final ProductRepository products;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public List<ReviewResponse> productReviews(Long productId) {
        return reviews.findByProductIdOrderByCreatedAtDesc(productId).stream().map(this::review).toList();
    }

    @Transactional
    public ReviewResponse reviewProduct(Long productId, ReviewRequest request) {
        var user = currentUser.require();
        var product = products.findById(productId).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        var item = reviews.findByProductIdAndUserId(productId, user.getId()).orElseGet(ProductReview::new);
        item.setProduct(product); item.setUser(user); item.setRating(request.rating()); item.setComment(request.comment().trim());
        return review(reviews.save(item));
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> adminReviews() { return reviews.findAllByOrderByCreatedAtDesc().stream().map(this::review).toList(); }

    @Transactional
    public ReviewResponse replyReview(Long id, MessageRequest request) {
        var item = reviews.findById(id).orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Không tìm thấy đánh giá"));
        item.setAdminReply(request.content().trim()); item.setRepliedAt(Instant.now());
        return review(item);
    }

    @Transactional(readOnly = true)
    public ConversationResponse myConversation(Long productId) {
        var user = currentUser.require();
        return conversations.findByProductIdAndUserId(productId, user.getId()).map(this::conversation).orElse(null);
    }

    @Transactional
    public ConversationResponse send(Long productId, MessageRequest request) {
        var user = currentUser.require();
        var product = products.findById(productId).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        var chat = conversations.findByProductIdAndUserId(productId, user.getId()).orElseGet(() -> {
            var value = new ProductConversation(); value.setProduct(product); value.setUser(user); return value;
        });
        addMessage(chat, false, request.content());
        return conversation(conversations.save(chat));
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> adminConversations() { return conversations.findAllByOrderByUpdatedAtDesc().stream().map(this::conversation).toList(); }

    @Transactional(readOnly = true)
    public ConversationResponse adminConversation(Long id) { return conversation(findConversation(id)); }

    @Transactional
    public ConversationResponse adminSend(Long id, MessageRequest request) {
        var chat = findConversation(id); addMessage(chat, true, request.content()); return conversation(chat);
    }

    private ProductConversation findConversation(Long id) { return conversations.findById(id).orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST, "Không tìm thấy cuộc tư vấn")); }
    private void addMessage(ProductConversation chat, boolean admin, String content) {
        var message = new ChatMessage(); message.setConversation(chat); message.setFromAdmin(admin); message.setContent(content.trim());
        chat.getMessages().add(message); chat.setUpdatedAt(Instant.now());
    }
    private ReviewResponse review(ProductReview r) { return new ReviewResponse(r.getId(), r.getProduct().getId(), r.getProduct().getName(), r.getUser().getName(), r.getRating(), r.getComment(), r.getAdminReply(), r.getCreatedAt(), r.getRepliedAt()); }
    private ConversationResponse conversation(ProductConversation c) { return new ConversationResponse(c.getId(), c.getProduct().getId(), c.getProduct().getName(), c.getProduct().getImageUrl(), c.getUser().getName(), c.getUser().getEmail(), c.getUpdatedAt(), c.getMessages().stream().map(m -> new ChatMessageResponse(m.getId(), m.isFromAdmin(), m.getContent(), m.getCreatedAt())).toList()); }
}
