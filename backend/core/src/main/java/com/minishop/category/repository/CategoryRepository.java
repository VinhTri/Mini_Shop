package com.minishop.category.repository;

import com.minishop.category.entity.Category;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByActiveTrueAndParentIsNullOrderBySortOrderAscNameAsc();

    List<Category> findByActiveTrueOrderBySortOrderAscNameAsc();

    List<Category> findByParentIsNullOrderBySortOrderAscNameAsc();

    List<Category> findByParentIdOrderBySortOrderAscNameAsc(Long parentId);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByParentId(Long parentId);

    @Query("""
            select c.id from Category c
            where c.id = :id
               or c.parent.id = :id
            """)
    List<Long> findSelfAndChildIds(@Param("id") Long id);
}
