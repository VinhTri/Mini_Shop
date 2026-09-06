package com.minishop.order.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RefundBankRequest(
        @NotBlank(message = "Vui lòng chọn ngân hàng")
        @Size(max = 80, message = "Tên ngân hàng tối đa 80 ký tự")
        String bankName,
        @NotBlank(message = "Vui lòng nhập tên chủ tài khoản")
        @Size(max = 120, message = "Tên chủ tài khoản tối đa 120 ký tự")
        String accountName,
        @NotBlank(message = "Vui lòng nhập số tài khoản")
        @Pattern(regexp = "[0-9]{6,20}", message = "Số tài khoản phải gồm 6-20 chữ số")
        String accountNumber) {}
