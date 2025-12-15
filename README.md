
# NapThe247 - Hệ thống Fintech & Thẻ cào

Hệ thống Full-stack (React + NestJS) quản lý giao dịch sản phẩm số.

## 1. Yêu cầu hệ thống
*   Docker & Docker Compose (v2.0+)
*   Node.js v18+ (nếu chạy local)

## 2. Quick Start (Production/Staging)

Chỉ cần 1 lệnh để chạy toàn bộ hệ thống:

```bash
# 1. Clone repo
git clone <repo_url>
cd napthe247

# 2. Cấu hình Env
cp .env.example .env
# (Tùy chọn) Chỉnh sửa .env nếu cần đổi pass DB

# 3. Khởi chạy
docker compose up -d --build
```

### Truy cập:
*   **Web App**: http://localhost:3000
*   **API**: http://localhost:4000/api/v1
*   **Swagger Docs**: http://localhost:4000/api/docs

## 3. Chạy Local Development

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
# Root folder
npm install
npm run dev
```

## 4. Default Accounts (Seeded Data)
*   **User A (Pro)**: ID `u1` - Balance: 1,542,000đ
*   **User B**: ID `u2` - Balance: 50,000đ
*   **Admin**: ID `u3`

## 5. Cấu trúc Project
*   `/backend`: NestJS API Server (Cổng 4000).
*   `/`: React Frontend (Cổng 3000 via Nginx).
*   `services/api.ts`: Mock Adapter (Frontend dùng cái này để demo ngay lập tức mà không cần backend xử lý phức tạp).

## 6. Healthcheck
*   Kiểm tra API: `curl http://localhost:4000/api/v1` (Nên trả về 404 hoặc hello message nếu cấu hình).
*   Logs: `docker compose logs -f api`

## 7. Troubleshooting
*   **Lỗi DB Connection**: Đảm bảo container `postgres` đã healthy (xem `docker ps`).
*   **Lỗi CORS**: Kiểm tra biến `FRONTEND_URL` trong `.env`.
