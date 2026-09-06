package com.minishop.product.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Embeddable
public class ProductVariant {
    @Column(name = "weight_label", nullable = false, length = 60)
    private String weight;
    @Column(nullable = false, length = 80)
    private String sku;
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal price;
    @Column(name = "sale_price", precision = 14, scale = 2)
    private BigDecimal salePrice;
    @Column(nullable = false)
    private int stock;
}
