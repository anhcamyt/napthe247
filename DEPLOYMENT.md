
# Hướng dẫn Triển khai (Deployment Guide)

Tài liệu này hướng dẫn chi tiết cách triển khai hệ thống NapThe247 lên máy chủ Linux (Ubuntu/CentOS) sử dụng Docker.

---

## 1. Chuẩn bị (Prerequisites)

*   **VPS/Server**: Tối thiểu 2 CPU, 4GB RAM (Khuyến nghị 4 CPU, 8GB RAM cho Production).
*   **Hệ điều hành**: Ubuntu 20.04/22.04 LTS.
*   **Domain**: Một tên miền đã trỏ về IP của VPS (ví dụ: `napthe247.com` và `api.napthe247.com`).

## 2. Cài đặt Môi trường

SSH vào VPS và chạy các lệnh sau:

### Bước 1: Cài đặt Docker & Docker Compose

```bash
# Cập nhật hệ thống
sudo apt update && sudo apt upgrade -y

# Cài đặt các gói cần thiết
sudo apt install apt-transport-https ca-certificates curl software-properties-common -y

# Thêm GPG key của Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Thêm repo Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cài đặt Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin -y

# Kiểm tra
docker compose version
```

### Bước 2: Setup Project

```bash
# Tạo thư mục dự án
mkdir /var/www/napthe247
cd /var/www/napthe247

# Clone code (hoặc upload file từ máy local lên)
git clone <your-repo-url> .
```

## 3. Cấu hình (Configuration)

### Bước 1: Biến môi trường

Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
nano .env
```

**Lưu ý quan trọng trong `.env` Production:**
*   `DB_PASS`: Đặt mật khẩu dài, phức tạp.
*   `JWT_SECRET`: Chuỗi ngẫu nhiên bảo mật.
*   `NODE_ENV`: Set là `production`.

### Bước 2: Cấu hình Docker Compose (Nếu cần)

Kiểm tra file `docker-compose.yml`. Đảm bảo restart policy là `always`.

## 4. Khởi chạy (Start System)

```bash
docker compose up -d --build
```

Kiểm tra trạng thái các container:
```bash
docker compose ps
```

Nếu tất cả trạng thái là `Up`, hệ thống đã chạy.
- Frontend đang lắng nghe ở port `3000`.
- Backend đang lắng nghe ở port `4000`.

## 5. Cấu hình Nginx & SSL (Reverse Proxy)

Để chạy domain thật và có HTTPS, ta cần cài Nginx trên máy chủ (ngoài Docker) hoặc dùng một container Nginx riêng. Dưới đây là cách cài trực tiếp trên Host.

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### Cấu hình Nginx Block

Tạo file config: `/etc/nginx/sites-available/napthe247`

```nginx
# Backend API
server {
    server_name api.napthe247.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    server_name napthe247.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site và reload Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/napthe247 /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Cài đặt SSL (HTTPS)

```bash
sudo certbot --nginx -d napthe247.com -d api.napthe247.com
```

## 6. Bảo trì & Backup (Maintenance)

### Backup Database
Tạo cronjob để backup database hàng ngày:

```bash
# Script backup.sh
docker exec napthe247_db pg_dump -U admin napthe247 > /backup/db_$(date +%F).sql
```

### Xem Logs
```bash
docker compose logs -f api  # Xem log backend
docker compose logs -f web  # Xem log frontend
```

### Cập nhật Code mới
```bash
git pull
docker compose up -d --build --no-deps api web
```
