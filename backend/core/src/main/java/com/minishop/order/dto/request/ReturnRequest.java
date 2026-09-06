package com.minishop.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReturnRequest(
        @NotBlank(message = "Vui lòng nhập lý do đổi trả")
        @Size(max = 120, message = "Lý do đổi trả tối đa 120 ký tự")
        String reason,
        @NotBlank(message = "Vui lòng mô tả tình trạng sản phẩm")
        @Size(max = 1500, message = "Mô tả tối đa 1500 ký tự")
        String description) {}
