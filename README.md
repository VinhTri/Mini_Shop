# TVT Meow

Shop **đồ ăn & phụ kiện cho mèo** (1 cửa hàng). Spring Boot + React + JWT, giỏ hàng, thanh toán **COD/QR**, admin xử lý đơn.

## Chạy local

Cần **Java 17**, **Node 18+** và MySQL đang chạy.

```bash
# Terminal 1 - Customer API http://localhost:9090
cd backend
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
./mvnw -pl api-app-customer -am spring-boot:run

# Terminal 2 - Admin API http://localhost:9091
cd backend
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
./mvnw -pl api-web-admin -am spring-boot:run

# Terminal 3 - Customer web http://localhost:5173
cd frontend/customer
npm install
npm run dev

# Terminal 4 - Admin web http://localhost:5174
cd frontend/admin
npm install
npm run dev
```

Customer Swagger: [http://localhost:9090/swagger-ui.html](http://localhost:9090/swagger-ui.html)

Admin Swagger: [http://localhost:9091/swagger-ui.html](http://localhost:9091/swagger-ui.html)

### Tài khoản demo

Tài khoản demo mặc định bị tắt. Sao chép `backend/.env.properties.example`
thành `backend/.env.properties`, đặt mật khẩu riêng và bật
`APP_SEED_ENABLED=true` nếu cần tạo dữ liệu demo.

| Role | Email | Mật khẩu |
|------|--------|----------|
| Admin | Giá trị `SEED_ADMIN_EMAIL` | Giá trị `SEED_ADMIN_PASSWORD` |
| User | Giá trị `SEED_USER_EMAIL` | Giá trị `SEED_USER_PASSWORD` |

## MySQL

```bash
docker compose up -d
cd backend && ./mvnw -pl api-app-customer -am spring-boot:run
```

Sao chép `.env.example` thành `.env` và đặt `MYSQL_ROOT_PASSWORD` trước
khi chạy Docker. Giá trị `DB_PASSWORD` trong `backend/.env.properties`
phải trùng với mật khẩu này.

Customer frontend kết nối API `http://localhost:9090`. Admin frontend kết nối API độc lập `http://localhost:9091` qua `VITE_API_URL`.

Khi bật seed, hai tài khoản demo được tạo hoặc khôi phục đúng quyền và
mật khẩu mỗi khi backend customer khởi động.

## Phạm vi MVP

- Đăng ký / đăng nhập JWT, role USER | ADMIN
- Catalog: danh mục, tìm kiếm, chi tiết
- Giỏ hàng lưu DB, tổng tiền tính ở server
- Checkout COD/QR mô phỏng, user hủy khi PENDING, hoàn tồn kho
- Admin: CRUD danh mục/sản phẩm, đổi trạng thái đơn, dashboard 3 số

Không làm: PayOS, voucher, đánh giá, microservices.

## Cấu trúc

```
backend/
  core/               entity, repository, security, service
  api-app-customer/   controller user + app chay
  api-web-admin/      ứng dụng Spring Boot Admin, port 9091
frontend/customer/    Customer web — React + Vite, port 5173
frontend/admin/       Admin web — React + Vite, port 5174
```
