-- ========================================================
-- DATABASE INITIALIZATION SCRIPT - DE 02: QUAN LY SINH VIEN
-- Sinh vien: DTC245200257
-- ========================================================

CREATE DATABASE IF NOT EXISTS qlsinhvien CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qlsinhvien;

-- 1. Bang Lop hoc
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class_code VARCHAR(20) NOT NULL UNIQUE,
    class_name VARCHAR(100) NOT NULL,
    faculty VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bang Sinh vien
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Nam', 'Nữ', 'Khác') DEFAULT 'Nam',
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    class_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Bang Mon hoc
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(100) NOT NULL,
    credits INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Bang Diem so
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    process_score DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    exam_score DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    final_score DECIMAL(4,2) GENERATED ALWAYS AS (ROUND(process_score * 0.4 + exam_score * 0.6, 2)) STORED,
    letter_grade VARCHAR(2) NOT NULL DEFAULT 'F',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_student_course (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- HARDENING: TẠO USER ĐẶC THÙ HẠN CHẾ QUYỀN CHO ỨNG DỤNG
-- Không cấp quyền DROP, ALTER, GRANT, SHUTDOWN
-- ========================================================
CREATE USER IF NOT EXISTS 'student_user'@'%' IDENTIFIED BY 'StudentPass_2026!Sec';
GRANT SELECT, INSERT, UPDATE, DELETE ON qlsinhvien.* TO 'student_user'@'%';
FLUSH PRIVILEGES;

-- ========================================================
-- DU LIEU MAU (SEED DATA)
-- ========================================================

-- Du lieu Lop hoc
INSERT INTO classes (class_code, class_name, faculty, academic_year) VALUES
('CNTT-K18A', 'Công nghệ Thông tin K18A', 'Khoa Công nghệ Thông tin', '2023-2027'),
('CNTT-K18B', 'Công nghệ Thông tin K18B', 'Khoa Công nghệ Thông tin', '2023-2027'),
('KTPM-K18', 'Kỹ thuật Phần mềm K18', 'Khoa Kỹ thuật Phần mềm', '2023-2027'),
('HTTT-K18', 'Hệ thống Thông tin K18', 'Khoa Hệ thống Thông tin', '2023-2027')
ON DUPLICATE KEY UPDATE class_name = VALUES(class_name);

-- Du lieu Mon hoc
INSERT INTO courses (course_code, course_name, credits) VALUES
('IT3010', 'Triển khai và Quản trị Hệ thống', 3),
('IT3020', 'Lập trình Web nâng cao', 4),
('IT2030', 'Hệ quản trị Cơ sở dữ liệu', 3),
('IT2040', 'Mạng máy tính & An toàn thông tin', 3)
ON DUPLICATE KEY UPDATE course_name = VALUES(course_name);

-- Du lieu Sinh vien
INSERT INTO students (student_code, full_name, date_of_birth, gender, email, phone, class_id) VALUES
('DTC245200257', 'Nguyễn Đăng Khoa', '2004-05-15', 'Nam', 'dtc245200257@student.edu.vn', '0912345678', 1),
('SV2026001', 'Trần Thị Mai', '2004-03-22', 'Nữ', 'maitt@student.edu.vn', '0923456789', 1),
('SV2026002', 'Lê Hoàng Nam', '2004-07-10', 'Nam', 'namlh@student.edu.vn', '0934567890', 1),
('SV2026003', 'Phạm Minh Tuấn', '2004-11-05', 'Nam', 'tuanpm@student.edu.vn', '0945678901', 2),
('SV2026004', 'Vũ Quỳnh Nga', '2004-09-18', 'Nữ', 'ngavq@student.edu.vn', '0956789012', 2),
('SV2026005', 'Đặng Quốc Bảo', '2004-01-30', 'Nam', 'baodq@student.edu.vn', '0967890123', 2),
('SV2026006', 'Hoàng Thu Trang', '2004-04-14', 'Nữ', 'tranght@student.edu.vn', '0978901234', 3),
('SV2026007', 'Ngô Kiến Huy', '2004-08-25', 'Nam', 'huynk@student.edu.vn', '0989012345', 3),
('SV2026008', 'Bùi Lan Anh', '2004-12-02', 'Nữ', 'anhbl@student.edu.vn', '0990123456', 3),
('SV2026009', 'Đỗ Quang Dũng', '2004-06-19', 'Nam', 'dungdq@student.edu.vn', '0901234567', 4),
('SV2026010', 'Dương Thúy Hằng', '2004-10-08', 'Nữ', 'hangdt@student.edu.vn', '0911223344', 4)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Du lieu Diem so
INSERT INTO grades (student_id, course_id, process_score, exam_score, letter_grade) VALUES
(1, 1, 9.5, 9.5, 'A+'),
(1, 2, 9.0, 9.0, 'A+'),
(1, 3, 8.5, 9.0, 'A'),
(2, 1, 8.0, 8.5, 'B+'),
(2, 2, 8.5, 8.0, 'B+'),
(3, 1, 7.0, 7.5, 'B'),
(3, 3, 7.5, 8.0, 'B+'),
(4, 1, 9.0, 8.5, 'A'),
(4, 2, 8.0, 7.5, 'B'),
(5, 1, 6.5, 7.0, 'C+'),
(5, 4, 7.0, 6.5, 'C+'),
(6, 2, 5.5, 6.0, 'C'),
(7, 1, 8.5, 9.0, 'A'),
(8, 2, 6.0, 5.5, 'C'),
(9, 3, 9.0, 9.5, 'A+'),
(10, 1, 7.5, 7.0, 'B')
ON DUPLICATE KEY UPDATE process_score = VALUES(process_score);
