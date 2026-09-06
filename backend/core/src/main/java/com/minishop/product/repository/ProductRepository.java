package com.minishop.product.repository;

import com.minishop.product.entity.Product;
import java.util.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByCategoryId(Long categoryId);

    long countByCategoryId(Long categoryId);

    long countByActiveTrueAndStockLessThanEqual(int stock);

    @Query("""
            select p from Product p
            where (:active is null or p.active = :active)
              and (:filterCategory = false or p.category.id in :categoryIds)
              and (:q is null or lower(p.name) like lower(concat('%', :q, '%')))
            """)
    Page<Product> search(
            @Param("active") Boolean active,
            @Param("filterCategory") boolean filterCategory,
            @Param("categoryIds") Collection<Long> categoryIds,
            @Param("q") String q,
            Pageable pageable);
}
