package com.minishop.cart.service.impl;

import com.minishop.auth.security.CurrentUser;
import com.minishop.cart.dto.request.CartItemRequest;
import com.minishop.cart.dto.response.CartItemResponse;
import com.minishop.cart.dto.response.CartResponse;
import com.minishop.cart.entity.CartItem;
import com.minishop.cart.repository.CartItemRepository;
import com.minishop.cart.service.CartService;
import com.minishop.common.exception.AppException;
import com.minishop.common.exception.ErrorCode;
import com.minishop.product.entity.Product;
import com.minishop.product.entity.ProductVariant;
import com.minishop.product.repository.ProductRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CurrentUser currentUser;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart() {
        return toResponse(cartItemRepository.findByUserId(currentUser.require().getId()));
    }

    @Override
    @Transactional
    public CartResponse add(CartItemRequest request) {
        var user = currentUser.require();
        Product product = productRepository
                .findById(request.productId())
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        if (!product.isActive()) {
            throw new AppException(ErrorCode.PRODUCT_INACTIVE);
        }
        ProductVariant variant = findVariant(product, request.variantSku());
        CartItem item = cartItemRepository
                .findByUserIdAndProductIdAndVariantSku(user.getId(), product.getId(), variant.getSku())
                .orElseGet(() -> {
                    CartItem created = new CartItem();
                    created.setUser(user);
                    created.setProduct(product);
                    created.setVariantSku(variant.getSku());
                    created.setQuantity(0);
                    return created;
                });
        int next = item.getQuantity() + request.quantity();
        if (next > variant.getStock()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK, "Không đủ tồn kho kích cỡ này (còn " + variant.getStock() + ")");
        }
        item.setQuantity(next);
        cartItemRepository.save(item);
        return getCart();
    }

    @Override
    @Transactional
    public CartResponse update(Long itemId, int quantity) {
        var user = currentUser.require();
        CartItem item = cartItemRepository
                .findByIdAndUserId(itemId, user.getId())
                .orElseThrow(() -> new AppException(ErrorCode.CART_ITEM_NOT_FOUND));
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return getCart();
        }
        ProductVariant variant = findVariant(item.getProduct(), item.getVariantSku());
        if (quantity > variant.getStock()) {
            throw new AppException(ErrorCode.INSUFFICIENT_STOCK, "Không đủ tồn kho kích cỡ này (còn " + variant.getStock() + ")");
        }
        item.setQuantity(quantity);
        return getCart();
    }

    @Override
    @Transactional
    public CartResponse remove(Long itemId) {
        var user = currentUser.require();
        cartItemRepository.findByIdAndUserId(itemId, user.getId()).ifPresent(cartItemRepository::delete);
        return getCart();
    }

    private CartResponse toResponse(List<CartItem> items) {
        List<CartItemResponse> rows = items.stream()
                .map(i -> {
                    Product p = i.getProduct();
                    ProductVariant variant = findVariant(p, i.getVariantSku());
                    BigDecimal price = effectivePrice(variant);
                    BigDecimal sub = price.multiply(BigDecimal.valueOf(i.getQuantity()));
                    return new CartItemResponse(
                            i.getId(), p.getId(), p.getName(), p.getImageUrl(), variant.getSku(), variant.getWeight(),
                            price, i.getQuantity(), variant.getStock(), sub);
                })
                .toList();
        BigDecimal total = rows.stream().map(CartItemResponse::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        int count = rows.stream().mapToInt(CartItemResponse::quantity).sum();
        return new CartResponse(rows, total, count);
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
}
