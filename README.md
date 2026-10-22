# HỆ THỐNG QUẢN LÝ SINH VIÊN (ĐỀ TÀI 02)
> **Môn học:** Triển khai và Quản trị Hệ thống Phần mềm  
> **Sinh viên thực hiện:** DTC245200257  
> **Repository:** [https://github.com/dtc245200257-cell/de02_quanlysinhvien](https://github.com/dtc245200257-cell/de02_quanlysinhvien)

---

## 1. Giới thiệu Đề tài
Hệ thống Quản lý Sinh viên (Đề tài 02) được xây dựng theo chuẩn kiến trúc Microservices & Containerized bằng Docker Compose, đáp ứng đầy đủ các tiêu chuẩn kỹ thuật:
- **Ứng dụng Web:** Quản lý sinh viên, lớp học, điểm số (CRUD), tính toán GPA, xếp loại học lực (Xuất sắc, Giỏi, Khá, Trung bình, Yếu) và Dashboard biểu đồ phân tích.
- **Cơ sở dữ liệu:** MySQL 8.0 lưu trữ quan hệ và công cụ phpMyAdmin quản trị trực quan.
- **Reverse Proxy:** Nginx xử lý cân bằng tải, SSL/TLS tự ký, chuyển hướng HTTP sang HTTPS và các Security Headers nâng cao.
- **Giám sát (Monitoring):** Prometheus thu thập metrics hệ thống/ứng dụng/database/container, Grafana trực quan hóa số liệu qua Dashboard chuyên sâu.
- **Quản lý Log tập trung (Logging):** Grafana Loki thu thập log qua Promtail và hỗ trợ truy vấn LogQL thời gian thực.
- **Bảo mật & Gia cố (Hardening):** Triển khai phân tách mạng (Network Isolation), Non-root container, hạn chế đặc quyền DB, giới hạn tài nguyên và cấu hình bảo mật Nginx.

---

## 2. Kiến trúc Hệ thống (Stack Công nghệ)

```mermaid
flowchart TD
    Client(["Người dùng / Trình duyệt"]) -->|HTTP 80 / HTTPS 443| Nginx["Nginx Reverse Proxy\n(HTTPS, Security Headers)"]
    
    subgraph Frontend_Net ["qlsv_frontend_net"]
        Nginx
    end

    subgraph Backend_Net ["qlsv_backend_net"]
        App["Node.js / Express Web App\n(Non-root node UID 1000)"]
        DB[("MySQL 8.0 Database\n(User student_user)")]
        PMA["phpMyAdmin"]
    end

    subgraph Monitoring_Net ["qlsv_monitoring_net"]
        Prometheus["Prometheus Server\n(Scrape 5s)"]
        Grafana["Grafana Dashboard\n(Auto-provisioning)"]
        Loki["Grafana Loki\n(Central Log Engine)"]
        Promtail["Promtail Log Collector"]
        cAdvisor["cAdvisor Exporter"]
        NodeExp["Node Exporter"]
        MySQLExp["MySQL Exporter"]
    end

    Nginx -->|Proxy Pass| App
    Nginx -->|Proxy Pass /phpmyadmin/| PMA
    App -->|SQL Queries| DB
    PMA -->|Manage| DB

    Prometheus -->|Scrape /metrics| App
    Prometheus -->|Scrape :9104| MySQLExp
    Prometheus -->|Scrape :9100| NodeExp
    Prometheus -->|Scrape :8080| cAdvisor
    MySQLExp -->|Metrics| DB

    Promtail -->|Docker Socket Logs| Loki
    Promtail -->|Nginx Access Logs| Loki
    Grafana -->|Query Metrics| Prometheus
    Grafana -->|Query Logs (LogQL)| Loki
```

---

## 3. Cấu trúc Thư mục Repository

```
de02_quanlysinhvien/
├── .env.example                       # File mẫu biến môi trường bảo mật
├── .gitignore                         # Danh sách file loại trừ
├── docker-compose.yml                 # File điều phối 11 services chuẩn Hardening
├── README.md                          # Tài liệu kỹ thuật chi tiết
├── app/                               # Mã nguồn Ứng dụng Quản lý Sinh viên
│   ├── Dockerfile                     # Dockerfile Non-root user (node:18-alpine)
│   ├── package.json                   # Dependencies (express, mysql2, prom-client)
│   ├── server.js                      # REST API, Prometheus Metrics & Log format
│   └── public/                        # Giao diện Bootstrap 5, FontAwesome & Chart.js
├── database/                          # Khởi tạo Database & Bảo mật
│   ├── init.sql                       # DDL bảng, Seed data và phân quyền user
│   └── my.cnf                         # Cấu hình chứng thực an toàn cho MySQL Exporter
├── nginx/                             # Reverse Proxy & SSL
│   ├── nginx.conf                     # Cấu hình SSL TLS 1.2/1.3, Headers, Proxy
│   └── ssl/                           # Chứng chỉ SSL tự ký
├── prometheus/                        # Cấu hình thu thập số liệu
│   └── prometheus.yml                 # Khai báo jobs: app, mysql, node, cadvisor
├── grafana/                           # Tự động nạp Dashboards & Datasources
│   ├── provisioning/
│   │   ├── datasources/datasources.yml# Nạp sẵn Prometheus & Loki
│   │   └── dashboards/dashboards.yml  # Nạp tự động thư mục dashboards
│   └── dashboards/
│       ├── system_overview.json       # Dashboard giám sát Web, MySQL & Container
│       └── logs_overview.json         # Dashboard truy vấn LogQL thời gian thực
├── loki/                              # Cấu hình lưu trữ Log
│   └── loki-config.yml
└── promtail/                          # Cấu hình thu thập log Docker & Nginx
    └── promtail-config.yml
```

---

## 4. Hướng dẫn Khởi chạy Hệ thống

### Bước 1: Clone dự án
```bash
git clone https://github.com/dtc245200257-cell/de02_quanlysinhvien.git
cd de02_quanlysinhvien
```

### Bước 2: Thiết lập file môi trường
```bash
cp .env.example .env
```

### Bước 3: Khởi chạy toàn bộ hệ thống bằng Docker Compose
```bash
docker compose up -d --build
```

### Bước 4: Kiểm tra trạng thái toàn bộ 11 container
```bash
docker compose ps
```

---

## 5. Bảng Cổng Dịch vụ & Tài khoản Đăng nhập

| Dịch vụ | Giao thức / Port | URL Truy cập | Tài khoản / Mật khẩu |
| :--- | :--- | :--- | :--- |
| **Web QLSV (HTTPS)** | HTTPS : 443 | `https://192.168.253.129/` | Truy cập trực tiếp (Bấm *Nâng cao* -> *Tiếp tục*) |
| **Web QLSV (HTTP)** | HTTP : 80 | `http://192.168.253.129/` | Tự động chuyển hướng (301 Redirect) sang HTTPS |
| **phpMyAdmin** | HTTPS / Path | `https://192.168.253.129/phpmyadmin/` | `root` / `RootPass_QLSV@2026!Secured`<br>hoặc `student_user` / `StudentPass_2026!Sec` |
| **Grafana Dashboard** | HTTP : 3000 | `http://192.168.253.129:3000` | User: `admin` / Password: `admin` (hoặc `RootPass_QLSV@2026!Secured`) |
| **Prometheus** | HTTP : 9090 | `http://192.168.253.129:9090` | Không yêu cầu xác thực |
| **Loki Log Engine** | HTTP : 3100 | `http://192.168.253.129:3100` | Endpoint tiếp nhận và truy vấn Log |
| **Healthcheck API** | HTTPS / Path | `https://192.168.253.129/health` | Kiểm tra kết nối DB và trạng thái Uptime |
| **App Metrics API** | HTTPS / Path | `https://192.168.253.129/metrics` | Định dạng Prometheus Metrics ứng dụng Web |

---

## 6. Truy vấn Log Tập trung (LogQL)
Hệ thống sử dụng Grafana Loki và Promtail để gom toàn bộ log từ các Docker containers và access log Nginx. Một số câu truy vấn LogQL mẫu đã được cấu hình sẵn trong dashboard:

1. **Xem log trực tiếp của ứng dụng Quản lý Sinh viên:**
   ```logql
   {container="qlsv_app"}
   ```
2. **Phân tích log Nginx dưới dạng JSON và lọc mã lỗi HTTP:**
   ```logql
   {container="qlsv_nginx"} | json | status >= 400
   ```
3. **Lọc tất cả các dòng log có chứa cảnh báo hoặc lỗi toàn hệ thống:**
   ```logql
   {container=~"qlsv_.*"} |= "error" or {container=~"qlsv_.*"} |= "warn"
   ```
4. **Đo tốc độ sinh log theo từng container theo thời gian:**
   ```logql
   sum by (container) (rate({container=~"qlsv_.*"}[1m]))
   ```

---

## 7. Các Biện pháp Hardening & An toàn Hệ thống (Tiêu chí 6)

1. **Chạy container với người dùng Non-root:**
   - Ứng dụng Node.js chạy dưới user `node` (UID 1000).
   - Prometheus chạy dưới user `nobody` (UID 65534).
   - Grafana chạy dưới user `grafana` (UID 472).
   - Loki chạy dưới user `loki` (UID 10001).
2. **Cô lập mạng (Network Isolation):**
   - Tạo 3 mạng độc lập: `qlsv_frontend_net`, `qlsv_backend_net`, `qlsv_monitoring_net`.
   - Cơ sở dữ liệu MySQL hoàn toàn nằm trong mạng nội bộ, **không mở cổng 3306 ra host**, ngăn chặn triệt để tấn công dò quét từ bên ngoài.
3. **Nguyên tắc đặc quyền tối thiểu Database (Least Privilege):**
   - Ứng dụng kết nối DB bằng tài khoản riêng `student_user`, chỉ được cấp các quyền `SELECT, INSERT, UPDATE, DELETE` trên database `qlsinhvien`.
   - Vô hiệu hóa các quyền nguy hiểm: `DROP`, `ALTER`, `GRANT`, `SUPER`, `SHUTDOWN`.
4. **Nginx Security Headers & SSL Hardening:**
   - HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains`).
   - Ngăn chặn Clickjacking (`X-Frame-Options: SAMEORIGIN`).
   - Chống MIME-sniffing (`X-Content-Type-Options: nosniff`).
   - Bảo vệ chống XSS (`X-XSS-Protection: 1; mode=block`).
   - Ẩn thông tin phiên bản web server (`server_tokens off`).
   - Hạn chế giao thức chỉ dùng TLS 1.2 và TLS 1.3 với danh sách Cipher an toàn.
5. **Giới hạn tài nguyên (Resource Limits) & Cờ bảo mật:**
   - Cấu hình `cpus` và `memory` limits cho từng container để chống tấn công cạn kiệt tài nguyên (DoS/OOM).
   - Thiết lập `security_opt: no-new-privileges:true` ngăn chặn leo thang quyền hạn trong container.

---

## 8. Lịch sử Commit
- **Commit 1:** `feat(commit-1): Trien khai ung dung Web QLSV, MySQL, phpMyAdmin va Nginx Reverse Proxy (SSL & Security Headers)`
- **Commit 2:** `feat(commit-2): Tich hop he thong giam sat Prometheus, Grafana va Exporters (Container, Web, Database)`
- **Commit 3:** `feat(commit-3): Trien khai he thong log Loki + Promtail (LogQL) va Hardening toan dien he thong`
