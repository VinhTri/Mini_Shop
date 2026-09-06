package com.minishop.product.service;

import com.minishop.common.dto.PageResponse;
import com.minishop.product.dto.request.ProductRequest;
import com.minishop.product.dto.response.ProductResponse;

public interface ProductService {

    PageResponse<ProductResponse> searchPublic(Long categoryId, String q, int page, int size);

    ProductResponse findPublic(Long id);

    PageResponse<ProductResponse> searchAdmin(Long categoryId, String q, int page, int size);

    ProductResponse findAdmin(Long id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);
}
