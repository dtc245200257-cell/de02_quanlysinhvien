const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const client = require('prom-client');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// PROMETHEUS METRICS SETUP
// ==========================================
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'qlsv_' });

// Custom Metrics
const httpRequestCounter = new client.Counter({
  name: 'qlsv_http_requests_total',
  help: 'Tong so luot request HTTP',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestCounter);

const httpRequestDuration = new client.Histogram({
  name: 'qlsv_http_request_duration_seconds',
  help: 'Thoi gian phan hoi request HTTP tinh bang giay',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
register.registerMetric(httpRequestDuration);

const totalStudentsGauge = new client.Gauge({
  name: 'qlsv_total_students',
  help: 'Tong so sinh vien hien co trong he thong',
});
register.registerMetric(totalStudentsGauge);

const totalClassesGauge = new client.Gauge({
  name: 'qlsv_total_classes',
  help: 'Tong so lop hoc hien co trong he thong',
});
register.registerMetric(totalClassesGauge);

// Middleware do luong metrics & logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status_code: res.statusCode }, duration);

    // Structured JSON log for Promtail / Loki
    const logData = {
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_ms: Math.round(duration * 1000),
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      user_agent: req.headers['user-agent'] || 'unknown',
    };
    console.log(JSON.stringify(logData));
  });
  next();
});

// ==========================================
// DATABASE CONNECTION POOL
// ==========================================
const dbConfig = {
  host: process.env.MYSQL_HOST || 'db',
  port: parseInt(process.env.MYSQL_PORT, 10) || 3306,
  user: process.env.MYSQL_USER || 'student_user',
  password: process.env.MYSQL_PASSWORD || 'StudentPass_2026!Sec',
  database: process.env.MYSQL_DATABASE || 'qlsinhvien',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function initDbConnection(retries = 15, delay = 3000) {
  while (retries > 0) {
    try {
      pool = mysql.createPool(dbConfig);
      const [rows] = await pool.query('SELECT 1 + 1 AS result');
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Ket noi co so du lieu MySQL thanh cong!',
      }));
      await updateSystemGauges();
      return;
    } catch (err) {
      retries -= 1;
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'warn',
        message: `Ket noi MySQL that bai, thu lai sau ${delay}ms... (con ${retries} lan)`,
        error: err.message,
      }));
      if (retries === 0) {
        console.error(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Khong the ket noi den co so du lieu MySQL sau tat ca cac lan thu!',
        }));
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

async function updateSystemGauges() {
  try {
    if (!pool) return;
    const [[{ count: svCount }]] = await pool.query('SELECT COUNT(*) AS count FROM students');
    const [[{ count: lopCount }]] = await pool.query('SELECT COUNT(*) AS count FROM classes');
    totalStudentsGauge.set(svCount);
    totalClassesGauge.set(lopCount);
  } catch (e) {
    // ignore gauge error during startup
  }
}

// ==========================================
// HEALTHCHECK & METRICS ENDPOINTS
// ==========================================
app.get('/health', async (req, res) => {
  try {
    if (!pool) {
      return res.status(503).json({ status: 'DOWN', database: 'DISCONNECTED', timestamp: new Date() });
    }
    await pool.query('SELECT 1');
    res.json({
      status: 'UP',
      uptime: process.uptime(),
      database: 'CONNECTED',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: 'DOWN',
      database: 'ERROR',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/metrics', async (req, res) => {
  try {
    await updateSystemGauges();
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// ==========================================
// API ROUTES: DASHBOARD STATS
// ==========================================
app.get('/api/stats', async (req, res) => {
  try {
    const [[{ total_students }]] = await pool.query('SELECT COUNT(*) AS total_students FROM students');
    const [[{ total_classes }]] = await pool.query('SELECT COUNT(*) AS total_classes FROM classes');
    const [[{ total_courses }]] = await pool.query('SELECT COUNT(*) AS total_courses FROM courses');
    const [[{ avg_score }]] = await pool.query('SELECT ROUND(AVG(final_score), 2) AS avg_score FROM grades');

    // Phan loai hoc luc
    const [gradeDistribution] = await pool.query(`
      SELECT 
        SUM(CASE WHEN final_score >= 9.0 THEN 1 ELSE 0 END) AS xuat_sac,
        SUM(CASE WHEN final_score >= 8.0 AND final_score < 9.0 THEN 1 ELSE 0 END) AS gioi,
        SUM(CASE WHEN final_score >= 6.5 AND final_score < 8.0 THEN 1 ELSE 0 END) AS kha,
        SUM(CASE WHEN final_score >= 5.0 AND final_score < 6.5 THEN 1 ELSE 0 END) AS trung_binh,
        SUM(CASE WHEN final_score < 5.0 THEN 1 ELSE 0 END) AS yeu
      FROM grades
    `);

    // Top sinh vien diem cao nhat
    const [topStudents] = await pool.query(`
      SELECT s.student_code, s.full_name, c.class_name, ROUND(AVG(g.final_score), 2) AS gpa
      FROM students s
      JOIN classes c ON s.class_id = c.id
      JOIN grades g ON s.id = g.student_id
      GROUP BY s.id, s.student_code, s.full_name, c.class_name
      ORDER BY gpa DESC
      LIMIT 5
    `);

    res.json({
      total_students,
      total_classes,
      total_courses,
      avg_score: avg_score || 0,
      distribution: gradeDistribution[0] || {},
      top_students: topStudents,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// API ROUTES: SINH VIEN (CRUD)
// ==========================================
app.get('/api/students', async (req, res) => {
  try {
    const { search, class_id } = req.query;
    let query = `
      SELECT s.id, s.student_code, s.full_name, DATE_FORMAT(s.date_of_birth, '%Y-%m-%d') AS date_of_birth,
             s.gender, s.email, s.phone, s.class_id, c.class_name, c.class_code
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ` AND (s.student_code LIKE ? OR s.full_name LIKE ? OR s.email LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (class_id) {
      query += ` AND s.class_id = ?`;
      params.push(class_id);
    }

    query += ` ORDER BY s.id DESC`;
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { student_code, full_name, date_of_birth, gender, email, phone, class_id } = req.body;
    if (!student_code || !full_name || !email) {
      return res.status(400).json({ error: 'Mã SV, họ tên và email là bắt buộc!' });
    }

    const [result] = await pool.query(
      'INSERT INTO students (student_code, full_name, date_of_birth, gender, email, phone, class_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [student_code, full_name, date_of_birth, gender || 'Nam', email, phone, class_id || null]
    );
    await updateSystemGauges();
    res.status(201).json({ id: result.insertId, message: 'Thêm sinh viên thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { student_code, full_name, date_of_birth, gender, email, phone, class_id } = req.body;
    await pool.query(
      'UPDATE students SET student_code=?, full_name=?, date_of_birth=?, gender=?, email=?, phone=?, class_id=? WHERE id=?',
      [student_code, full_name, date_of_birth, gender, email, phone, class_id || null, id]
    );
    res.json({ message: 'Cập nhật sinh viên thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE id=?', [id]);
    await updateSystemGauges();
    res.json({ message: 'Xóa sinh viên thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// API ROUTES: LOP HOC (CRUD)
// ==========================================
app.get('/api/classes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, COUNT(s.id) AS student_count
      FROM classes c
      LEFT JOIN students s ON c.id = s.class_id
      GROUP BY c.id
      ORDER BY c.class_code ASC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/classes', async (req, res) => {
  try {
    const { class_code, class_name, faculty, academic_year } = req.body;
    if (!class_code || !class_name) {
      return res.status(400).json({ error: 'Mã lớp và tên lớp là bắt buộc!' });
    }
    const [result] = await pool.query(
      'INSERT INTO classes (class_code, class_name, faculty, academic_year) VALUES (?, ?, ?, ?)',
      [class_code, class_name, faculty || '', academic_year || '']
    );
    await updateSystemGauges();
    res.status(201).json({ id: result.insertId, message: 'Thêm lớp học thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { class_code, class_name, faculty, academic_year } = req.body;
    await pool.query(
      'UPDATE classes SET class_code=?, class_name=?, faculty=?, academic_year=? WHERE id=?',
      [class_code, class_name, faculty, academic_year, id]
    );
    res.json({ message: 'Cập nhật lớp học thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM classes WHERE id=?', [id]);
    await updateSystemGauges();
    res.json({ message: 'Xóa lớp học thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// API ROUTES: MON HOC
// ==========================================
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY course_code ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// API ROUTES: DIEM SO (CRUD)
// ==========================================
function getLetterGrade(score) {
  if (score >= 9.0) return 'A+';
  if (score >= 8.5) return 'A';
  if (score >= 8.0) return 'B+';
  if (score >= 7.0) return 'B';
  if (score >= 6.5) return 'C+';
  if (score >= 5.5) return 'C';
  if (score >= 5.0) return 'D+';
  if (score >= 4.0) return 'D';
  return 'F';
}

app.get('/api/grades', async (req, res) => {
  try {
    const { student_id, course_id } = req.query;
    let query = `
      SELECT g.id, g.student_id, g.course_id, g.process_score, g.exam_score, g.final_score, g.letter_grade,
             s.student_code, s.full_name, c.class_name, co.course_code, co.course_name
      FROM grades g
      JOIN students s ON g.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      JOIN courses co ON g.course_id = co.id
      WHERE 1=1
    `;
    const params = [];
    if (student_id) {
      query += ` AND g.student_id = ?`;
      params.push(student_id);
    }
    if (course_id) {
      query += ` AND g.course_id = ?`;
      params.push(course_id);
    }
    query += ` ORDER BY g.id DESC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/grades', async (req, res) => {
  try {
    const { student_id, course_id, process_score, exam_score } = req.body;
    if (!student_id || !course_id) {
      return res.status(400).json({ error: 'Sinh viên và môn học là bắt buộc!' });
    }
    const pScore = parseFloat(process_score) || 0;
    const eScore = parseFloat(exam_score) || 0;
    const finalScore = parseFloat((pScore * 0.4 + eScore * 0.6).toFixed(2));
    const letter = getLetterGrade(finalScore);

    const [result] = await pool.query(
      `INSERT INTO grades (student_id, course_id, process_score, exam_score, letter_grade)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE process_score = VALUES(process_score), exam_score = VALUES(exam_score), letter_grade = VALUES(letter_grade)`,
      [student_id, course_id, pScore, eScore, letter]
    );

    res.status(201).json({ id: result.insertId, message: 'Lưu điểm số thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/grades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM grades WHERE id=?', [id]);
    res.json({ message: 'Xóa điểm thành công!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Khoi dong server
initDbConnection().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Hệ thống Quản lý Sinh viên đang chạy trên cổng ${PORT}`,
      author: 'DTC245200257',
    }));
  });
});
