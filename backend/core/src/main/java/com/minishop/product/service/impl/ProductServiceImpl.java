package com.minishop.product.service.impl;

import com.minishop.category.entity.Category;
import com.minishop.category.repository.CategoryRepository;
import com.minishop.common.dto.PageResponse;
import com.minishop.common.exception.AppException;
import com.minishop.common.exception.ErrorCode;
import com.minishop.product.dto.request.ProductRequest;
import com.minishop.product.dto.response.ProductResponse;
import com.minishop.product.dto.response.ProductVariantResponse;
import com.minishop.product.entity.Product;
import com.minishop.product.entity.ProductVariant;
import com.minishop.product.repository.ProductRepository;
import com.minishop.product.service.ProductService;
import java.util.List;
import java.math.BigDecimal;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public PageResponse<ProductResponse> searchPublic(Long categoryId, String q, int page, int size) {
        boolean filterCategory = categoryId != null;
        List<Long> categoryIds = filterCategory ? categoryRepository.findSelfAndChildIds(categoryId) : List.of(-1L);
        return PageResponse.of(productRepository
                .search(true, filterCategory, categoryIds, blankToNull(q), PageRequest.of(page, size))
                .map(this::toResponse));
    }

    @Override
    public ProductResponse findPublic(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        if (!product.isActive()) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        return toResponse(product);
    }

    @Override
    public PageResponse<ProductResponse> searchAdmin(Long categoryId, String q, int page, int size) {
        boolean filterCategory = categoryId != null;
        List<Long> categoryIds = filterCategory ? categoryRepository.findSelfAndChildIds(categoryId) : List.of(-1L);
        return PageResponse.of(productRepository
                .search(null, filterCategory, categoryIds, blankToNull(q), PageRequest.of(page, size))
                .map(this::toResponse));
    }

    @Override
    public ProductResponse findAdmin(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        return toResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        apply(product, request);
        return toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = productRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
        apply(product, request);
        return toResponse(product);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new AppException(ErrorCode.PRODUCT_NOT_FOUND);
        }
        productRepository.deleteById(id);
    }

    private void apply(Product product, ProductRequest request) {
        Category category = categoryRepository
                .findById(request.categoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
        product.setCategory(category);
        product.setName(request.name().trim());
        product.setBrand(blankToNull(request.brand()));
        product.setAgeRange(blankToNull(request.ageRange()));
        product.setFlavor(blankToNull(request.flavor()));
        product.setBenefits(blankToNull(request.benefits()));
        product.setProtein(request.protein());
        product.setFat(request.fat());
        product.setFiber(request.fiber());
        product.setIngredients(blankToNull(request.ingredients()));
        product.setFeedingGuide(blankToNull(request.feedingGuide()));
        product.setOrigin(blankToNull(request.origin()));
        product.setShelfLife(blankToNull(request.shelfLife()));
        product.setImageUrl(request.imageUrl());
        product.setDescription(blankToNull(request.description()));
        product.setActive(request.active() == null || request.active());

        product.getVariants().clear();
        request.variants().forEach(item -> {
            ProductVariant variant = new ProductVariant();
            variant.setWeight(item.weight().trim());
            variant.setSku(item.sku() == null || item.sku().isBlank()
                    ? generateSku(product.getName(), item.weight())
                    : item.sku().trim());
            variant.setPrice(item.price());
            variant.setSalePrice(item.salePrice() != null && item.salePrice().compareTo(item.price()) < 0
                    ? item.salePrice()
                    : null);
            variant.setStock(item.stock());
            product.getVariants().add(variant);
        });

        ProductVariant cheapest = product.getVariants().stream()
                .min((left, right) -> effectivePrice(left).compareTo(effectivePrice(right)))
                .orElseThrow();
        product.setPrice(effectivePrice(cheapest));
        product.setOriginalPrice(cheapest.getSalePrice() == null ? null : cheapest.getPrice());
        product.setStock(product.getVariants().stream().mapToInt(ProductVariant::getStock).sum());
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getCategory().getId(),
                product.getCategory().getName(),
                product.getName(),
                product.getPrice(),
                product.getOriginalPrice(),
                product.getStock(),
                product.getImageUrl(),
                product.getDescription(),
                product.isActive(),
                product.getBrand(),
                product.getAgeRange(),
                product.getFlavor(),
                product.getBenefits(),
                product.getProtein(),
                product.getFat(),
                product.getFiber(),
                product.getIngredients(),
                product.getFeedingGuide(),
                product.getOrigin(),
                product.getShelfLife(),
                product.getVariants().isEmpty()
                        ? List.of(new ProductVariantResponse(
                                "Mặc định", "SP-" + product.getId(), product.getOriginalPrice() == null ? product.getPrice() : product.getOriginalPrice(),
                                product.getOriginalPrice() == null ? null : product.getPrice(), product.getStock()))
                        : product.getVariants().stream()
                                .map(variant -> new ProductVariantResponse(
                                        variant.getWeight(), variant.getSku(), variant.getPrice(), variant.getSalePrice(), variant.getStock()))
                                .toList());
    }

    private static BigDecimal effectivePrice(ProductVariant variant) {
        return variant.getSalePrice() == null ? variant.getPrice() : variant.getSalePrice();
    }

    private static String generateSku(String productName, String weight) {
        String readable = (productName + "-" + weight)
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
        if (readable.length() > 45) {
            readable = readable.substring(0, 45).replaceAll("-$", "");
        }
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        return (readable.isBlank() ? "SP" : readable) + "-" + suffix;
    }

    private static String blankToNull(String q) {
        if (q == null || q.isBlank()) {
            return null;
        }
        return q.trim();
    }
}
