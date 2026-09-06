package com.minishop.cart.service;

import com.minishop.cart.dto.request.CartItemRequest;
import com.minishop.cart.dto.response.CartResponse;

public interface CartService {

    CartResponse getCart();

    CartResponse add(CartItemRequest request);

    CartResponse update(Long itemId, int quantity);

    CartResponse remove(Long itemId);
}
