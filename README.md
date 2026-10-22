# HỆ THỐNG QUẢN LÝ SINH VIÊN (ĐỀ TÀI 02)
> **Môn học:** Triển khai và Quản trị Hệ thống Phần mềm  
> **Sinh viên thực hiện:** DTC245200257  
> **Repository:** [https://github.com/dtc245200257-cell/de02_quanlysinhvien](https://github.com/dtc245200257-cell/de02_quanlysinhvien)

---

## 1. Giới thiệu Đề tài
Hệ thống Quản lý Sinh viên được xây dựng nhằm phục vụ công tác quản lý thông tin sinh viên, lớp học, môn học và tra cứu / nhập điểm số trong trường đại học.

### Chức năng chính:
- **Dashboard Thống kê:** Tổng số sinh viên, lớp học, môn học, GPA trung bình và biểu đồ phân bổ xếp loại học lực (Xuất sắc, Giỏi, Khá, Trung bình, Yếu).
- **Quản lý Sinh viên (CRUD):** Thêm, sửa, xóa, tìm kiếm theo tên/mã sinh viên, lọc theo từng lớp học.
- **Quản lý Lớp học (CRUD):** Quản lý mã lớp, tên lớp, khoa/viện và khóa đào tạo.
- **Quản lý Điểm số (CRUD):** Quản lý điểm quá trình (40%), điểm thi (60%), tự động tính điểm tổng kết và xếp loại chữ (A+, A, B+, B, C+, C, D+, D, F).
- **Giám sát & Quản trị:** Tích hợp phpMyAdmin, Nginx Reverse Proxy (HTTPS), Prometheus Metrics, Grafana Dashboard, Loki Centralized Logs.

---

## 2. Kiến trúc Hệ thống (Stack Công nghệ)
- **Web Application:** Node.js 18 (Express.js), Frontend Bootstrap 5.3 + FontAwesome + Chart.js.
- **Cơ sở dữ liệu:** MySQL 8.0 (InnoDB, UTF-8).
- **Công cụ quản trị DB:** phpMyAdmin.
- **Reverse Proxy & SSL:** Nginx 1.25 Alpine với SSL/TLS 1.2/1.3, HTTP redirect sang HTTPS và các Security Headers.
- **Giám sát:** Prometheus + Grafana + cAdvisor + MySQL Exporter.
- **Quản lý Log tập trung:** Grafana Loki + Promtail (LogQL).

---

## 3. Cấu trúc Thư mục Dự án
```
de02_quanlysinhvien/
├── .env.example              # File mẫu biến môi trường
├── .gitignore                # Danh sách file loại trừ khỏi git
├── docker-compose.yml        # File điều phối Docker Compose toàn bộ dịch vụ
├── README.md                 # Tài liệu hướng dẫn
├── app/                      # Mã nguồn ứng dụng Web Node.js
│   ├── Dockerfile            # Multi-stage / Non-root container build
│   ├── package.json          # Dependencies
│   ├── server.js             # API REST & Prometheus metrics
│   └── public/               # Giao diện người dùng (HTML, CSS, JS)
├── database/                 # Cấu hình & Khởi tạo cơ sở dữ liệu
│   └── init.sql              # Script tạo bảng, seed data và user hạn chế quyền
├── nginx/                    # Reverse Proxy Nginx
│   ├── nginx.conf            # Cấu hình SSL, security headers, reverse proxy
│   └── ssl/                  # Chứng chỉ SSL tự ký (server.crt, server.key)
├── prometheus/               # Cấu hình Prometheus giám sát
│   └── prometheus.yml        # Job scrape metrics
├── grafana/                  # Cấu hình Grafana Dashboard tự động
│   ├── provisioning/         # Auto-load Datasources & Dashboards
│   └── dashboards/           # Các mẫu dashboard JSON
├── loki/                     # Cấu hình hệ thống lưu trữ log Loki
│   └── loki-config.yml
└── promtail/                 # Cấu hình thu thập log Promtail
    └── promtail-config.yml
```

---

## 4. Hướng dẫn Triển khai Nhanh

### Bước 1: Sao chép dự án
```bash
git clone https://github.com/dtc245200257-cell/de02_quanlysinhvien.git
cd de02_quanlysinhvien
```

### Bước 2: Thiết lập biến môi trường
```bash
cp .env.example .env
```

### Bước 3: Khởi chạy toàn bộ hệ thống bằng Docker Compose
```bash
docker compose up -d --build
```

### Bước 4: Kiểm tra trạng thái các container
```bash
docker compose ps
```

---

## 5. Danh sách Cổng Dịch vụ & Tài khoản Truy cập

| Dịch vụ | Giao thức / Port | URL Truy cập | Tài khoản / Mật khẩu |
| :--- | :--- | :--- | :--- |
| **Web QLSV (HTTPS)** | HTTPS : 443 | `https://192.168.253.129/` | Không yêu cầu |
| **Web QLSV (HTTP)** | HTTP : 80 | `http://192.168.253.129/` | Tự động chuyển hướng sang HTTPS |
| **phpMyAdmin** | HTTPS / Path | `https://192.168.253.129/phpmyadmin/` | User: `student_user` / Pass: `StudentPass_2026!Sec` |
| **phpMyAdmin (Root)**| HTTPS / Path | `https://192.168.253.129/phpmyadmin/` | User: `root` / Pass: `RootPass_QLSV@2026!Secured` |
| **Metrics Endpoint** | HTTPS / Path | `https://192.168.253.129/metrics` | Dữ liệu thời gian thực Prometheus |
| **Health Check** | HTTPS / Path | `https://192.168.253.129/health` | Trạng thái kết nối DB và Uptime |
| **Prometheus** | HTTP : 9090 | `http://192.168.253.129:9090` | Không yêu cầu |
| **Grafana** | HTTP : 3000 | `http://192.168.253.129:3000` | User: `admin` / Pass: `AdminPass_Grafana@2026!Sec` |

---

## 6. Lịch sử Commit Yêu cầu
- **Commit 1:** `feat(commit-1): Trien khai ung dung Web QLSV, MySQL, phpMyAdmin va Nginx Reverse Proxy (SSL & Security Headers)`
- **Commit 2:** `feat(commit-2): Tich hop he thong giam sat Prometheus, Grafana va Exporters (Container, Web, Database)`
- **Commit 3:** `feat(commit-3): Trien khai he thong log Loki + Promtail (LogQL) va Hardening toan dien he thong`
