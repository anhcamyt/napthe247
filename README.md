
# NapThe247 - Hệ thống Giao dịch Sản phẩm số & Fintech

Nền tảng trao đổi thẻ cào, mua mã thẻ game/điện thoại, và tích hợp thanh toán (Payment Gateway) chuẩn Enterprise. Hệ thống được thiết kế để xử lý giao dịch tài chính với độ chính xác cao, bảo mật và khả năng mở rộng.

---

## 1. Kiến trúc Hệ thống (System Architecture)

Dự án sử dụng kiến trúc **Monolithic Modular** (dễ dàng tách thành Microservices khi cần) dựa trên NestJS.

### Tech Stack
*   **Frontend**: ReactJS (Vite), TailwindCSS, Lucide Icons.
*   **Backend**: NestJS (Node.js framework).
*   **Database**: PostgreSQL (Primary DB), Redis (Queue & Caching).
*   **Infrastructure**: Docker, Docker Compose, Nginx.

### Các Module Chính (Core Modules)

Hệ thống được chia thành các module nghiệp vụ riêng biệt để đảm bảo tính toàn vẹn dữ liệu:

1.  **Ledger (Sổ cái - Quan trọng nhất)**
    *   **Chức năng**: Ghi lại mọi biến động số dư. Không bao giờ sửa/xóa (Immutable).
    *   **Cơ chế**: Sử dụng Database Transaction (ACID) và Pessimistic Locking để ngăn chặn Race Condition (tránh việc cộng/trừ tiền sai khi có nhiều request cùng lúc).
    *   **Entity**: `TransactionEntity` lưu lịch sử, `WalletEntity` lưu số dư hiện tại.

2.  **Inventory (Kho thẻ)**
    *   **Chức năng**: Quản lý mã thẻ (Softpin).
    *   **Cơ chế**: FIFO (First-In-First-Out). Khi có đơn mua, hệ thống sử dụng `SKIP LOCKED` để lấy thẻ khả dụng nhanh nhất mà không gây khóa bảng database, cho phép bán hàng nghìn thẻ mỗi giây.

3.  **Wallet (Ví điện tử)**
    *   **Chức năng**: Quản lý nạp/rút tiền.
    *   **Tính năng**: Tích hợp Casso (VietQR) để nạp tự động, tích hợp API ngân hàng để chi hộ (Rút tiền).

4.  **Orders (Đơn hàng)**
    *   **Chức năng**: Xử lý logic nghiệp vụ Mua thẻ hoặc Đổi thẻ.
    *   **Luồng xử lý**: 
        *   *Đổi thẻ*: Nhận thẻ -> Gửi sang NCC (Provider) -> Chờ Callback -> Cộng tiền (Ledger).
        *   *Mua thẻ*: Trừ tiền (Ledger) -> Lấy thẻ (Inventory) -> Trả về user.

5.  **Routing (Điều phối luồng)**
    *   **Chức năng**: Quyết định thẻ Viettel 100k sẽ được gửi qua nhà cung cấp A hay B dựa trên độ ổn định và chiết khấu.

---

## 2. Tính năng Chi tiết

### Dành cho Khách hàng (User)
*   **Dashboard**: Xem tổng quan tài sản, dòng tiền.
*   **Đổi thẻ cào**: Gửi thẻ thủ công hoặc tích hợp API (cho web shop game).
*   **Mua mã thẻ**: Mua lẻ hoặc mua sỉ (API).
*   **Ví điện tử**: Nạp tiền tự động qua QR, Rút tiền về ngân hàng/Ví Momo.
*   **Bảo mật**: 2FA (Google Auth), Mã PIN giao dịch, IP Whitelist cho API.
*   **Khiếu nại**: Tạo ticket hỗ trợ ngay trên giao dịch lỗi.

### Dành cho Quản trị viên (Admin)
*   **Cấu hình Phí/Chiết khấu**: Chỉnh sửa lãi suất theo từng nhóm thành viên, từng loại thẻ.
*   **Cấu hình Luồng (Routing)**: Chuyển hướng traffic thẻ sang các NCC khác nhau không cần sửa code.
*   **Quản lý Kho thẻ**: Nhập kho, xem báo cáo tồn kho, giá trị tồn.
*   **Duyệt Rút tiền**: Duyệt tay hoặc bật chế độ Auto-Approve cho các khoản nhỏ.
*   **Đối soát**: Xem log giao dịch chi tiết, file đối soát.

---

## 3. Cài đặt & Triển khai

Xem chi tiết hướng dẫn tại file [DEPLOYMENT.md](./DEPLOYMENT.md).

### Yêu cầu môi trường
*   Docker & Docker Compose (v2 trở lên).
*   Node.js v18+ (nếu chạy local không qua Docker).
*   PostgreSQL 14+.

### Chạy Local (Dev Mode)
1.  Copy `.env.example` thành `.env`.
2.  Chạy lệnh:
    ```bash
    docker-compose up -d
    ```
3.  Truy cập:
    *   Web: http://localhost:3000
    *   API: http://localhost:4000

---

## 4. Bảo mật (Security Notes)

*   **API Key**: User API Key được mã hóa hoặc hash một phần.
*   **Callback Security**: Xác thực IP và Signature của NCC khi nhận Callback kết quả thẻ.
*   **Rate Limiting**: Giới hạn số request API để chống DDoS.
*   **Input Validation**: Sử dụng `class-validator` để kiểm tra dữ liệu đầu vào chặt chẽ.
