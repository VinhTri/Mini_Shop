package com.minishop.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    USER_NOT_FOUND("AUTH_1001", "Tài khoản chưa có trong hệ thống!", HttpStatus.NOT_FOUND),
    EMAIL_ALREADY_EXISTS("AUTH_1002", "Email này đã được sử dụng!", HttpStatus.CONFLICT),
    INVALID_CREDENTIALS("AUTH_1006", "Email hoặc mật khẩu không đúng!", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED("AUTH_1009", "Bạn chưa đăng nhập!", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("AUTH_1010", "Bạn không có quyền thực hiện hành động này!", HttpStatus.FORBIDDEN),

    CATEGORY_NOT_FOUND("CAT_5001", "Không tìm thấy danh mục!", HttpStatus.NOT_FOUND),
    CATEGORY_NAME_EXISTS("CAT_5002", "Tên danh mục đã tồn tại!", HttpStatus.CONFLICT),
    CATEGORY_HAS_PRODUCTS("CAT_5003", "Danh mục còn sản phẩm, hãy ẩn thay vì xóa!", HttpStatus.BAD_REQUEST),

    PRODUCT_NOT_FOUND("PROD_2001", "Không tìm thấy sản phẩm!", HttpStatus.NOT_FOUND),
    PRODUCT_INACTIVE("PROD_2002", "Sản phẩm đã ngừng bán!", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_STOCK("PROD_2003", "Không đủ tồn kho!", HttpStatus.BAD_REQUEST),

    CART_EMPTY("CART_3001", "Giỏ hàng trống!", HttpStatus.BAD_REQUEST),
    CART_ITEM_NOT_FOUND("CART_3002", "Sản phẩm không có trong giỏ!", HttpStatus.NOT_FOUND),

    ORDER_NOT_FOUND("ORD_4001", "Không tìm thấy đơn hàng!", HttpStatus.NOT_FOUND),
    ORDER_FORBIDDEN("ORD_4002", "Không thể thao tác đơn của người khác!", HttpStatus.FORBIDDEN),
    ORDER_CANCEL_NOT_ALLOWED("ORD_4003", "Chỉ hủy được đơn chờ xác nhận hoặc đã xác nhận!", HttpStatus.BAD_REQUEST),
    ORDER_INVALID_STATUS("ORD_4004", "Không thể chuyển trạng thái đơn này!", HttpStatus.BAD_REQUEST),
    ORDER_RETURN_NOT_ALLOWED("ORD_4005", "Đơn hàng không đủ điều kiện đổi trả!", HttpStatus.BAD_REQUEST),
    ORDER_INVALID_RETURN_STATUS("ORD_4006", "Không thể chuyển trạng thái đổi trả này!", HttpStatus.BAD_REQUEST),
    ORDER_EXCHANGE_NOT_ALLOWED("ORD_4007", "Đơn hàng không đủ điều kiện đổi hàng!", HttpStatus.BAD_REQUEST),
    ORDER_INVALID_EXCHANGE_STATUS("ORD_4008", "Không thể chuyển trạng thái đổi hàng này!", HttpStatus.BAD_REQUEST),

    INVALID_REQUEST("SYS_4000", "Yêu cầu không hợp lệ!", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION("SYS_9999", "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau!", HttpStatus.INTERNAL_SERVER_ERROR);

    private final String code;
    private final String message;
    private final HttpStatus statusCode;

    ErrorCode(String code, String message, HttpStatus statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatus getStatusCode() {
        return statusCode;
    }
}
