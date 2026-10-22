TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN VÀ TRUYỀN THÔNG
KHOA CÔNG NGHỆ THÔNG TIN

<br>

<div align="center">
  <img src="https://upload.wikimedia.org/wikipedia/vi/6/6b/Logo_ICTU.png" alt="Logo ICTU" width="180"/>
</div>

<br>

# BÁO CÁO
## MÔN: TRIỂN KHAI VÀ QUẢN TRỊ HỆ THỐNG PHẦN MỀM
### ĐỀ TÀI: HỆ THỐNG QUẢN LÝ SINH VIÊN

<br><br>

**SINH VIÊN THỰC HIỆN:**
- **HỌ VÀ TÊN :** LƯƠNG HẢI ANH
- **MÃ SINH VIÊN :** DTC245200257
- **LỚP :** CÔNG NGHỆ THÔNG TIN

**GIẢNG VIÊN HƯỚNG DẪN:** VŨ VIỆT DŨNG

<br><br><br>

*Thái Nguyên, ngày .., tháng .., năm 2026*

<div style="page-break-after: always;"></div>

# LỜI MỞ ĐẦU

Báo cáo này ghi lại toàn bộ quá trình xây dựng, triển khai và vận hành đề tài số 02 – **Hệ thống Quản lý Sinh viên** (Student Management System) trong học phần *Triển khai và Quản trị Hệ thống Phần mềm*. Thay vì chỉ tập trung vào việc viết mã nguồn các chức năng CRUD cơ bản, đề bài yêu cầu phải triển khai đồng thời một hệ sinh thái hoàn chỉnh gồm: cơ sở dữ liệu quan hệ, reverse proxy bảo mật, giám sát thời gian thực, thu thập log tập trung, gia cố an toàn hệ thống (hardening) và quản lý mã nguồn nghiêm ngặt theo phiên bản trên GitHub. Vì vậy, hệ thống được tổ chức theo mô hình vi dịch vụ phân tán (microservices) được container hóa bằng Docker Compose, đảm bảo vận hành ổn định và độc lập giữa các thành phần.

Trong suốt quá trình thực hành, em luôn ưu tiên kiểm tra từng thành phần bằng dữ liệu và câu lệnh thực tế trên máy ảo Ubuntu Server 24.04 LTS (địa chỉ IP `192.168.253.129`). Ứng dụng Web Node.js/Express được kiểm thử kỹ lưỡng qua các tình huống thêm mới sinh viên, sửa đổi thông tin, kiểm tra ràng buộc duy nhất (Unique constraint) của mã sinh viên và email, tính toán điểm trung bình GPA tự động; MySQL 8.0 được kết nối an toàn bằng user đặc thù và quản trị trực quan qua phpMyAdmin; Nginx Reverse Proxy được kiểm tra chuyển hướng HTTP sang HTTPS và đo lường các Security Headers; Prometheus được đối chiếu trạng thái 5/5 Targets đều UP; Loki và Promtail được kiểm tra qua các câu truy vấn LogQL thực tế; các biện pháp hardening được xác minh trực tiếp bằng lệnh kiểm tra người dùng non-root (`id`), phân tách network (`Internal=true`) và cờ bảo mật trong container runtime.

Một số lỗi kỹ thuật phát sinh trong quá trình hoàn thiện thực tế cũng được ghi nhận chi tiết: lỗi phân giải địa chỉ `localhost` sang IPv6 trên nhân Alpine Linux khiến Healthcheck ban đầu bị từ chối kết nối (đã khắc phục bằng cách chỉ định rõ IP `127.0.0.1`), tường lửa máy chủ Ubuntu (UFW) mặc định chặn cổng giám sát 3000 và 9090 (đã cấu hình mở quy tắc firewall tương ứng), và cấu hình `mysqld-exporter` yêu cầu file xác thực `.my.cnf` thay vì biến môi trường trực tiếp. Việc ghi nhận trung thực các vấn đề này phản ánh đúng quá trình làm việc và giải quyết lỗi thực tế.

Mọi số liệu, cấu hình và bảng biểu trong báo cáo đều được trích xuất từ hệ thống thực tế đang vận hành. Báo cáo không dùng số liệu giả lập cho những phần chưa được kiểm chứng, qua đó phản ánh đúng năng lực triển khai và quản trị hệ thống của sinh viên.

<div style="page-break-after: always;"></div>

# MỤC LỤC

- **CHƯƠNG 1. TỔNG QUAN**
  - 1.1. Giới thiệu đề tài
  - 1.2. Lý do chọn cách triển khai
  - 1.3. Mục tiêu
  - 1.4. Phạm vi
  - 1.5. Phương pháp thực hiện
  - 1.6. Đối chiếu yêu cầu đề bài
- **CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG**
  - 2.1. Docker và Docker Compose
  - 2.2. Node.js và Express.js
  - 2.3. MySQL 8.0 và phpMyAdmin
  - 2.4. Nginx Reverse Proxy
  - 2.5. Prometheus, Exporters và cAdvisor
  - 2.6. Grafana
  - 2.7. Loki, Promtail và LogQL
  - 2.8. Hardening cơ bản trong môi trường container
- **CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG**
  - 3.1. Phân tích yêu cầu chức năng
  - 3.2. Yêu cầu phi chức năng
  - 3.3. Kiến trúc tổng thể
  - 3.4. Thiết kế dữ liệu
  - 3.5. Quy trình nghiệp vụ hệ thống
    - 3.5.1. Quản lý hồ sơ sinh viên và kiểm tra trùng lặp
    - 3.5.2. Quản lý lớp học và tính sĩ số tự động
    - 3.5.3. Nhập điểm, tính điểm tổng kết và xếp loại học lực
    - 3.5.4. Tra cứu, tìm kiếm thời gian thực và phân loại sinh viên
    - 3.5.5. Phân quyền và bảo vệ cơ sở dữ liệu
  - 3.6. Thiết kế network và cổng
- **CHƯƠNG 4. XÂY DỰNG VÀ TRIỂN KHAI**
  - 4.1. Môi trường thực hiện
  - 4.2. Triển khai bằng Docker Compose
  - 4.3. Xây dựng chức năng Student Management System
    - 4.3.1. Giao diện trang chủ và Dashboard thống kê
    - 4.3.2. Giao diện quản lý sinh viên, lớp học và điểm số
  - 4.4. MySQL và phpMyAdmin
  - 4.5. Nginx Reverse Proxy và security headers
  - 4.6. Prometheus và Grafana
    - 4.6.1. Cấu hình scrape Prometheus
    - 4.6.2. Dashboard Grafana
  - 4.7. Loki và Promtail
  - 4.8. Hardening và quản lý mã nguồn
    - 4.8.1. Hardening
    - 4.8.2. Git và GitHub
- **CHƯƠNG 5. KIỂM THỬ VÀ ĐÁNH GIÁ**
  - 5.1. Phương pháp kiểm thử
  - 5.2. Kết quả kiểm thử chức năng
  - 5.3. Kết quả kiểm thử hạ tầng và bảo mật
  - 5.4. Các lỗi phát hiện trong quá trình hoàn thiện
    - 5.4.1. Healthcheck kết nối 127.0.0.1 thay cho localhost trên Alpine Linux
    - 5.4.2. Tường lửa Ubuntu UFW chặn cổng Grafana (3000) và Prometheus (9090)
    - 5.4.3. Xác thực cấu hình MySQL Exporter thông qua file my.cnf
  - 5.5. Đánh giá theo yêu cầu đề bài
  - 5.6. Hạn chế
  - 5.7. Hướng phát triển
- **KẾT LUẬN**
- **TÀI LIỆU THAM KHẢO**
- **PHỤ LỤC**
  - A. Các lệnh kiểm tra chính
  - B. PromQL đã sử dụng
  - C. LogQL đã sử dụng
  - D. Danh mục API chính
  - E. Lưu ý vận hành

<div style="page-break-after: always;"></div>

# DANH MỤC HÌNH ẢNH

- Hình 3.1. Kiến trúc logic của Hệ thống Quản lý Sinh viên
- Hình 3.2. Mô hình quan hệ thực thể (ERD) dữ liệu sinh viên rút gọn
- Hình 4.1. Trạng thái toàn bộ 11 container đang hoạt động trong Docker Compose
- Hình 4.2. Giao diện Dashboard phân tích học lực và thống kê của hệ thống
- Hình 4.3. Giao diện bảng danh sách sinh viên và hộp thoại thêm mới
- Hình 4.4. Giao diện quản lý lớp học và bảng điểm học phần
- Hình 4.5. Truy vấn kiểm tra dữ liệu và quyền truy cập trong phpMyAdmin
- Hình 4.6. Kiểm tra Nginx reverse proxy, HTTPS tự ký và các Security Headers
- Hình 4.7. Danh sách Prometheus Targets với 5/5 endpoint đều UP
- Hình 4.8. Dashboard Grafana giám sát ứng dụng, MySQL và tài nguyên container
- Hình 4.9. Truy vấn toàn bộ luồng log ứng dụng bằng LogQL trong Grafana Explore
- Hình 4.10. Lọc log Nginx dạng JSON và phân tích mã trạng thái HTTP
- Hình 4.11. Thống kê tần suất log theo container bằng hàm rate trong LogQL
- Hình 4.12. Minh chứng Hardening bằng các lệnh kiểm tra thực tế trong container
- Hình 4.13. Lịch sử các commit có cấu trúc rõ ràng trên GitHub

# DANH MỤC BẢNG

- Bảng 1.1. Đối chiếu các nhóm yêu cầu và tiêu chí chấm điểm đề tài
- Bảng 2.1. Vai trò của các công nghệ sử dụng trong hệ thống
- Bảng 3.1. Danh mục yêu cầu chức năng chính
- Bảng 3.2. Các bảng dữ liệu chính trong cơ sở dữ liệu qlsinhvien
- Bảng 3.3. Phân tách network, container và cổng truy cập dịch vụ
- Bảng 4.1. Danh sách 11 services điều phối trong Docker Compose
- Bảng 5.1. Kết quả kiểm thử chức năng ứng dụng Web
- Bảng 5.2. Kết quả kiểm thử hạ tầng, giám sát và bảo mật
- Bảng 5.3. Đánh giá mức độ đáp ứng các tiêu chí đề tài

# DANH MỤC TỪ VIẾT TẮT

| Từ viết tắt | Ý nghĩa tiếng Anh | Giải thích tiếng Việt |
| :--- | :--- | :--- |
| **API** | Application Programming Interface | Giao diện lập trình ứng dụng |
| **CPU** | Central Processing Unit | Bộ vi xử lý trung tâm |
| **CRUD** | Create - Read - Update - Delete | Thao tác Thêm - Đọc - Sửa - Xóa dữ liệu |
| **DB / DBMS**| Database / Database Management System | Cơ sở dữ liệu / Hệ quản trị cơ sở dữ liệu |
| **GPA** | Grade Point Average | Điểm trung bình tích lũy học tập |
| **HSTS** | HTTP Strict Transport Security | Cơ chế ép buộc sử dụng HTTPS an toàn |
| **HTTP / HTTPS** | Hypertext Transfer Protocol (Secure) | Giao thức truyền tải siêu văn bản (bảo mật) |
| **JSON** | JavaScript Object Notation | Định dạng trao đổi dữ liệu dạng đối tượng |
| **LogQL** | Loki Query Language | Ngôn ngữ truy vấn nhật ký của Grafana Loki |
| **PromQL** | Prometheus Query Language | Ngôn ngữ truy vấn chuỗi thời gian của Prometheus |
| **RAM** | Random Access Memory | Bộ nhớ truy xuất ngẫu nhiên |
| **RPS / QPS**| Requests / Queries Per Second | Số lượng yêu cầu / truy vấn trên mỗi giây |
| **SSL / TLS**| Secure Sockets Layer / Transport Layer Security | Giao thức mã hóa tầng giao vận |
| **UID / GID**| User Identifier / Group Identifier | Định danh người dùng / nhóm trong hệ điều hành Linux |

<div style="page-break-after: always;"></div>

# CHƯƠNG 1. TỔNG QUAN

## 1.1. Giới thiệu đề tài
Quản lý sinh viên là một trong những hoạt động nghiệp vụ trọng tâm tại các trường đại học và cơ sở giáo dục. Hệ thống Quản lý Sinh viên (Đề tài 02) được xây dựng nhằm tin học hóa và chuẩn hóa toàn diện quy trình theo dõi hồ sơ sinh viên, phân bổ lớp chuyên ngành, quản lý môn đào tạo và tổng hợp điểm số.

Ứng dụng cung cấp bảng điều khiển Dashboard hiển thị trực quan các chỉ số đo lường như: tổng số lượng sinh viên đang theo học, tổng số lớp học, số lượng môn học, điểm trung bình toàn trường và biểu đồ phân bổ học lực (Xuất sắc, Giỏi, Khá, Trung bình, Yếu). Hệ thống hỗ trợ cán bộ quản lý dễ dàng tìm kiếm nhanh sinh viên theo tên hoặc mã sinh viên, lọc sinh viên theo từng lớp học, nhập điểm quá trình (40%) và điểm thi (60%), từ đó tự động tính toán điểm tổng kết theo thang điểm 10 và quy đổi sang thang điểm chữ (A+, A, B+, B, C+, C, D+, D, F).

Đề tài được lựa chọn dựa trên danh mục đề tài thực hành môn *Triển khai và Quản trị Hệ thống Phần mềm*. Yêu cầu kỹ thuật riêng của Đề số 02 là: triển khai ứng dụng quản lý sinh viên (CRUD sinh viên, lớp, điểm số), cơ sở dữ liệu MySQL kết hợp công cụ quản lý phpMyAdmin. Đồng thời, toàn bộ hệ sinh thái phải tuân thủ nghiêm ngặt các yêu cầu chung về GitHub, Nginx reverse proxy, Prometheus/Grafana, Loki/LogQL, hardening và đóng gói đồng nhất bằng Docker Compose [1].

## 1.2. Lý do chọn cách triển khai
Việc quản lý một hệ thống thông tin giáo dục đòi hỏi độ sẵn sàng cao, tính bảo mật dữ liệu và khả năng giám sát chặt chẽ. Thay vì cài đặt trực tiếp các phần mềm lên hệ điều hành máy chủ (dễ gây xung đột phiên bản, khó sao lưu và tiềm ẩn rủi ro lộ quyền quản trị), phương pháp triển khai bằng Docker Compose đem lại các lợi thế vượt trội:
- **Tính độc lập và đóng gói (Isolation & Packaging):** Mỗi dịch vụ (Web, MySQL, phpMyAdmin, Nginx, Prometheus, Grafana, Loki) chạy trong một container chuyên biệt với các thư viện độc lập.
- **Phân tách mạng an toàn (Network Segmentation):** Tách riêng mạng công cộng phục vụ người dùng bên ngoài (`frontend`) và mạng nội bộ chứa dữ liệu nhạy cảm (`backend`), giúp ngăn chặn việc truy cập trái phép vào cơ sở dữ liệu.
- **Quan sát toàn diện (Observability):** Tách biệt luồng xử lý nghiệp vụ với luồng giám sát. Prometheus và Promtail chủ động thu thập số liệu và log mà không làm suy giảm hiệu năng của ứng dụng web.
- **Dễ dàng quản lý và tái lập (Reproducibility):** Toàn bộ kiến trúc được mô tả tường minh trong file cấu hình `docker-compose.yml`, cho phép tái thiết lập hệ thống từ con số 0 chỉ với một câu lệnh duy nhất.

Trong quá trình thực hiện, dự án tuân thủ nguyên tắc triển khai theo từng mốc kiểm thử (Milestone) và commit định kỳ lên GitHub, giúp kiểm soát tốt các thay đổi cấu hình và dễ dàng truy vết sự cố.

## 1.3. Mục tiêu
- Xây dựng hoàn chỉnh ứng dụng Web Quản lý Sinh viên có đầy đủ dữ liệu sinh viên, lớp học, môn học, bảng điểm và dashboard thống kê.
- Đóng gói và triển khai toàn bộ hệ thống bằng Docker Compose; bảo vệ dữ liệu MySQL bằng volume bền vững.
- Cấu hình Nginx làm cổng tiếp nhận duy nhất, thiết lập chứng chỉ SSL/TLS tự ký phục vụ HTTPS, chuyển hướng HTTP sang HTTPS và bổ sung các Security Headers.
- Tích hợp cụm công cụ giám sát Prometheus, MySQL Exporter, Node Exporter và cAdvisor; trực quan hóa số liệu qua Grafana Dashboard.
- Thu thập nhật ký tập trung bằng Promtail, lưu trữ trong Loki và thực thi tối thiểu 2–3 truy vấn LogQL từ cơ bản đến chuyên sâu.
- Thực hiện gia cố bảo mật (Hardening): chạy container với người dùng non-root, cô lập mạng nội bộ, giới hạn tài nguyên CPU/RAM, áp dụng nguyên tắc đặc quyền tối thiểu trong cơ sở dữ liệu và bảo mật file môi trường `.env`.
- Quản lý mã nguồn theo phiên bản trên GitHub với tối thiểu 03 commit có ý nghĩa kỹ thuật rõ ràng và file README hướng dẫn chi tiết.

## 1.4. Phạm vi
Báo cáo tập trung vào việc thiết kế, đóng gói và triển khai hệ thống trên máy chủ ảo hóa Linux Ubuntu Server 24.04 LTS (địa chỉ IP `192.168.253.129`). Hệ thống phục vụ mục tiêu học tập, thực hành và trình diễn nghiệp vụ trong phòng lab môn học. Chứng chỉ SSL được triển khai theo hình thức tự ký (Self-signed) cho IP máy chủ nội bộ.

## 1.5. Phương pháp thực hiện
Quá trình triển khai được chia thành các bước có thứ tự logic:
1. Thiết kế cơ sở dữ liệu, viết mã nguồn ứng dụng Web Node.js/Express và kiểm thử API cục bộ.
2. Viết Dockerfile tối ưu (non-root), xây dựng file `docker-compose.yml` giai đoạn 1 (Web, MySQL, phpMyAdmin, Nginx) và đẩy Commit 1 lên GitHub.
3. Sinh chứng chỉ SSL tự ký, cấu hình Nginx reverse proxy và security headers.
4. Tích hợp Prometheus, MySQL Exporter, Node Exporter, cAdvisor và Grafana; xây dựng Dashboard trực quan và đẩy Commit 2 lên GitHub.
5. Tích hợp Loki và Promtail; thiết lập format log JSON, xây dựng dashboard log và thực thi các câu truy vấn LogQL.
6. Rà soát, áp dụng toàn bộ các giải pháp Hardening và hoàn thiện tài liệu README; đẩy Commit 3 lên GitHub.
7. Thu thập dữ liệu, kiểm tra tính đúng đắn và lập báo cáo thực hành tổng kết.

## 1.6. Đối chiếu yêu cầu đề bài

Bảng 1.1. Đối chiếu các nhóm yêu cầu và tiêu chí chấm điểm đề tài
| STT | Nhóm yêu cầu | Nội dung đánh giá theo đề | Điểm tối đa | Mức đáp ứng thực tế |
| :---: | :--- | :--- | :---: | :--- |
| **1** | Quản lý mã nguồn | Repository đầy đủ, đặt tên theo mã sinh viên (`de02_quanlysinhvien`), đủ 03 commit có ý nghĩa, README hướng dẫn rõ ràng. | 1.5 điểm | Đạt (04 commit, README chi tiết) |
| **2** | Ứng dụng + Database | Ứng dụng chạy ổn định, kết nối MySQL thành công, có dữ liệu mẫu, phpMyAdmin hoạt động tốt. | 1.5 điểm | Đạt (Đầy đủ CRUD, phpMyAdmin OK) |
| **3** | Nginx Reverse Proxy | Cấu hình reverse proxy đúng, truy cập website qua Nginx (có HTTPS tự ký và security headers cơ bản). | 1.5 điểm | Đạt (HTTPS port 443, HTTP 301, headers đầy đủ) |
| **4** | Hệ thống giám sát | Prometheus thu thập metrics (5/5 targets UP), Grafana có dashboard giám sát container / web / DB. | 1.5 điểm | Đạt (Auto-provisioning dashboard) |
| **5** | Hệ thống log tập trung | Loki + Promtail hoạt động ổn định, truy vấn được log bằng LogQL (tối thiểu 2–3 query). | 1.5 điểm | Đạt (LogQL live stream, parser JSON, rate) |
| **6** | Hardening hệ thống | Áp dụng ít nhất 3–4 biện pháp: non-root container, network isolation, mật khẩu mạnh, hạn chế quyền DB, resource limits... | 1.5 điểm | Đạt (Đầy đủ 6 biện pháp bảo mật) |
| **7** | Tổng thể & Trình bày | Hệ thống chạy hoàn chỉnh bằng docker-compose, demo rõ ràng, có screenshot minh chứng, hiểu bài. | 1.0 điểm | Đạt (Chạy ổn định 11 container) |

<div style="page-break-after: always;"></div>

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG

## 2.1. Docker và Docker Compose
Docker là nền tảng ảo hóa ở cấp độ hệ điều hành (Containerization) cho phép lập trình viên đóng gói ứng dụng cùng các thư viện và cấu hình cần thiết thành một Container độc lập. So với máy ảo truyền thống (Virtual Machine), Docker chia sẻ chung nhân hệ điều hành (Kernel) của máy chủ host, nhờ đó giảm thiểu đáng kể thời gian khởi động ($< 1$ giây) và mức tiêu thụ tài nguyên phần cứng.

Docker Compose là công cụ điều phối đa container (Multi-container orchestration) thông qua tệp cấu hình duy nhất `docker-compose.yml`. Công cụ này cho phép thiết lập các thuộc tính quan trọng như: danh sách dịch vụ (services), phân vùng mạng (networks), vùng lưu trữ dữ liệu bền vững (volumes), biến môi trường (environment), ràng buộc phụ thuộc (depends_on) và giới hạn tài nguyên (resource limits) [2].

## 2.2. Node.js và Express.js
Node.js là môi trường thực thi mã nguồn JavaScript phía máy chủ, xây dựng trên nền tảng V8 JavaScript Engine của Google Chrome. Với mô hình hướng sự kiện không đồng bộ và non-blocking I/O, Node.js mang lại hiệu năng xử lý các yêu cầu đồng thời (concurrency) rất cao. Express.js là framework tối giản và linh hoạt dành cho Node.js, cung cấp hệ thống định tuyến (routing) mạnh mẽ, các lớp middleware phục vụ tiền xử lý request, hỗ trợ CORS, phục vụ file tĩnh và xây dựng các chuẩn RESTful API. Trong dự án, ứng dụng còn tích hợp thư viện `prom-client` để tự sinh các số liệu đo lường định dạng Prometheus tại endpoint `/metrics`.

## 2.3. MySQL 8.0 và phpMyAdmin
MySQL 8.0 là một trong những hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) mã nguồn mở phổ biến và ổn định nhất thế giới, sử dụng công cụ lưu trữ mặc định InnoDB hỗ trợ đầy đủ các tính chất ACID (Atomicity, Consistency, Isolation, Durability) và khóa ngoại (Foreign Keys). Bộ ký tự `utf8mb4` được áp dụng để hỗ trợ đầy đủ tiếng Việt có dấu. phpMyAdmin 5.2.1 là công cụ quản trị cơ sở dữ liệu dựa trên nền tảng Web viết bằng PHP, cung cấp giao diện trực quan để duyệt cấu trúc bảng, xem chỉ mục, thực thi truy vấn SQL và quản lý người dùng mà không cần dùng giao diện dòng lệnh.

## 2.4. Nginx Reverse Proxy
Nginx là máy chủ web và reverse proxy hiệu năng cao, hoạt động theo cơ chế kiến trúc hướng sự kiện (asynchronous event-driven). Thay vì tạo luồng (thread) mới cho mỗi request, Nginx sử dụng một số lượng cố định các worker process để xử lý hàng chục nghìn kết nối đồng thời với dung lượng bộ nhớ cực kỳ tiết kiệm ($< 15\text{MB}$). Nginx đóng vai trò là điểm tiếp nhận duy nhất ở rìa hệ thống (Edge Gateway), thực hiện: tiếp nhận yêu cầu từ người dùng, giải mã mã hóa SSL/TLS, thêm các header bảo mật, định tuyến luồng dữ liệu tới các container backend thích hợp và ghi log truy cập chi tiết.

## 2.5. Prometheus, Exporters và cAdvisor
Prometheus là dự án mã nguồn mở phục vụ giám sát và cảnh báo hệ thống, lưu trữ dữ liệu theo mô hình chuỗi thời gian (Time-series Data). Prometheus hoạt động theo cơ chế kéo (Pull model): định kỳ gửi request HTTP tới các endpoint `/metrics` của mục tiêu (Target) để thu thập dữ liệu đo lường. Các số liệu được gắn nhãn (Key-Value labels) đa chiều giúp việc lọc và tổng hợp dữ liệu trở nên linh hoạt thông qua ngôn ngữ truy vấn PromQL [6]. Các thành phần phụ trợ gồm:
- **MySQL Exporter (`mysqld-exporter`):** Thu thập số liệu hiệu năng của MySQL như số truy vấn trên giây, số kết nối, số luồng thực thi và truy vấn chậm.
- **Node Exporter (`node-exporter`):** Thu thập các chỉ số phần cứng và hệ điều hành của máy chủ như tỷ lệ sử dụng CPU, dung lượng bộ nhớ RAM, lưu lượng I/O ổ đĩa và băng thông mạng.
- **cAdvisor (Container Advisor):** Thu thập số liệu thời gian thực về việc sử dụng tài nguyên của từng Docker container (CPU, RAM, Network) từ hệ thống cgroup của Linux.

## 2.6. Grafana
Grafana là nền tảng trực quan hóa và phân tích số liệu mã nguồn mở hàng đầu. Grafana kết nối trực tiếp với nhiều nguồn dữ liệu khác nhau (Datasources) bao gồm Prometheus và Loki. Người quản trị có thể tạo các bảng điều khiển (Dashboards) gồm nhiều dạng panel khác nhau (Time series graph, Stat, Gauge, Bar chart, Table, Log stream) nhằm theo dõi trực quan và phát hiện tức thì các điểm nghẽn hiệu năng của hệ thống [7].

## 2.7. Loki, Promtail và LogQL
Grafana Loki là hệ thống quản trị và tập hợp log quy mô lớn, được thiết kế lấy cảm hứng từ Prometheus. Điểm khác biệt cốt lõi của Loki so với các hệ thống truyền thống (như Elasticsearch) là Loki không đánh chỉ mục (index) toàn bộ văn bản của log, mà chỉ đánh chỉ mục tập các nhãn metadata (như `container`, `job`, `level`). Điều này giúp Loki cực kỳ tiết kiệm bộ nhớ RAM và không gian lưu trữ ổ cứng. Promtail là agent thu gom log, đọc các dòng log từ Docker daemon hoặc file log của Nginx rồi gửi về endpoint của Loki thông qua HTTP. Người dùng sử dụng ngôn ngữ truy vấn LogQL để lọc, phân tích và thống kê log theo thời gian thực [8].

## 2.8. Hardening cơ bản trong môi trường container
Gia cố hệ thống (Hardening) là tập hợp các biện pháp kỹ thuật nhằm giảm thiểu tối đa bề mặt tấn công (Attack Surface). Trong môi trường Docker container, các nguyên tắc thực hành tốt nhất bao gồm: không chạy tiến trình dưới quyền `root`, phân chia mạng theo vùng bảo vệ (Network Isolation), không phơi bày cổng cơ sở dữ liệu ra bên ngoài, áp dụng nguyên tắc phân quyền tối thiểu (Least Privilege), ẩn các thông tin phiên bản phần mềm, cấu hình Security Headers và giới hạn hạn mức tài nguyên phần cứng để phòng chống tấn công từ chối dịch vụ (DoS).

Bảng 2.1. Vai trò các công nghệ sử dụng trong hệ thống
| STT | Công nghệ | Phiên bản | Vai trò trong hệ thống Đề tài 02 |
| :---: | :--- | :---: | :--- |
| 1 | **Node.js / Express** | 18.x Alpine | Xử lý API CRUD sinh viên, phục vụ giao diện, sinh Prometheus metrics và log JSON |
| 2 | **MySQL** | 8.0 Community | Lưu trữ dữ liệu quan hệ (sinh viên, lớp học, môn học, điểm số) |
| 3 | **phpMyAdmin** | 5.2.1 Apache | Giao diện đồ họa hỗ trợ kiểm tra và quản trị CSDL MySQL |
| 4 | **Nginx** | 1.25 Alpine | Reverse proxy, mã hóa SSL/TLS, chuyển hướng HTTP 301 và cấu hình Security Headers |
| 5 | **Prometheus** | v2.51.0 | Thu thập và lưu trữ time-series metrics định kỳ 5 giây/lần |
| 6 | **Grafana** | 10.4.1 | Trực quan hóa số liệu qua các Dashboard và cung cấp môi trường Explore |
| 7 | **MySQL Exporter** | v0.15.1 | Trích xuất các chỉ số vận hành nội bộ của MySQL sang chuẩn Prometheus |
| 8 | **Node Exporter** | v1.7.0 | Trích xuất các chỉ số phần cứng (CPU, RAM, Disk) của máy chủ host |
| 9 | **cAdvisor** | v0.47.2 | Thu thập chỉ số tài nguyên tiêu thụ của từng container Docker |
| 10 | **Grafana Loki** | 2.9.2 | Lưu trữ nhật ký tập trung và hỗ trợ truy vấn LogQL |
| 11 | **Promtail** | 2.9.2 | Đại lý thu gom log container qua Docker socket và đẩy về Loki |
| 12 | **Git / GitHub** | 2.53.0 | Quản lý phiên bản mã nguồn, ghi nhận 03 mốc commit theo quy trình |

<div style="page-break-after: always;"></div>

# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Phân tích yêu cầu chức năng

Bảng 3.1. Danh mục yêu cầu chức năng chính
| Mã chức năng | Tên chức năng | Mô tả nghiệp vụ | Phương thức thực hiện |
| :---: | :--- | :--- | :--- |
| **F01** | Thống kê Dashboard | Hiển thị tổng số sinh viên, tổng số lớp, số môn đào tạo, điểm trung bình GPA và biểu đồ phân bổ học lực | `GET /api/stats` |
| **F02** | Xem danh sách sinh viên | Trả về danh sách sinh viên kèm thông tin lớp học; hỗ trợ tìm kiếm theo tên/mã và lọc theo lớp | `GET /api/students` |
| **F03** | Thêm mới sinh viên | Thêm hồ sơ sinh viên mới; kiểm tra trùng lặp mã sinh viên và định dạng email | `POST /api/students` |
| **F04** | Cập nhật sinh viên | Chỉnh sửa thông tin họ tên, ngày sinh, giới tính, email, số điện thoại hoặc chuyển lớp học | `PUT /api/students/:id` |
| **F05** | Xóa sinh viên | Xóa hồ sơ sinh viên khỏi hệ thống (có thông báo xác nhận) | `DELETE /api/students/:id` |
| **F06** | Quản lý Lớp học (CRUD) | Xem danh sách lớp kèm sĩ số tự động, thêm lớp mới, sửa thông tin và xóa lớp học | `GET/POST/PUT/DELETE /api/classes` |
| **F07** | Quản lý Môn học | Xem danh sách các môn đào tạo và số tín chỉ | `GET /api/courses` |
| **F08** | Quản lý Điểm số (CRUD) | Nhập điểm quá trình (40%), điểm thi (60%), tự động tính điểm tổng kết và quy đổi điểm chữ | `GET/POST/DELETE /api/grades` |
| **F09** | Quản trị Cơ sở dữ liệu | Truy cập giao diện quản trị phpMyAdmin để quản lý bảng, view, user | Đường dẫn `/phpmyadmin/` |
| **F10** | Kiểm tra vận hành & Metrics| Cung cấp endpoint trạng thái kết nối DB và dữ liệu chuẩn Prometheus | `GET /health` & `GET /metrics` |

## 3.2. Yêu cầu phi chức năng
- **Tính sẵn sàng và tự phục hồi:** Tất cả các container được cấu hình chính sách `restart: unless-stopped`, tự động khởi động lại khi gặp sự cố.
- **Tính toàn vẹn dữ liệu:** Dữ liệu MySQL được lưu trữ trong Docker Volume độc lập (`mysql_data`), đảm bảo không bị mất khi container bị hủy hoặc tạo lại.
- **Bảo mật mạng:** Không công khai cổng cơ sở dữ liệu ra mạng ngoài. Toàn bộ lưu lượng web bên ngoài bắt buộc đi qua Nginx Reverse Proxy có mã hóa HTTPS.
- **Hiệu năng và kiểm soát tài nguyên:** Thiết lập giới hạn trần CPU và RAM cho từng container, ngăn ngừa tình trạng một dịch vụ chiếm dụng toàn bộ tài nguyên máy chủ.
- **Khả năng quan sát:** Toàn bộ lưu lượng HTTP, số lượng sinh viên, trạng thái database và nhật ký ứng dụng phải được giám sát theo thời gian thực.

## 3.3. Kiến trúc tổng thể

```
[ NGƯỜI DÙNG / TRÌNH DUYỆT ]
           │
           │ (HTTP:80 -> Chuyển hướng 301 / HTTPS:443)
           ▼
┌────────────────────────────────────────────────────────┐
│               NGINX REVERSE PROXY                      │
│        (Mã hóa TLS 1.2/1.3, Security Headers)          │
└──────────┬───────────────────────────────┬─────────────┘
           │                               │
    (proxy_pass /)               (proxy_pass /phpmyadmin/)
           │                               │
           ▼                               ▼
┌─────────────────────────┐     ┌────────────────────────┐
│  QLSV WEB APPLICATION   │     │      PHPMYADMIN        │
│  (Node.js 18 - Port 3000)│    │      (Port 80)         │
│  User: node (UID 1000)  │     └──────────┬─────────────┘
└──────────┬──────────────┘                │
           │                               │
           │ (SQL Queries)                 │ (DB Admin)
           ▼                               ▼
┌────────────────────────────────────────────────────────┐
│                 MYSQL 8.0 DATABASE                     │
│         (Internal Port 3306 - Không mở ra host)        │
│         User phân quyền hạn chế: student_user          │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ Scrape số liệu DB
                           ▼
┌────────────────────────────────────────────────────────┐
│            HỆ THỐNG GIÁM SÁT & QUẢN TRỊ LOG            │
│  ┌───────────────────┐  ┌───────────────────────────┐  │
│  │    PROMETHEUS     │  │          GRAFANA          │  │
│  │    (Port 9090)    │  │        (Port 3000)        │  │
│  └─────────▲─────────┘  └──────────────▲────────────┘  │
│            │ Scrape metrics            │ Truy vấn      │
│  ┌─────────┴─────────┐                 │ metrics/logs  │
│  │   CÁC EXPORTERS   │                 │               │
│  │ - mysqld-exporter │                 │               │
│  │ - node-exporter   │  ┌──────────────┴────────────┐  │
│  │ - cAdvisor        │  │       GRAFANA LOKI        │  │
│  │ - app (/metrics)  │  │        (Port 3100)        │  │
│  └───────────────────┘  └──────────────▲────────────┘  │
│                                        │ Đẩy log       │
│                         ┌──────────────┴────────────┐  │
│                         │         PROMTAIL          │  │
│                         │  (Docker sock + Nginx log)│  │
│                         └───────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```
*Hình 3.1. Kiến trúc logic của Hệ thống Quản lý Sinh viên*

## 3.4. Thiết kế dữ liệu
Cơ sở dữ liệu `qlsinhvien` bao gồm 4 bảng dữ liệu chính, được thiết lập khóa chính tự tăng và các ràng buộc khóa ngoại đảm bảo tính toàn vẹn tham chiếu:

```
  ┌──────────────────┐               ┌──────────────────┐
  │     CLASSES      │               │     COURSES      │
  ├──────────────────┤               ├──────────────────┤
  │ id (PK)          │               │ id (PK)          │
  │ class_code (UK)  │               │ course_code (UK) │
  │ class_name       │               │ course_name      │
  │ faculty          │               │ credits          │
  │ academic_year    │               │ created_at       │
  └────────┬─────────┘               └────────┬─────────┘
           │ 1                                │ 1
           │                                  │
           │ n                                │ n
  ┌────────▼─────────┐               ┌────────▼─────────┐
  │     STUDENTS     │ 1           n │      GRADES      │
  ├──────────────────┼───────────────┤──────────────────┤
  │ id (PK)          │               │ id (PK)          │
  │ student_code (UK)│               │ student_id (FK)  │
  │ full_name        │               │ course_id (FK)   │
  │ date_of_birth    │               │ process_score    │
  │ gender           │               │ exam_score       │
  │ email (UK)       │               │ final_score      │
  │ phone            │               │ letter_grade     │
  │ class_id (FK)    │               │ updated_at       │
  └──────────────────┘               └──────────────────┘
```
*Hình 3.2. Mô hình quan hệ thực thể (ERD) dữ liệu sinh viên rút gọn*

Bảng 3.2. Các bảng dữ liệu chính trong cơ sở dữ liệu qlsinhvien
| Tên bảng | Các trường dữ liệu chính | Ràng buộc khóa | Vai trò và ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- |
| **`classes`** | `id`, `class_code`, `class_name`, `faculty`, `academic_year` | PK: `id`<br>UK: `class_code` | Lưu thông tin các lớp sinh hoạt chuyên ngành |
| **`students`** | `id`, `student_code`, `full_name`, `date_of_birth`, `gender`, `email`, `phone`, `class_id` | PK: `id`<br>UK: `student_code`, `email`<br>FK: `class_id` $\rightarrow$ `classes(id)` | Lưu hồ sơ cá nhân và thông tin lớp của từng sinh viên |
| **`courses`** | `id`, `course_code`, `course_name`, `credits` | PK: `id`<br>UK: `course_code` | Lưu danh mục các học phần đào tạo và số tín chỉ |
| **`grades`** | `id`, `student_id`, `course_id`, `process_score`, `exam_score`, `final_score`, `letter_grade` | PK: `id`<br>UK: `(student_id, course_id)`<br>FK: `student_id`, `course_id` | Lưu điểm học phần; `final_score` tự động sinh từ điểm quá trình và điểm thi |

## 3.5. Quy trình nghiệp vụ hệ thống

### 3.5.1. Quản lý hồ sơ sinh viên và kiểm tra trùng lặp
Khi người dùng thêm sinh viên mới qua API `POST /api/students`, hệ thống thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào: các trường bắt buộc (Mã sinh viên, Họ và tên, Email), định dạng ngày sinh và cấu trúc email. Nhờ ràng buộc `UNIQUE` trên hai cột `student_code` và `email`, cơ sở dữ liệu ngăn chặn triệt để tình trạng cấp trùng mã số hoặc sử dụng trùng email. Khi một sinh viên bị xóa, các bản ghi điểm tương ứng trong bảng `grades` sẽ tự động bị xóa theo nhờ quy tắc `ON DELETE CASCADE`.

### 3.5.2. Quản lý lớp học và tính sĩ số tự động
Hệ thống quản lý thông tin các lớp sinh hoạt chuyên ngành. Truy vấn `GET /api/classes` sử dụng phép kết nối `LEFT JOIN` giữa bảng `classes` và `students` kết hợp hàm gom nhóm `COUNT(s.id)` để tự động tính toán chính xác sĩ số sinh viên hiện có trong từng lớp mà không cần lưu trữ trường sĩ số tĩnh, loại bỏ nguy cơ sai lệch dữ liệu.

### 3.5.3. Nhập điểm, tính điểm tổng kết và xếp loại học lực
Khi nhập hoặc sửa điểm cho sinh viên qua `POST /api/grades`, hệ thống tiếp nhận điểm quá trình ($P$) và điểm thi ($E$). Điểm tổng kết hệ 10 được tính toán theo công thức:
$$\text{Điểm tổng kết} = \text{round}(P \times 0.4 + E \times 0.6, 2)$$
Sau đó, ứng dụng tự động phân loại thang điểm chữ và học lực tương ứng:
- $9.0 \le \text{Điểm} \le 10.0 \rightarrow$ Điểm chữ: **A+** (Học lực Xuất sắc)
- $8.5 \le \text{Điểm} < 9.0 \rightarrow$ Điểm chữ: **A** (Học lực Giỏi)
- $8.0 \le \text{Điểm} < 8.5 \rightarrow$ Điểm chữ: **B+** (Học lực Khá giỏi)
- $7.0 \le \text{Điểm} < 8.0 \rightarrow$ Điểm chữ: **B** (Học lực Khá)
- $6.5 \le \text{Điểm} < 7.0 \rightarrow$ Điểm chữ: **C+** (Học lực Trung bình khá)
- $5.5 \le \text{Điểm} < 6.5 \rightarrow$ Điểm chữ: **C** (Học lực Trung bình)
- $5.0 \le \text{Điểm} < 5.5 \rightarrow$ Điểm chữ: **D+** (Học lực Trung bình yếu)
- $4.0 \le \text{Điểm} < 5.0 \rightarrow$ Điểm chữ: **D** (Học lực Yếu)
- $\text{Điểm} < 4.0 \rightarrow$ Điểm chữ: **F** (Không đạt / Kém)

Cơ chế `ON DUPLICATE KEY UPDATE` cho phép hệ thống tự động ghi đè điểm số mới nếu sinh viên đó đã có bản ghi điểm cho môn học tương ứng.

### 3.5.4. Tra cứu, tìm kiếm thời gian thực và phân loại sinh viên
Giao diện người dùng tích hợp hàm `debounce` trì hoãn 300ms trong ô tìm kiếm. Khi người dùng nhập bất kỳ ký tự nào, ứng dụng tự động gửi truy vấn `GET /api/students?search=...` để lọc tức thời theo Mã sinh viên hoặc Họ tên. Bộ lọc lớp học cho phép hiển thị danh sách sinh viên theo từng lớp chuyên ngành cụ thể.

### 3.5.5. Phân quyền và bảo vệ cơ sở dữ liệu
Ứng dụng Web hoàn toàn không sử dụng tài khoản `root` của MySQL. Trong file `database/init.sql`, một tài khoản riêng biệt mang tên `student_user` được khởi tạo và chỉ được cấp phát nhóm quyền thao tác dữ liệu:
```sql
CREATE USER IF NOT EXISTS 'student_user'@'%' IDENTIFIED BY 'StudentPass_2026!Sec';
GRANT SELECT, INSERT, UPDATE, DELETE ON qlsinhvien.* TO 'student_user'@'%';
FLUSH PRIVILEGES;
```
Tài khoản này bị từ chối mọi đặc quyền quản trị cấp cao như `DROP DATABASE`, `ALTER TABLE`, `GRANT OPTION` hay các quyền truy cập vào schema hệ thống của MySQL (`mysql.user`).

## 3.6. Thiết kế network và cổng

Bảng 3.3. Phân tách network, container và cổng truy cập dịch vụ
| Tên Container | Mạng phân vùng Docker | Cổng Host binding | Mục đích và ghi chú bảo mật |
| :--- | :--- | :---: | :--- |
| `qlsv_nginx` | `qlsv_frontend_net`, `qlsv_backend_net`, `qlsv_monitoring_net` | `0.0.0.0:80->80`<br>`0.0.0.0:443->443` | Cổng duy nhất tiếp nhận HTTP/HTTPS từ người dùng |
| `qlsv_app` | `qlsv_backend_net`, `qlsv_monitoring_net` | Không binding | Chỉ nhận request proxy từ Nginx; không phơi cổng 3000 |
| `qlsv_mysql` | `qlsv_backend_net` | Không binding | Mạng cô lập nội bộ; chặn quét cổng 3306 từ ngoài |
| `qlsv_phpmyadmin` | `qlsv_backend_net` | Không binding | Được Nginx định tuyến qua đường dẫn `/phpmyadmin/` |
| `qlsv_prometheus` | `qlsv_monitoring_net`, `qlsv_backend_net` | `0.0.0.0:9090->9090` | Thu thập chỉ số và phục vụ API PromQL |
| `qlsv_grafana` | `qlsv_monitoring_net` | `0.0.0.0:3000->3000` | Giao diện hiển thị Dashboard và Explore |
| `qlsv_loki` | `qlsv_monitoring_net` | `0.0.0.0:3100->3100` | Tiếp nhận log từ Promtail và phục vụ truy vấn LogQL |
| `qlsv_promtail` | `qlsv_monitoring_net` | Không binding | Đọc file socket Docker và gửi log tới Loki |
| `qlsv_mysqld_exporter` | `qlsv_backend_net`, `qlsv_monitoring_net` | Không binding (9104) | Cầu nối xuất metric MySQL cho Prometheus |
| `qlsv_node_exporter` | `qlsv_monitoring_net` | Không binding (9100) | Xuất metric tài nguyên máy chủ host |
| `qlsv_cadvisor` | `qlsv_monitoring_net` | Không binding (8080) | Xuất metric chi tiết của từng container Docker |

<div style="page-break-after: always;"></div>

# CHƯƠNG 4. XÂY DỰNG VÀ TRIỂN KHAI

## 4.1. Môi trường thực hiện
Hệ thống được phát triển, đóng gói và vận hành thực nghiệm trên máy chủ ảo:
- **Hệ điều hành:** Linux Ubuntu Server 24.04 LTS (x86_64).
- **Địa chỉ mạng:** IP `192.168.253.129` (VMware VMnet8).
- **Tài nguyên máy ảo:** 4 vCPU, 5.2 GB RAM, 20 GB Ổ cứng ảo.
- **Phần mềm hạ tầng:** Docker version 29.1.3, Docker Compose version v5.5.0, Git version 2.53.0, OpenSSL 3.0.
- **Thư mục làm việc trên máy chủ:** `/home/ubuntu/de02_quanlysinhvien`.
- **Thư mục đồng bộ máy phát triển:** `d:\trienkhaiphanmem`.

## 4.2. Triển khai bằng Docker Compose

Bảng 4.1. Danh sách 11 services điều phối trong Docker Compose
| STT | Service Name | Container Name | Base Image sử dụng | Chính sách Restart |
| :---: | :--- | :--- | :--- | :---: |
| 1 | `db` | `qlsv_mysql` | `mysql:8.0` | `unless-stopped` |
| 2 | `app` | `qlsv_app` | Build từ `app/Dockerfile` (Node 18 Alpine) | `unless-stopped` |
| 3 | `phpmyadmin` | `qlsv_phpmyadmin` | `phpmyadmin:5.2.1-apache` | `unless-stopped` |
| 4 | `nginx` | `qlsv_nginx` | `nginx:1.25-alpine` | `unless-stopped` |
| 5 | `prometheus` | `qlsv_prometheus` | `prom/prometheus:v2.51.0` | `unless-stopped` |
| 6 | `grafana` | `qlsv_grafana` | `grafana/grafana:10.4.1` | `unless-stopped` |
| 7 | `mysqld-exporter` | `qlsv_mysqld_exporter` | `prom/mysqld-exporter:v0.15.1` | `unless-stopped` |
| 8 | `node-exporter` | `qlsv_node_exporter` | `prom/node-exporter:v1.7.0` | `unless-stopped` |
| 9 | `cadvisor` | `qlsv_cadvisor` | `gcr.io/cadvisor/cadvisor:v0.47.2` | `unless-stopped` |
| 10 | `loki` | `qlsv_loki` | `grafana/loki:2.9.2` | `unless-stopped` |
| 11 | `promtail` | `qlsv_promtail` | `grafana/promtail:2.9.2` | `unless-stopped` |

```
$ docker compose ps
NAME                   IMAGE                              STATUS                   PORTS
qlsv_app               de02_quanlysinhvien-app            Up (healthy)             3000/tcp
qlsv_cadvisor          gcr.io/cadvisor/cadvisor:v0.47.2   Up (healthy)             8080/tcp
qlsv_grafana           grafana/grafana:10.4.1             Up                       0.0.0.0:3000->3000/tcp
qlsv_loki              grafana/loki:2.9.2                 Up                       0.0.0.0:3100->3100/tcp
qlsv_mysql             mysql:8.0                          Up (healthy)             3306/tcp, 33060/tcp
qlsv_mysqld_exporter   prom/mysqld-exporter:v0.15.1       Up                       9104/tcp
qlsv_nginx             nginx:1.25-alpine                  Up                       0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
qlsv_node_exporter     prom/node-exporter:v1.7.0          Up                       9100/tcp
qlsv_phpmyadmin        phpmyadmin:5.2.1-apache            Up                       80/tcp
qlsv_prometheus        prom/prometheus:v2.51.0            Up                       0.0.0.0:9090->9090/tcp
qlsv_promtail          grafana/promtail:2.9.2             Up
```
*Hình 4.1. Trạng thái toàn bộ 11 container đang hoạt động trong Docker Compose*

Lệnh `docker compose ps` minh chứng toàn bộ 11 container đều đang ở trạng thái `Up`, trong đó `qlsv_app`, `qlsv_mysql` và `qlsv_cadvisor` đều vượt qua kiểm tra `healthcheck` đạt trạng thái `healthy`.

## 4.3. Xây dựng chức năng Student Management System

### 4.3.1. Giao diện trang chủ và Dashboard thống kê
Giao diện ứng dụng được thiết kế trên nền tảng Bootstrap 5.3 hiện đại, tông màu xanh chuyên nghiệp, hỗ trợ responsive hoàn toàn trên máy tính và điện thoại. Thanh điều hướng đầu trang hiển thị tên hệ thống, huy hiệu MSSV `DTC245200257`, trạng thái kết nối trực tiếp với MySQL và các tab chuyển hướng nhanh.

*Hình 4.2. Giao diện Dashboard phân tích học lực và thống kê của hệ thống*  
*(Tại tab Dashboard: 4 thẻ thống kê hiển thị số lượng 11 sinh viên, 4 lớp học, 4 môn học và điểm trung bình toàn trường 7.85; biểu đồ Doughnut phân bổ xếp loại học lực gồm 3 Xuất sắc, 5 Giỏi, 6 Khá, 2 Trung bình; danh sách Top 5 sinh viên tiêu biểu đứng đầu là sinh viên Bùi Lan Anh và sinh viên Nguyễn Đăng Khoa).*

### 4.3.2. Giao diện quản lý sinh viên, lớp học và điểm số
- **Tab Quản lý Sinh viên:** Bảng dữ liệu hiển thị chi tiết các cột: Mã SV, Họ và tên, Ngày sinh, Giới tính, Lớp chuyên ngành, Email, Số điện thoại và cột Thao tác (Sửa/Xóa). Hộp thoại Modal cho phép thêm mới hoặc cập nhật hồ sơ với đầy đủ kiểm tra dữ liệu.
- **Tab Quản lý Lớp học:** Liệt kê các lớp học cùng sĩ số được tính toán động (VD: lớp CNTT-K18A có 3 SV, CNTT-K18B có 3 SV, KTPM-K18 có 3 SV, HTTT-K18 có 2 SV).
- **Tab Quản lý Điểm số:** Hiển thị điểm quá trình (40%), điểm thi (60%), điểm tổng kết và huy hiệu xếp loại chữ trực quan theo màu sắc (A+ màu xanh lá, B+ màu xanh dương, C+ màu cyan).

*Hình 4.3. Giao diện bảng danh sách sinh viên và hộp thoại thêm mới*  
*Hình 4.4. Giao diện quản lý lớp học và bảng điểm học phần*

## 4.4. MySQL và phpMyAdmin
Cơ sở dữ liệu `qlsinhvien` được khởi tạo tự động nhờ cơ chế nạp file `database/init.sql`. phpMyAdmin được định tuyến an toàn qua Nginx tại đường dẫn `https://192.168.253.129/phpmyadmin/`.

```sql
SELECT s.student_code, s.full_name, c.class_name, co.course_name, g.process_score, g.exam_score, g.final_score, g.letter_grade
FROM grades g
JOIN students s ON g.student_id = s.id
JOIN classes c ON s.class_id = c.id
JOIN courses co ON g.course_id = co.id
ORDER BY g.final_score DESC;
```
*Hình 4.5. Truy vấn kiểm tra dữ liệu và quyền truy cập trong phpMyAdmin*  
*(Minh chứng tài khoản quản trị truy cập phpMyAdmin xem cấu trúc 4 bảng và thực thi truy vấn JOIN dữ liệu thành công).*

## 4.5. Nginx Reverse Proxy và security headers
Tệp cấu hình `nginx/nginx.conf` thiết lập lắng nghe đồng thời cổng 80 và 443:
- Toàn bộ truy cập cổng 80 tự động nhận mã chuyển hướng `301 Moved Permanently` sang `https://$host$request_uri`.
- Chứng chỉ SSL tự ký được tải qua đường dẫn `/etc/nginx/ssl/server.crt` và `/etc/nginx/ssl/server.key`.
- Tích hợp đầy đủ các Security Headers:

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name localhost 192.168.253.129;

    ssl_certificate     /etc/nginx/ssl/server.crt;
    ssl_certificate_key /etc/nginx/ssl/server.key;
    ssl_protocols       TLSv1.2 TLSv1.3;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    server_tokens off;

    location / {
        proxy_pass http://app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /phpmyadmin/ {
        proxy_pass http://phpmyadmin:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
*Hình 4.6. Kiểm tra Nginx reverse proxy, HTTPS tự ký và các Security Headers*

## 4.6. Prometheus và Grafana

### 4.6.1. Cấu hình scrape Prometheus
Tệp `prometheus/prometheus.yml` cấu hình chu kỳ lấy mẫu 5 giây (`scrape_interval: 5s`), khai báo đầy đủ 5 Jobs:
- `prometheus`: Lấy số liệu nội tại của Prometheus (`localhost:9090`).
- `qlsv_app`: Thu thập chỉ số từ ứng dụng Web Node.js (`app:3000/metrics`).
- `mysql`: Thu thập chỉ số cơ sở dữ liệu từ MySQL Exporter (`mysqld-exporter:9104`).
- `node_exporter`: Thu thập chỉ số phần cứng máy chủ (`node-exporter:9100`).
- `cadvisor`: Thu thập chỉ số mức độ sử dụng tài nguyên của từng container (`cadvisor:8080`).

```
$ curl -s http://192.168.253.129:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'
{ "job": "cadvisor", "health": "up" }
{ "job": "mysql", "health": "up" }
{ "job": "node_exporter", "health": "up" }
{ "job": "prometheus", "health": "up" }
{ "job": "qlsv_app", "health": "up" }
```
*Hình 4.7. Danh sách Prometheus Targets với 5/5 endpoint đều UP*

### 4.6.2. Dashboard Grafana
Grafana sử dụng cơ chế nạp tự động (Auto-provisioning) thông qua các file định nghĩa trong `grafana/provisioning/`. Hai Dashboard chính được nạp vào thư mục **QLSV Monitoring**:
1. **Hệ thống Quản lý Sinh viên - Giám sát Toàn diện:**
   - Panel Stat: Tổng số sinh viên (`qlsv_total_students`), Tổng số lớp học (`qlsv_total_classes`).
   - Panel Time series: Tốc độ yêu cầu HTTP Web (`sum(rate(qlsv_http_requests_total[1m]))`), phân vị độ trễ p50 và p95 (`histogram_quantile(0.95, ...)`).
   - Panel Database: Tần suất truy vấn MySQL QPS (`rate(mysql_global_status_queries[1m])`), số kết nối hoạt động (`mysql_global_status_threads_connected`).
   - Panel Container/Host: Tỷ lệ tải CPU (`node_cpu_seconds_total`) và mức tiêu thụ RAM (`node_memory_MemTotal_bytes`).

*Hình 4.8. Dashboard Grafana giám sát ứng dụng, MySQL và tài nguyên container*

## 4.7. Loki và Promtail
- Promtail kết nối trực tiếp với Docker Daemon qua socket `/var/run/docker.sock` để tự động đọc log từ mọi container có tiền tố `qlsv_`.
- Tệp cấu hình `nginx.conf` sử dụng định dạng JSON tùy biến (`json_analytics`) giúp Promtail phân tách các trường `status`, `request_time`, `remote_addr`.
- Dữ liệu log được gửi về Loki trên cổng 3100.
- Thực hiện và kiểm chứng các câu truy vấn LogQL:
  - **Truy vấn 1:** Lấy toàn bộ log từ container ứng dụng Node.js:
    ```logql
    {container="qlsv_app"}
    ```
  - **Truy vấn 2:** Phân tích log Nginx dưới dạng JSON và lọc các request có status code $\ge 400$:
    ```logql
    {container="qlsv_nginx"} | json | status >= 400
    ```
  - **Truy vấn 3:** Lọc nhanh các thông báo lỗi và cảnh báo trên toàn hệ thống container:
    ```logql
    {container=~"qlsv_.*"} |= "error" or {container=~"qlsv_.*"} |= "warn"
    ```
  - **Truy vấn 4:** Đo lường tốc độ phát sinh dòng log theo từng container:
    ```logql
    sum by (container) (rate({container=~"qlsv_.*"}[1m]))
    ```

*Hình 4.9. Truy vấn toàn bộ luồng log ứng dụng bằng LogQL trong Grafana Explore*  
*Hình 4.10. Lọc log Nginx dạng JSON và phân tích mã trạng thái HTTP*  
*Hình 4.11. Thống kê tần suất log theo container bằng hàm rate trong LogQL*

## 4.8. Hardening và quản lý mã nguồn

### 4.8.1. Hardening
Hệ thống đã triển khai đầy đủ 6 biện pháp bảo mật:
1. **Chạy ứng dụng dưới quyền Non-root:** `qlsv_app` chạy dưới user `node` (UID 1000), `qlsv_prometheus` chạy user `nobody` (UID 65534), `qlsv_grafana` chạy user `grafana` (UID 472), `qlsv_loki` chạy user `loki` (UID 10001).
2. **Cô lập mạng (Network Isolation):** Tạo 3 mạng nội bộ độc lập (`qlsv_frontend_net`, `qlsv_backend_net`, `qlsv_monitoring_net`). Cơ sở dữ liệu MySQL không ánh xạ cổng 3306 ra ngoài máy chủ host.
3. **Phân quyền tối thiểu Database (Least Privilege):** Ứng dụng chỉ dùng tài khoản `student_user` với 4 quyền cơ bản `SELECT, INSERT, UPDATE, DELETE`, không dùng tài khoản root.
4. **Mật khẩu mạnh & Bảo vệ Secret:** Sử dụng file `.env` được loại trừ qua `.gitignore`. Mật khẩu dài trên 16 ký tự, có ký tự hoa, số và ký tự đặc biệt (`RootPass_QLSV@2026!Secured`).
5. **Nginx Security Headers & TLS Hiện đại:** Kích hoạt HSTS, chống Clickjacking, chống MIME-type Sniffing, lọc XSS, ẩn số hiệu phiên bản Nginx và chỉ dùng TLS 1.2/1.3.
6. **Resource Limits & Security Opts:** Khai báo trần CPU và RAM cho từng dịch vụ; bật cờ `security_opt: [no-new-privileges:true]` trên các container.

*Hình 4.12. Minh chứng Hardening bằng các lệnh kiểm tra thực tế trong container*

### 4.8.2. Git và GitHub
Toàn bộ mã nguồn và tệp cấu hình được quản lý trên GitHub tại:  
`https://github.com/dtc245200257-cell/de02_quanlysinhvien`  
Lịch sử commit được chia làm 3 mốc rõ ràng theo đúng tiến trình yêu cầu của đề tài:
- `fb22535` - Commit 1: Triển khai Ứng dụng Web, MySQL, phpMyAdmin và Nginx Reverse Proxy (SSL & Security Headers).
- `55304ca` - Commit 2: Tích hợp hệ thống giám sát Prometheus, Grafana và các Exporter.
- `5e5fa74` - Commit 3: Triển khai hệ thống log tập trung Loki + Promtail (LogQL) và Hardening toàn diện.

*Hình 4.13. Lịch sử các commit có cấu trúc rõ ràng trên GitHub*

<div style="page-break-after: always;"></div>

# CHƯƠNG 5. KIỂM THỬ VÀ ĐÁNH GIÁ

## 5.1. Phương pháp kiểm thử
Quá trình kiểm thử được thực hiện đa tầng:
- **Tầng ứng dụng & chức năng:** Kiểm tra các API RESTful qua lệnh `curl` và giao diện Web (thêm, sửa, xóa, tìm kiếm, tính điểm GPA, nạp dữ liệu seed).
- **Tầng hạ tầng & mạng:** Kiểm tra trạng thái container (`docker compose ps`), cú pháp Nginx (`nginx -t`), chuyển hướng HTTP 301, chứng chỉ SSL và các Security Headers (`curl -k -I`).
- **Tầng giám sát & ghi log:** Kiểm tra trạng thái các Prometheus Targets, đối chiếu số liệu hiển thị trên Dashboard Grafana, thực thi các truy vấn LogQL kiểm tra độ trễ truyền log từ Promtail tới Loki.
- **Tầng bảo mật:** Kiểm tra UID của tiến trình đang chạy trong container (`id`), kiểm tra tính ẩn của mạng backend (`docker network inspect`) và kiểm tra quyền hạn của user MySQL.

## 5.2. Kết quả kiểm thử chức năng

Bảng 5.1. Kết quả kiểm thử chức năng ứng dụng Web
| Ca kiểm thử | Thao tác thực hiện | Kết quả kỳ vọng | Kết quả thực tế | Đánh giá |
| :--- | :--- | :--- | :--- | :---: |
| **Kiểm tra Healthcheck** | `GET /health` | HTTP 200, status: UP, database: CONNECTED | Đúng định dạng JSON, database: CONNECTED | **Đạt** |
| **Thống kê Dashboard** | `GET /api/stats` | Trả về tổng SV, số lớp, GPA, biểu đồ học lực | Trả về đúng 11 SV, 4 lớp, 4 môn, GPA 7.85 | **Đạt** |
| **Lấy danh sách sinh viên** | `GET /api/students` | Trả về danh sách sinh viên kèm thông tin lớp | Trả về danh sách sinh viên sắp xếp mới nhất | **Đạt** |
| **Tìm kiếm sinh viên** | Nhập từ khóa tìm kiếm | Danh sách lọc tức thời theo tên hoặc mã SV | Lọc chính xác độ trễ $< 50\text{ms}$ | **Đạt** |
| **Thêm mới sinh viên** | `POST /api/students` | Tạo mới thành công, cập nhật gauge metrics | Bản ghi lưu vào MySQL, gauge tăng thêm 1 | **Đạt** |
| **Trùng mã sinh viên** | `POST` mã SV đã tồn tại | Báo lỗi trùng lặp (HTTP 500/400) | Báo lỗi Duplicate entry for key | **Đạt** |
| **Tính điểm tổng kết** | Nhập QT: 8.0, Thi: 9.0 | Điểm tổng kết: $8.0 \times 0.4 + 9.0 \times 0.6 = 8.6$ | Điểm TK: 8.6, Điểm chữ: A (Giỏi) | **Đạt** |
| **Xóa sinh viên** | `DELETE /api/students/:id` | Xóa sinh viên và tự động xóa điểm liên quan | Xóa thành công, danh sách tự cập nhật | **Đạt** |
| **phpMyAdmin quản trị** | Truy cập `/phpmyadmin/` | Đăng nhập thành công, thao tác CSDL | Truy cập mượt mà qua HTTPS reverse proxy | **Đạt** |

## 5.3. Kết quả kiểm thử hạ tầng và bảo mật

Bảng 5.2. Kết quả kiểm thử hạ tầng, giám sát và bảo mật
| Hạng mục kiểm tra | Phương pháp / Lệnh kiểm tra | Kết quả thực tế | Đánh giá |
| :--- | :--- | :--- | :---: |
| **Trạng thái 11 container**| `docker compose ps` | 11/11 services trạng thái Up / healthy | **Đạt** |
| **Cú pháp file Compose** | `docker compose config --quiet` | Không có cảnh báo hoặc lỗi cú pháp | **Đạt** |
| **Cấu hình Nginx** | `docker exec qlsv_nginx nginx -t` | syntax is ok, test is successful | **Đạt** |
| **Chuyển hướng HTTP 301** | `curl -I http://192.168.253.129/` | HTTP/1.1 301 Moved Permanently $\rightarrow$ HTTPS | **Đạt** |
| **Security Headers** | `curl -k -I https://192.168.253.129/` | Có đủ HSTS, nosniff, SAMEORIGIN, XSS, ẩn version | **Đạt** |
| **Prometheus Targets** | `http://192.168.253.129:9090/targets` | 5/5 targets (app, mysql, node, cadvisor, prom) đều UP | **Đạt** |
| **Grafana Dashboards** | Mở thư mục QLSV Monitoring | 2 Dashboards nạp sẵn, hiển thị dữ liệu đầy đủ | **Đạt** |
| **Thu thập Log Loki** | LogQL `{container="qlsv_app"}` | Luồng log trả về thời gian thực trên Grafana Explore | **Đạt** |
| **Người dùng Non-root** | `docker exec qlsv_app id` | `uid=1000(node) gid=1000(node)` | **Đạt** |
| **Bảo vệ file bí mật** | `git check-ignore -v .env` | File `.env` được ignore thành công, không lên Git | **Đạt** |
| **Cô lập mạng Database** | `docker network inspect qlsv_backend_net` | Mạng backend riêng biệt, port 3306 không mở ra host | **Đạt** |

## 5.4. Các lỗi phát hiện trong quá trình hoàn thiện

### 5.4.1. Healthcheck kết nối 127.0.0.1 thay cho localhost trên Alpine Linux
- **Mô tả sự cố:** Trong quá trình build ban đầu, container `qlsv_app` báo trạng thái `unhealthy`. Kiểm tra log container cho thấy câu lệnh `wget --spider http://localhost:3000/health` bị trả về lỗi `Connection refused`.
- **Nguyên nhân:** Trên nền tảng nhân Alpine Linux rút gọn, tên máy chủ `localhost` được trình phân giải ưu tiên giải sang địa chỉ IPv6 `::1`, trong khi server Node.js đang lắng nghe trên socket IPv4 `0.0.0.0:3000`.
- **Giải pháp xử lý:** Sửa câu lệnh Healthcheck trong `app/Dockerfile` thành gọi trực tiếp địa chỉ IPv4 cục bộ:  
  `wget -q -O - http://127.0.0.1:3000/health > /dev/null || exit 1`.  
  Sau khi cập nhật, container chuyển sang trạng thái `healthy` ngay lập tức.

### 5.4.2. Tường lửa Ubuntu UFW chặn cổng Grafana (3000) và Prometheus (9090)
- **Mô tả sự cố:** Mặc dù container Grafana và Prometheus đã chạy thành công bên trong máy chủ Ubuntu, trình duyệt trên máy thật vẫn báo lỗi `ERR_CONNECTION_TIMED_OUT` khi mở `http://192.168.253.129:3000`.
- **Nguyên nhân:** Dịch vụ tường lửa Uncomplicated Firewall (UFW) trên Ubuntu Server đang kích hoạt và chỉ cho phép lưu lượng đi qua cổng 22, 80 và 443; các cổng khác đều bị drop gói tin.
- **Giải pháp xử lý:** Chạy lệnh bổ sung quy tắc cho phép cổng vào tường lửa:  
  `sudo ufw allow 3000/tcp && sudo ufw allow 9090/tcp`.  
  Ngay sau đó, máy thật đã có thể kết nối bình thường vào giao diện web của Grafana và Prometheus.

### 5.4.3. Xác thực cấu hình MySQL Exporter thông qua file my.cnf
- **Mô tả sự cố:** Container `qlsv_mysqld_exporter` ban đầu bị khởi động lại liên tục với log: `failed to validate config: no user specified in section or parent`.
- **Nguyên nhân:** Phiên bản MySQL Exporter v0.15.1 trở lên thay đổi cơ chế đọc tham số từ biến môi trường `DATA_SOURCE_NAME` và yêu cầu định dạng tệp cấu hình `.my.cnf` tường minh.
- **Giải pháp xử lý:** Tạo tệp `database/my.cnf` lưu trữ thông tin đăng nhập dạng client và mount file này vào container với quyền chỉ đọc (`:ro`) kèm cờ lệnh `--config.my-cnf=/.my.cnf`. MySQL Exporter sau đó đã kết nối thành công và xuất số liệu ổn định trên cổng 9104.

## 5.5. Đánh giá theo yêu cầu đề bài

Bảng 5.3. Đánh giá mức độ đáp ứng các tiêu chí đề tài
| Tiêu chí đánh giá | Điểm tối đa | Điểm tự đánh giá | Minh chứng kết quả thực tế |
| :--- | :---: | :---: | :--- |
| **1. Quản lý mã nguồn trên GitHub** | 1.5 | 1.5 | Repository công khai, đúng 03 commit kỹ thuật, README chi tiết. |
| **2. Triển khai ứng dụng + Database** | 1.5 | 1.5 | Web Node.js ổn định, MySQL 8.0 lưu trữ bền vững, phpMyAdmin quản trị tốt. |
| **3. Nginx Reverse Proxy** | 1.5 | 1.5 | Reverse proxy định tuyến chuẩn, HTTPS tự ký cổng 443, Security Headers đầy đủ. |
| **4. Hệ thống giám sát (Prometheus/Grafana)**| 1.5 | 1.5 | 5/5 targets UP, Dashboard trực quan hóa Web, MySQL, Host và Container. |
| **5. Hệ thống log tập trung (Loki)** | 1.5 | 1.5 | Loki + Promtail thu gom tự động, thực thi 4 câu truy vấn LogQL thực tế. |
| **6. Hardening hệ thống** | 1.5 | 1.5 | Đạt đủ 6 biện pháp: non-root, network isolation, least privilege, limits... |
| **7. Tổng thể & Trình bày** | 1.0 | 1.0 | Hệ thống 11 containers chạy mượt mà bằng 1 lệnh Compose, báo cáo chi tiết. |
| **TỔNG ĐIỂM ĐÁNH GIÁ** | **10.0** | **10.0 / 10.0** | **Hoàn thành xuất sắc toàn bộ yêu cầu đề bài** |

## 5.6. Hạn chế
- Chứng chỉ SSL hiện tại sử dụng dạng tự ký (Self-signed) cho địa chỉ IP nội bộ, do đó các trình duyệt web vẫn hiển thị cảnh báo tin cậy ban đầu (người dùng cần nhấn *Nâng cao* $\rightarrow$ *Tiếp tục truy cập*).
- Container cAdvisor yêu cầu cờ `privileged: true` để truy cập vào hệ thống tệp cgroup của Linux; cấu hình này phù hợp cho môi trường lab thực hành nhưng cần được hạn chế trên môi trường sản xuất thực tế bằng cách chỉ định các Capability cụ thể.

## 5.7. Hướng phát triển
- Tích hợp giải pháp Certbot / Let's Encrypt tự động cấp phát và gia hạn chứng chỉ SSL hợp lệ khi hệ thống được gán tên miền công khai.
- Xây dựng hệ thống cảnh báo tự động (Alertmanager) gửi thông báo qua Telegram hoặc Email khi máy chủ gặp sự cố (MySQL ngắt kết nối, dung lượng RAM $> 90\%$, tỷ lệ lỗi HTTP 5xx tăng cao).
- Tích hợp đường ống CI/CD tự động thông qua GitHub Actions để tự động build image và triển khai lên máy chủ mỗi khi có commit mới vào nhánh chính.
- Nâng cấp kiến trúc điều phối từ Docker Compose lên cụm Kubernetes (K8s) với khả năng tự phục hồi (Self-healing) và tự động co giãn tải (Horizontal Pod Autoscaling).

<div style="page-break-after: always;"></div>

# KẾT LUẬN

Sau thời gian nghiêm túc nghiên cứu và thực hành, em đã hoàn thành toàn diện **Đề tài số 02: Hệ thống Quản lý Sinh viên** thuộc học phần *Triển khai và Quản trị Hệ thống Phần mềm*. Hệ thống không chỉ đáp ứng trọn vẹn các yêu cầu nghiệp vụ về quản lý hồ sơ sinh viên, lớp học và điểm số học phần, mà quan trọng hơn đã thiết lập được một môi trường hạ tầng phân tán theo chuẩn công nghiệp với đầy đủ các trụ cột DevOps hiện đại:
1. **Container hóa đồng nhất:** Đóng gói 11 dịch vụ hoạt động độc lập, không phụ thuộc vào môi trường host và khởi chạy đơn giản qua Docker Compose.
2. **Bảo mật và an toàn thông tin:** Thiết lập cổng Reverse Proxy an toàn với HTTPS, chuyển hướng HTTP 301, Security Headers, cô lập mạng dữ liệu backend và áp dụng nguyên tắc người dùng non-root.
3. **Giám sát số liệu chủ động (Observability):** Thu thập toàn diện chỉ số hiệu năng thông qua cụm Prometheus và hiển thị trực quan qua Grafana Dashboard.
4. **Quản trị nhật ký thông minh:** Thu gom tự động và truy vấn phân tích log thời gian thực với Grafana Loki và Promtail (LogQL).
5. **Kỷ luật quản lý mã nguồn:** Duy trì kho lưu trữ GitHub sạch sẽ, phân tách các mốc commit có ý nghĩa kỹ thuật và cung cấp tài liệu vận hành chi tiết.

Quá trình thực hiện đề tài đã giúp em củng cố sâu sắc kiến thức lý thuyết về kiến trúc mạng máy tính, quản trị hệ điều hành Linux, công nghệ container và các phương pháp vận hành hệ thống phần mềm hiện đại, tạo nền tảng vững chắc cho công việc chuyên môn trong tương lai.

Em xin chân thành cảm ơn thầy **VŨ VIỆT DŨNG** đã tận tình hướng dẫn, truyền đạt kiến thức và định hướng phương pháp triển khai để em có thể hoàn thành tốt bài thực hành này!

<div style="page-break-after: always;"></div>

# TÀI LIỆU THAM KHẢO

1. **Bộ môn Hệ thống Thông tin & Mạng máy tính:** *Tài liệu Hướng dẫn Đề tài thực hành Môn Triển khai và Quản trị Hệ thống Phần mềm*, Trường Đại học Công nghệ Thông tin và Truyền thông (ICTU), 2026.
2. **Docker Documentation:** *Networking in Compose & Compose file specification reference*, https://docs.docker.com/compose/ (truy cập tháng 10/2026).
3. **Nginx Documentation:** *Module ngx_http_proxy_module & ngx_http_ssl_module reference*, https://nginx.org/en/docs/ (truy cập tháng 10/2026).
4. **MySQL Documentation:** *MySQL 8.0 Reference Manual: Security & User Account Management*, https://dev.mysql.com/doc/refman/8.0/en/ (truy cập tháng 10/2026).
5. **Prometheus Documentation:** *Getting Started, Configuration and PromQL Basics*, https://prometheus.io/docs/ (truy cập tháng 10/2026).
6. **Grafana Labs Documentation:** *Dashboards, Provisioning and Loki LogQL Reference*, https://grafana.com/docs/ (truy cập tháng 10/2026).
7. **OWASP Foundation:** *REST Security Cheat Sheet & Secure Headers Project Guide*, https://cheatsheetseries.owasp.org/ (truy cập tháng 10/2026).
8. **Express.js Documentation:** *Production Best Practices: Performance and Reliability*, https://expressjs.com/ (truy cập tháng 10/2026).

<div style="page-break-after: always;"></div>

# PHỤ LỤC

### A. Các lệnh kiểm tra chính trên máy chủ
```bash
# Kiểm tra cú pháp Docker Compose
docker compose config --quiet

# Kiểm tra trạng thái hoạt động của 11 container
docker compose ps

# Kiểm tra cú pháp cấu hình Nginx
docker compose exec nginx nginx -t

# Kiểm tra định danh người dùng non-root của ứng dụng Node.js
docker compose exec app id

# Kiểm tra file .env được bỏ qua trong Git
git check-ignore -v .env

# Kiểm tra mạng nội bộ backend được cô lập
docker network inspect qlsv_backend_net --format '{{.Internal}}'
```

### B. PromQL đã sử dụng trong Dashboard Grafana
```promql
# Tốc độ request HTTP trên giây
sum(rate(qlsv_http_requests_total[1m]))

# Phân vị độ trễ p95 của ứng dụng
histogram_quantile(0.95, sum(rate(qlsv_http_request_duration_seconds_bucket[1m])) by (le))

# Tần suất truy vấn MySQL trên giây
rate(mysql_global_status_queries[1m])

# Số kết nối đang hoạt động tới MySQL
mysql_global_status_threads_connected

# Phần trăm tải CPU của hệ thống host
100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)

# Dung lượng RAM sử dụng của máy chủ host
node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes
```

### C. LogQL đã sử dụng trong Loki Explore
```logql
# Xem toàn bộ luồng log ứng dụng Node.js
{container="qlsv_app"}

# Lọc log Nginx dạng JSON và tìm request lỗi
{container="qlsv_nginx"} | json | status >= 400

# Lọc cảnh báo và lỗi trên toàn bộ container
{container=~"qlsv_.*"} |= "error" or {container=~"qlsv_.*"} |= "warn"

# Thống kê tốc độ sinh log theo container
sum by (container) (rate({container=~"qlsv_.*"}[1m]))
```

### D. Danh mục API chính của hệ thống
- `GET /health`: Kiểm tra trạng thái sức khỏe ứng dụng và kết nối MySQL.
- `GET /metrics`: Xuất các số liệu đo lường theo chuẩn Prometheus.
- `GET /api/stats`: Lấy thống kê tổng quan (số SV, lớp, môn, GPA, phân bố học lực).
- `GET /api/students`: Lấy danh sách sinh viên (hỗ trợ `search` và `class_id`).
- `POST /api/students`: Tạo mới hồ sơ sinh viên.
- `PUT /api/students/:id`: Cập nhật thông tin sinh viên.
- `DELETE /api/students/:id`: Xóa sinh viên khỏi hệ thống.
- `GET /api/classes`: Lấy danh sách lớp kèm sĩ số sinh viên tự động.
- `GET /api/courses`: Lấy danh mục các môn học.
- `GET /api/grades`: Lấy bảng điểm học phần của sinh viên.
- `POST /api/grades`: Nhập hoặc cập nhật điểm học phần.

### E. Lưu ý vận hành
- **Bảo toàn dữ liệu MySQL:** Tuyệt đối không sử dụng lệnh `docker compose down -v` vì tùy chọn `-v` sẽ xóa sạch Docker Volume `mysql_data`, làm mất toàn bộ cơ sở dữ liệu sinh viên đã nhập.
- **Cập nhật ứng dụng:** Khi chỉnh sửa mã nguồn trong thư mục `app/`, chỉ cần build lại service `app` bằng lệnh `docker compose up -d --build app` mà không cần tắt các dịch vụ Database, Nginx hay Monitoring đang chạy.
- **Khởi động lại tường lửa:** Nếu máy chủ khởi động lại và không truy cập được vào cổng 3000 hoặc 9090, hãy kiểm tra lại trạng thái UFW bằng lệnh `sudo ufw status` để đảm bảo các cổng vẫn được cho phép.
