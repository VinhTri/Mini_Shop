package com.minishop.order.entity;

import com.minishop.order.enums.OrderStatus;
import com.minishop.order.enums.PaymentMethod;
import com.minishop.order.enums.PaymentStatus;
import com.minishop.order.enums.ReturnStatus;
import com.minishop.order.enums.ExchangeStatus;
import com.minishop.user.entity.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 24)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20) default 'PENDING'")
    private OrderStatus status = OrderStatus.PENDING;

    @Column(nullable = false, length = 80)
    private String fullName;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(length = 500)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20) default 'COD'")
    private PaymentMethod paymentMethod = PaymentMethod.COD;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20) default 'UNPAID'")
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30, columnDefinition = "varchar(30) default 'NONE'")
    private ReturnStatus returnStatus = ReturnStatus.NONE;

    @Column(length = 1000)
    private String returnReason;

    @Column(length = 1500)
    private String returnDescription;

    private Instant returnRequestedAt;

    private Instant returnApprovedAt;

    @Column(length = 80)
    private String refundBankName;

    @Column(length = 120)
    private String refundAccountName;

    @Column(length = 40)
    private String refundAccountNumber;

    private Instant refundBankSubmittedAt;

    private Instant returnItemReceivedAt;

    private Instant refundedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30, columnDefinition = "varchar(30) default 'NONE'")
    private ExchangeStatus exchangeStatus = ExchangeStatus.NONE;

    private Long exchangeProductId;

    @Column(length = 80)
    private String exchangeRequestedVariant;

    @Column(length = 120)
    private String exchangeReason;

    @Column(length = 1500)
    private String exchangeDescription;

    private Instant exchangeRequestedAt;
    private Instant exchangeApprovedAt;
    private Instant exchangeItemReceivedAt;
    private Instant exchangeShippingAt;
    private Instant exchangeCompletedAt;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal total;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant confirmedAt;

    private Instant shippingAt;

    private Instant completedAt;

    private Instant cancelledAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
