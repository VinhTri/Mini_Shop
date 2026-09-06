package com.minishop.product.entity;

import com.minishop.category.entity.Category;
import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal price;

    @Column(precision = 14, scale = 2)
    private BigDecimal originalPrice;

    @Column(nullable = false)
    private int stock;

    @Lob
    @Column(columnDefinition = "MEDIUMTEXT")
    private String imageUrl;

    @Column(length = 2000)
    private String description;

    @Column(length = 120)
    private String brand;

    @Column(length = 80)
    private String ageRange;

    @Column(length = 120)
    private String flavor;

    @Column(length = 1000)
    private String benefits;

    @Column(precision = 6, scale = 2)
    private BigDecimal protein;

    @Column(precision = 6, scale = 2)
    private BigDecimal fat;

    @Column(precision = 6, scale = 2)
    private BigDecimal fiber;

    @Column(length = 3000)
    private String ingredients;

    @Column(length = 3000)
    private String feedingGuide;

    @Column(length = 120)
    private String origin;

    @Column(length = 120)
    private String shelfLife;

    @ElementCollection
    @CollectionTable(name = "product_variants", joinColumns = @JoinColumn(name = "product_id"))
    private List<ProductVariant> variants = new ArrayList<>();

    @Column(nullable = false)
    private boolean active = true;
}
