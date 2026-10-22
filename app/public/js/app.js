// Global state
let classesList = [];
let coursesList = [];
let studentsList = [];
let gradeChart = null;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  loadClasses();
  loadStudents();
  loadCourses();
  loadGrades();
  checkHealth();

  // Tab switching handler
  document.querySelectorAll('.navbar-nav [data-bs-toggle="tab"]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSelector = btn.getAttribute('data-bs-target') || btn.getAttribute('href');
      if (!targetSelector || targetSelector === '#') return;

      document.querySelectorAll('.navbar-nav .nav-link').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      document.querySelectorAll('.tab-content .tab-pane').forEach((p) => p.classList.remove('show', 'active'));
      const targetPane = document.querySelector(targetSelector);
      if (targetPane) {
        targetPane.classList.add('show', 'active');
      }

      if (targetSelector === '#tab-dashboard' && gradeChart) {
        gradeChart.resize();
      }
    });
  });

  // Search & filter events
  document.getElementById('search-student').addEventListener('input', debounce(loadStudents, 300));
  document.getElementById('filter-student-class').addEventListener('change', loadStudents);

  // Forms submit
  document.getElementById('studentForm').addEventListener('submit', handleStudentSubmit);
  document.getElementById('classForm').addEventListener('submit', handleClassSubmit);
  document.getElementById('gradeForm').addEventListener('submit', handleGradeSubmit);
});

// Toast notification helper
function showToast(message, isError = false) {
  const toastEl = document.getElementById('actionToast');
  const toastBody = document.getElementById('toastMessage');
  toastBody.textContent = message;
  toastEl.className = `toast align-items-center text-white ${isError ? 'bg-danger' : 'bg-success'} border-0`;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Health check
async function checkHealth() {
  try {
    const res = await fetch('/health');
    const data = await res.json();
    const badge = document.getElementById('health-badge');
    if (data.status === 'UP') {
      badge.textContent = `Online (MySQL: OK - Up: ${Math.round(data.uptime)}s)`;
    } else {
      badge.textContent = 'Degraded';
    }
  } catch (e) {
    document.getElementById('health-badge').textContent = 'Disconnected';
  }
}

// ================= STATS & DASHBOARD =================
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();

    document.getElementById('stat-students').textContent = data.total_students || 0;
    document.getElementById('stat-classes').textContent = data.total_classes || 0;
    document.getElementById('stat-courses').textContent = data.total_courses || 0;
    document.getElementById('stat-avg-score').textContent = data.avg_score || '0.0';

    // Top students
    const tbody = document.getElementById('top-students-list');
    tbody.innerHTML = '';
    if (data.top_students && data.top_students.length > 0) {
      data.top_students.forEach((s) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="fw-bold">${s.student_code}</td>
          <td>${s.full_name}</td>
          <td><span class="badge bg-light text-dark border">${s.class_name || 'N/A'}</span></td>
          <td class="text-center"><span class="badge bg-success fs-6">${s.gpa}</span></td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Chưa có dữ liệu điểm</td></tr>';
    }

    // Render chart
    renderGradeChart(data.distribution || {});
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function renderGradeChart(dist) {
  const ctx = document.getElementById('gradeChart').getContext('2d');
  const values = [
    dist.xuat_sac || 0,
    dist.gioi || 0,
    dist.kha || 0,
    dist.trung_binh || 0,
    dist.yeu || 0,
  ];

  if (gradeChart) {
    gradeChart.destroy();
  }

  gradeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Xuất sắc (>= 9.0)', 'Giỏi (8.0 - 8.9)', 'Khá (6.5 - 7.9)', 'Trung bình (5.0 - 6.4)', 'Yếu (< 5.0)'],
      datasets: [{
        data: values,
        backgroundColor: ['#10b981', '#3b82f6', '#06b6d4', '#f59e0b', '#ef4444'],
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
      },
    },
  });
}

// ================= SINH VIEN =================
async function loadStudents() {
  try {
    const search = document.getElementById('search-student').value;
    const classId = document.getElementById('filter-student-class').value;

    let url = '/api/students?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (classId) url += `class_id=${encodeURIComponent(classId)}&`;

    const res = await fetch(url);
    studentsList = await res.json();

    const tbody = document.getElementById('student-table-body');
    tbody.innerHTML = '';

    if (studentsList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Không tìm thấy sinh viên nào</td></tr>';
      return;
    }

    studentsList.forEach((s) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-bold">${s.student_code}</td>
        <td>${s.full_name}</td>
        <td>${s.date_of_birth}</td>
        <td><span class="badge ${s.gender === 'Nam' ? 'bg-primary' : 'bg-danger'}">${s.gender}</span></td>
        <td><span class="badge bg-secondary">${s.class_name || s.class_code || 'Chưa xếp lớp'}</span></td>
        <td><a href="mailto:${s.email}" class="text-decoration-none">${s.email}</a></td>
        <td>${s.phone || '-'}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditStudentModal(${s.id})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteStudent(${s.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Update grade student select
    updateGradeStudentSelect();
  } catch (err) {
    console.error('Error loading students:', err);
  }
}

function updateGradeStudentSelect() {
  const select = document.getElementById('grade-student');
  select.innerHTML = '<option value="">-- Chọn sinh viên --</option>';
  studentsList.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.student_code} - ${s.full_name} (${s.class_code || 'N/A'})`;
    select.appendChild(opt);
  });
}

function openAddStudentModal() {
  document.getElementById('studentForm').reset();
  document.getElementById('student-id').value = '';
  document.getElementById('studentModalTitle').textContent = 'Thêm sinh viên mới';
  populateStudentClassSelect();
}

function openEditStudentModal(id) {
  const s = studentsList.find((item) => item.id === id);
  if (!s) return;
  document.getElementById('student-id').value = s.id;
  document.getElementById('student-code').value = s.student_code;
  document.getElementById('student-name').value = s.full_name;
  document.getElementById('student-dob').value = s.date_of_birth;
  document.getElementById('student-gender').value = s.gender;
  document.getElementById('student-email').value = s.email;
  document.getElementById('student-phone').value = s.phone || '';
  populateStudentClassSelect(s.class_id);
  document.getElementById('studentModalTitle').textContent = 'Cập nhật sinh viên';
  const modal = new bootstrap.Modal(document.getElementById('studentModal'));
  modal.show();
}

function populateStudentClassSelect(selectedId = null) {
  const select = document.getElementById('student-class');
  select.innerHTML = '<option value="">-- Chọn lớp học --</option>';
  classesList.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.class_code} - ${c.class_name}`;
    if (selectedId && c.id === selectedId) opt.selected = true;
    select.appendChild(opt);
  });
}

async function handleStudentSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('student-id').value;
  const payload = {
    student_code: document.getElementById('student-code').value.trim(),
    full_name: document.getElementById('student-name').value.trim(),
    date_of_birth: document.getElementById('student-dob').value,
    gender: document.getElementById('student-gender').value,
    email: document.getElementById('student-email').value.trim(),
    phone: document.getElementById('student-phone').value.trim(),
    class_id: document.getElementById('student-class').value || null,
  };

  try {
    const url = id ? `/api/students/${id}` : '/api/students';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Thao tác thất bại');

    bootstrap.Modal.getInstance(document.getElementById('studentModal')).hide();
    showToast(result.message || 'Thành công!');
    loadStudents();
    loadStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function deleteStudent(id) {
  if (!confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) return;
  try {
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
    const result = await res.json();
    showToast(result.message || 'Đã xóa sinh viên');
    loadStudents();
    loadStats();
    loadGrades();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ================= LOP HOC =================
async function loadClasses() {
  try {
    const res = await fetch('/api/classes');
    classesList = await res.json();

    // Populate filter dropdown
    const filter = document.getElementById('filter-student-class');
    filter.innerHTML = '<option value="">-- Tất cả lớp học --</option>';
    classesList.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.class_code} - ${c.class_name}`;
      filter.appendChild(opt);
    });

    // Populate table
    const tbody = document.getElementById('class-table-body');
    tbody.innerHTML = '';
    if (classesList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">Chưa có lớp học nào</td></tr>';
      return;
    }

    classesList.forEach((c) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="fw-bold">${c.class_code}</td>
        <td>${c.class_name}</td>
        <td>${c.faculty || '-'}</td>
        <td>${c.academic_year || '-'}</td>
        <td class="text-center"><span class="badge bg-info text-dark">${c.student_count || 0} SV</span></td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditClassModal(${c.id})">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteClass(${c.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading classes:', err);
  }
}

function openAddClassModal() {
  document.getElementById('classForm').reset();
  document.getElementById('class-id').value = '';
  document.getElementById('classModalTitle').textContent = 'Thêm lớp học mới';
}

function openEditClassModal(id) {
  const c = classesList.find((item) => item.id === id);
  if (!c) return;
  document.getElementById('class-id').value = c.id;
  document.getElementById('class-code').value = c.class_code;
  document.getElementById('class-name').value = c.class_name;
  document.getElementById('class-faculty').value = c.faculty || '';
  document.getElementById('class-year').value = c.academic_year || '';
  document.getElementById('classModalTitle').textContent = 'Cập nhật lớp học';
  const modal = new bootstrap.Modal(document.getElementById('classModal'));
  modal.show();
}

async function handleClassSubmit(e) {
  e.preventDefault();
  const id = document.getElementById('class-id').value;
  const payload = {
    class_code: document.getElementById('class-code').value.trim(),
    class_name: document.getElementById('class-name').value.trim(),
    faculty: document.getElementById('class-faculty').value.trim(),
    academic_year: document.getElementById('class-year').value.trim(),
  };

  try {
    const url = id ? `/api/classes/${id}` : '/api/classes';
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Thao tác thất bại');

    bootstrap.Modal.getInstance(document.getElementById('classModal')).hide();
    showToast(result.message || 'Thành công!');
    loadClasses();
    loadStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function deleteClass(id) {
  if (!confirm('Bạn có chắc muốn xóa lớp học này?')) return;
  try {
    const res = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
    const result = await res.json();
    showToast(result.message || 'Đã xóa lớp');
    loadClasses();
    loadStudents();
    loadStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

// ================= MON HOC =================
async function loadCourses() {
  try {
    const res = await fetch('/api/courses');
    coursesList = await res.json();

    const select = document.getElementById('grade-course');
    select.innerHTML = '<option value="">-- Chọn môn học --</option>';
    coursesList.forEach((co) => {
      const opt = document.createElement('option');
      opt.value = co.id;
      opt.textContent = `${co.course_code} - ${co.course_name} (${co.credits} tín chỉ)`;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Error loading courses:', err);
  }
}

// ================= DIEM SO =================
async function loadGrades() {
  try {
    const res = await fetch('/api/grades');
    const grades = await res.json();

    const tbody = document.getElementById('grade-table-body');
    tbody.innerHTML = '';

    if (grades.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted py-4">Chưa có bản ghi điểm nào</td></tr>';
      return;
    }

    grades.forEach((g) => {
      const tr = document.createElement('tr');
      const letterColor = g.letter_grade === 'A+' || g.letter_grade === 'A' ? 'bg-success' :
                         g.letter_grade === 'B+' || g.letter_grade === 'B' ? 'bg-primary' :
                         g.letter_grade === 'C+' || g.letter_grade === 'C' ? 'bg-info' :
                         g.letter_grade === 'D+' || g.letter_grade === 'D' ? 'bg-warning text-dark' : 'bg-danger';

      tr.innerHTML = `
        <td class="fw-bold">${g.student_code}</td>
        <td>${g.full_name}</td>
        <td><span class="badge bg-light text-dark border">${g.class_name || 'N/A'}</span></td>
        <td>${g.course_name}</td>
        <td class="text-center">${g.process_score}</td>
        <td class="text-center">${g.exam_score}</td>
        <td class="text-center fw-bold text-primary">${g.final_score}</td>
        <td class="text-center"><span class="badge ${letterColor} badge-grade">${g.letter_grade}</span></td>
        <td class="text-center">
          <button class="btn btn-sm btn-outline-danger" onclick="deleteGrade(${g.id})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading grades:', err);
  }
}

function openAddGradeModal() {
  document.getElementById('gradeForm').reset();
  updateGradeStudentSelect();
}

async function handleGradeSubmit(e) {
  e.preventDefault();
  const payload = {
    student_id: document.getElementById('grade-student').value,
    course_id: document.getElementById('grade-course').value,
    process_score: document.getElementById('grade-process').value,
    exam_score: document.getElementById('grade-exam').value,
  };

  try {
    const res = await fetch('/api/grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Lỗi lưu điểm');

    bootstrap.Modal.getInstance(document.getElementById('gradeModal')).hide();
    showToast(result.message || 'Đã lưu điểm thành công!');
    loadGrades();
    loadStats();
  } catch (err) {
    showToast(err.message, true);
  }
}

async function deleteGrade(id) {
  if (!confirm('Bạn có chắc muốn xóa điểm này?')) return;
  try {
    const res = await fetch(`/api/grades/${id}`, { method: 'DELETE' });
    const result = await res.json();
    showToast(result.message || 'Đã xóa điểm');
    loadGrades();
    loadStats();
  } catch (err) {
    showToast(err.message, true);
  }
}
