package com.minishop.order.service.impl;

import com.minishop.auth.security.CurrentUser;
import com.minishop.cart.entity.CartItem;
import com.minishop.cart.repository.CartItemRepository;
import com.minishop.common.dto.PageResponse;
import com.minishop.common.exception.AppException;
import com.minishop.common.exception.ErrorCode;
import com.minishop.order.dto.request.CheckoutRequest;
import com.minishop.order.dto.response.OrderItemResponse;
import com.minishop.order.dto.response.OrderResponse;
import com.minishop.order.dto.response.StatsResponse;
import com.minishop.order.entity.Order;
import com.minishop.order.entity.OrderItem;
import com.minishop.order.enums.OrderStatus;
import com.minishop.order.enums.PaymentMethod;
import com.minishop.order.enums.PaymentStatus;
import com.minishop.order.enums.ReturnStatus;
import com.minishop.order.enums.ExchangeStatus;
import com.minishop.order.repository.OrderRepository;
import com.minishop.order.service.OrderService;
import com.minishop.product.entity.Product;
import com.minishop.product.entity.ProductVariant;
import com.minishop.product.repository.ProductRepository;
import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final SecureRandom ORDER_CODE_RANDOM = new SecureRandom();
    private static final char[] ORDER_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();
    private static final Set<OrderStatus> OPEN =
            Set.of(OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPING);

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CurrentUser currentUser;

    @Override
    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        var user = currentUser.require();
        List<CartItem> allItems = cartItemRepository.findByUserId(user.getId());
        List<CartItem> items;
        if (request.cartItemIds() == null) {
            items = allItems;
        } else {
            Set<Long> selectedIds = Set.copyOf(request.cartItemIds());
            items = allItems.stream()
                    .filter(item -> selectedIds.contains(item.getId()))
                    .toList();
        }
        if (items.isEmpty()) {
            throw new AppException(ErrorCode.CART_EMPTY);
        }
        Order order = new Order();
        order.setUser(user);
        order.setOrderCode(generateOrderCode());
        order.setStatus(OrderStatus.PENDING);
        order.setFullName(request.fullName().trim());
        order.setPhone(request.phone().trim());
        order.setAddress(request.address().trim());
        order.setNote(request.note() == null ? null : request.note().trim());
        order.setPaymentMethod(request.paymentMethod());
        order.setPaymentStatus(request.paymentMethod() == PaymentMethod.QR ? PaymentStatus.PAID : PaymentStatus.UNPAID);
        order.setReturnStatus(ReturnStatus.NONE);

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem cartItem : items) {
            Product product = productRepository
                    .findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
            if (!product.isActive()) {
                throw new AppException(ErrorCode.PRODUCT_INACTIVE, product.getName() + " đã ngừng bán!");
            }
            ProductVariant variant = findVariant(product, cartItem.getVariantSku());
            if (variant.getStock() < cartItem.getQuantity()) {
                throw new AppException(ErrorCode.INSUFFICIENT_STOCK,
                        product.getName() + " - " + variant.getWeight() + " không đủ tồn kho!");
            }
            variant.setStock(variant.getStock() - cartItem.getQuantity());
            refreshProductStock(product);
            BigDecimal price = effectivePrice(variant);
            OrderItem line = new OrderItem();
            line.setOrder(order);
            line.setProductId(product.getId());
            line.setProductName(product.getName());
            line.setImageUrl(product.getImageUrl());
            line.setVariantSku(variant.getSku());
            line.setVariantName(variant.getWeight());
            line.setPrice(price);
            line.setQuantity(cartItem.getQuantity());
            order.getItems().add(line);
            total = total.add(price.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
        }
        order.setTotal(total);
        orderRepository.save(order);
        cartItemRepository.deleteAll(items);
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> myOrders(int page, int size) {
        var user = currentUser.require();
        return PageResponse.of(orderRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size))
                .map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse findMine(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        if (!order.getUser().getId().equals(currentUser.require().getId()) && !currentUser.isAdmin()) {
            throw new AppException(ErrorCode.ORDER_FORBIDDEN);
        }
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse cancelMine(Long id) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        if (!order.getUser().getId().equals(currentUser.require().getId())) {
            throw new AppException(ErrorCode.ORDER_FORBIDDEN);
        }
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new AppException(ErrorCode.ORDER_CANCEL_NOT_ALLOWED);
        }
        restoreStock(order);
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelledAt(Instant.now());
        return toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> adminOrders(OrderStatus status, int page, int size) {
        var data = status == null
                ? orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                : orderRepository.findByStatusOrderByCreatedAtDesc(status, PageRequest.of(page, size));
        return PageResponse.of(data.map(this::toResponse));
    }

    @Override
    @Transactional
    public OrderResponse changeStatus(Long id, OrderStatus next) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        OrderStatus current = order.getStatus();
        if (current == next) {
            return toResponse(order);
        }
        if (!canTransit(current, next)) {
            throw new AppException(ErrorCode.ORDER_INVALID_STATUS, "Không thể chuyển " + current + " → " + next);
        }
        if (next == OrderStatus.CANCELLED) {
            restoreStock(order);
        }
        order.setStatus(next);
        Instant changedAt = Instant.now();
        switch (next) {
            case CONFIRMED -> order.setConfirmedAt(changedAt);
            case SHIPPING -> order.setShippingAt(changedAt);
            case COMPLETED -> order.setCompletedAt(changedAt);
            case CANCELLED -> order.setCancelledAt(changedAt);
            default -> { }
        }
        if (next == OrderStatus.COMPLETED && order.getPaymentMethod() == PaymentMethod.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse requestReturn(Long id, String reason, String description) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        if (!order.getUser().getId().equals(currentUser.require().getId())) {
            throw new AppException(ErrorCode.ORDER_FORBIDDEN);
        }
        if (order.getStatus() != OrderStatus.COMPLETED || order.getReturnStatus() != ReturnStatus.NONE
                || order.getExchangeStatus() != ExchangeStatus.NONE) {
            throw new AppException(ErrorCode.ORDER_RETURN_NOT_ALLOWED,
                    "Chỉ đơn đã hoàn thành và chưa yêu cầu đổi trả mới được gửi yêu cầu");
        }
        if (order.getCompletedAt() == null || Instant.now().isAfter(order.getCompletedAt().plus(7, ChronoUnit.DAYS))) {
            throw new AppException(ErrorCode.ORDER_RETURN_NOT_ALLOWED, "Đơn hàng đã quá thời hạn đổi trả 7 ngày");
        }
        order.setReturnStatus(ReturnStatus.REQUESTED);
        order.setReturnReason(reason.trim());
        order.setReturnDescription(description.trim());
        order.setReturnRequestedAt(Instant.now());
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse submitRefundBank(Long id, String bankName, String accountName, String accountNumber) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        if (!order.getUser().getId().equals(currentUser.require().getId())) {
            throw new AppException(ErrorCode.ORDER_FORBIDDEN);
        }
        if (order.getReturnStatus() != ReturnStatus.APPROVED) {
            throw new AppException(ErrorCode.ORDER_RETURN_NOT_ALLOWED,
                    "Chỉ nhập thông tin nhận tiền sau khi yêu cầu đổi trả được chấp nhận");
        }
        order.setRefundBankName(bankName.trim());
        order.setRefundAccountName(accountName.trim().toUpperCase());
        order.setRefundAccountNumber(accountNumber.trim());
        order.setRefundBankSubmittedAt(Instant.now());
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse changeReturnStatus(Long id, ReturnStatus next) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        ReturnStatus current = order.getReturnStatus();
        if (current == next) {
            return toResponse(order);
        }
        if (!canTransitReturn(current, next)) {
            throw new AppException(ErrorCode.ORDER_INVALID_RETURN_STATUS,
                    "Không thể chuyển đổi trả " + current + " → " + next);
        }
        if (next == ReturnStatus.ITEM_RECEIVED && order.getRefundAccountNumber() == null) {
            throw new AppException(ErrorCode.ORDER_INVALID_RETURN_STATUS,
                    "Khách hàng chưa nhập thông tin tài khoản nhận tiền hoàn");
        }
        order.setReturnStatus(next);
        Instant changedAt = Instant.now();
        if (next == ReturnStatus.APPROVED) {
            order.setReturnApprovedAt(changedAt);
        } else if (next == ReturnStatus.ITEM_RECEIVED) {
            order.setReturnItemReceivedAt(changedAt);
        } else if (next == ReturnStatus.REFUNDING) {
            order.setPaymentStatus(PaymentStatus.REFUND_PENDING);
        } else if (next == ReturnStatus.REFUNDED) {
            order.setPaymentStatus(PaymentStatus.REFUNDED);
            order.setRefundedAt(changedAt);
        }
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse requestExchange(Long id, Long productId, String requestedVariant, String reason, String description) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        if (!order.getUser().getId().equals(currentUser.require().getId())) {
            throw new AppException(ErrorCode.ORDER_FORBIDDEN);
        }
        if (order.getStatus() != OrderStatus.COMPLETED || order.getExchangeStatus() != ExchangeStatus.NONE
                || order.getReturnStatus() != ReturnStatus.NONE) {
            throw new AppException(ErrorCode.ORDER_EXCHANGE_NOT_ALLOWED,
                    "Chỉ đơn đã hoàn thành và chưa yêu cầu đổi hàng mới được gửi yêu cầu");
        }
        if (order.getCompletedAt() == null || Instant.now().isAfter(order.getCompletedAt().plus(7, ChronoUnit.DAYS))) {
            throw new AppException(ErrorCode.ORDER_EXCHANGE_NOT_ALLOWED, "Đơn hàng đã quá thời hạn đổi hàng 7 ngày");
        }
        boolean belongsToOrder = order.getItems().stream().anyMatch(item -> item.getProductId().equals(productId));
        if (!belongsToOrder) {
            throw new AppException(ErrorCode.ORDER_EXCHANGE_NOT_ALLOWED, "Sản phẩm không thuộc đơn hàng này");
        }
        order.setExchangeStatus(ExchangeStatus.REQUESTED);
        order.setExchangeProductId(productId);
        order.setExchangeRequestedVariant(requestedVariant);
        order.setExchangeReason(reason != null ? reason.trim() : null);
        order.setExchangeDescription(description != null ? description.trim() : null);
        order.setExchangeRequestedAt(Instant.now());
        return toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse changeExchangeStatus(Long id, ExchangeStatus next) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        ExchangeStatus current = order.getExchangeStatus();
        if (current == next) {
            return toResponse(order);
        }
        if (!canTransitExchange(current, next)) {
            throw new AppException(ErrorCode.ORDER_INVALID_EXCHANGE_STATUS,
                    "Không thể chuyển đổi hàng " + current + " → " + next);
        }
        order.setExchangeStatus(next);
        Instant changedAt = Instant.now();
        switch (next) {
            case APPROVED -> order.setExchangeApprovedAt(changedAt);
            case ITEM_RECEIVED -> order.setExchangeItemReceivedAt(changedAt);
            case SHIPPING -> order.setExchangeShippingAt(changedAt);
            case COMPLETED -> order.setExchangeCompletedAt(changedAt);
            default -> {}
        }
        return toResponse(order);
    }

    @Override
    public StatsResponse stats() {
        var startToday = LocalDate.now(VN).atStartOfDay(VN).toInstant();
        return new StatsResponse(
                orderRepository.countByCreatedAtGreaterThanEqual(startToday),
                orderRepository.totalCompletedRevenue(),
                productRepository.countByActiveTrueAndStockLessThanEqual(5));
    }

    private void restoreStock(Order order) {
        if (!OPEN.contains(order.getStatus())) {
            return;
        }
        for (OrderItem line : order.getItems()) {
            productRepository.findById(line.getProductId()).ifPresent(product -> {
                if (line.getVariantSku() != null) {
                    product.getVariants().stream()
                            .filter(v -> v.getSku().equals(line.getVariantSku()))
                            .findFirst()
                            .ifPresent(v -> v.setStock(v.getStock() + line.getQuantity()));
                    refreshProductStock(product);
                } else {
                    product.setStock(product.getStock() + line.getQuantity());
                }
            });
        }
    }

    private boolean canTransit(OrderStatus from, OrderStatus to) {
        return switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED || to == OrderStatus.CANCELLED;
            case CONFIRMED -> to == OrderStatus.SHIPPING || to == OrderStatus.CANCELLED;
            case SHIPPING -> to == OrderStatus.COMPLETED;
            default -> false;
        };
    }

    private boolean canTransitReturn(ReturnStatus from, ReturnStatus to) {
        return switch (from) {
            case REQUESTED -> to == ReturnStatus.APPROVED || to == ReturnStatus.REJECTED;
            case APPROVED -> to == ReturnStatus.ITEM_RECEIVED;
            case ITEM_RECEIVED -> to == ReturnStatus.REFUNDING || to == ReturnStatus.REFUNDED;
            case REFUNDING -> to == ReturnStatus.REFUNDED;
            default -> false;
        };
    }

    private boolean canTransitExchange(ExchangeStatus from, ExchangeStatus to) {
        return switch (from) {
            case REQUESTED -> to == ExchangeStatus.APPROVED || to == ExchangeStatus.REJECTED;
            case APPROVED -> to == ExchangeStatus.ITEM_RECEIVED;
            case ITEM_RECEIVED -> to == ExchangeStatus.SHIPPING;
            case SHIPPING -> to == ExchangeStatus.COMPLETED;
            default -> false;
        };
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getProductId(),
                        i.getProductName(),
                        i.getImageUrl(),
                        i.getVariantSku(),
                        i.getVariantName(),
                        i.getPrice(),
                        i.getQuantity(),
                        i.getPrice().multiply(BigDecimal.valueOf(i.getQuantity()))))
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getOrderCode(),
                order.getStatus(),
                order.getFullName(),
                order.getPhone(),
                order.getAddress(),
                order.getNote(),
                order.getPaymentMethod(),
                order.getPaymentStatus(),
                order.getReturnStatus(),
                order.getReturnReason(),
                order.getReturnDescription(),
                order.getReturnRequestedAt(),
                order.getReturnApprovedAt(),
                order.getRefundBankName(),
                order.getRefundAccountName(),
                order.getRefundAccountNumber(),
                order.getRefundBankSubmittedAt(),
                order.getReturnItemReceivedAt(),
                order.getRefundedAt(),
                order.getExchangeStatus(),
                order.getExchangeProductId(),
                order.getExchangeRequestedVariant(),
                order.getExchangeReason(),
                order.getExchangeDescription(),
                order.getExchangeRequestedAt(),
                order.getExchangeApprovedAt(),
                order.getExchangeItemReceivedAt(),
                order.getExchangeShippingAt(),
                order.getExchangeCompletedAt(),
                order.getTotal(),
                order.getCreatedAt(),
                order.getConfirmedAt(),
                order.getShippingAt(),
                order.getCompletedAt(),
                order.getCancelledAt(),
                items);
    }

    private String generateOrderCode() {
        String date = LocalDate.now(VN).format(DateTimeFormatter.BASIC_ISO_DATE);
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder suffix = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                suffix.append(ORDER_CODE_CHARS[ORDER_CODE_RANDOM.nextInt(ORDER_CODE_CHARS.length)]);
            }
            String code = "TVT-" + date + "-" + suffix;
            if (!orderRepository.existsByOrderCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Không thể tạo mã đơn hàng duy nhất");
    }

    private ProductVariant findVariant(Product product, String sku) {
        return product.getVariants().stream()
                .filter(v -> v.getSku().equals(sku))
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND, "Không tìm thấy kích cỡ sản phẩm"));
    }

    private BigDecimal effectivePrice(ProductVariant variant) {
        return variant.getSalePrice() != null ? variant.getSalePrice() : variant.getPrice();
    }

    private void refreshProductStock(Product product) {
        product.setStock(product.getVariants().stream().mapToInt(ProductVariant::getStock).sum());
    }
}
