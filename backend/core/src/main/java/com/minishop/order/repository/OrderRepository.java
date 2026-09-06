package com.minishop.order.repository;

import com.minishop.order.entity.Order;
import com.minishop.order.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {

    boolean existsByOrderCode(String orderCode);

    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Order> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status, Pageable pageable);

    long countByCreatedAtGreaterThanEqual(Instant start);

    @Query("select coalesce(sum(o.total), 0) from Order o where o.status = com.minishop.order.enums.OrderStatus.COMPLETED")
    BigDecimal totalCompletedRevenue();
}
