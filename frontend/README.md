# TVT Meow Frontend

Frontend được chia thành hai ứng dụng độc lập:

- `frontend/customer/`: web khách hàng, chạy ở `http://localhost:5173`.
- `frontend/admin/`: web quản trị, chạy ở `http://localhost:5174`.

## Chạy local

```bash
# Web khách hàng
cd customer
npm install
npm run dev

# Web quản trị (terminal khác)
cd ../admin
npm install
npm run dev
```

Từ thư mục `frontend`, có thể build hoặc lint cả hai app:

```bash
npm run build
npm run lint
```

Customer proxy `/api` về `http://localhost:9090`; admin proxy `/api` về `http://localhost:9091`.
