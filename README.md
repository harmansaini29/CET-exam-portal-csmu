# Smart AI Exam Portal — CET/CSMU Edition

<div align="center">

**Enterprise-Grade · Zero-Tolerance Proctoring · AI Performance Analytics**

[![Flask](https://img.shields.io/badge/Backend-Flask_3-black?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/Frontend-React_19-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/Database-MySQL_8-4479a1?style=flat-square&logo=mysql)](https://mysql.com/)
[![Framer Motion](https://img.shields.io/badge/Animation-Framer_Motion-pink?style=flat-square)](https://www.framer.com/motion/)

</div>

---

## Architectural Overview

This platform has evolved into an **enterprise-grade Tri-Pillar Architecture**. The administration logic is completely decoupled and physically separated from the student-facing portal, ensuring a strict boundary where no student-accessible frontend contains admin pathways.

```
┌─────────────────────────────────────────────────────────────────┐
│                 PILLAR 1: STUDENT FRONTEND                      │
│                 (React 19, Vite, Port 5173)                     │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ InvigilatorLogin │→ │  StudentLogin    │                    │
│  └──────────────────┘  └────────┬─────────┘                    │
│                                 │                               │
│  ┌───────────────┐  ┌───────────▼──────┐                       │
│  │ Instructions  │←─│ StudentDashboard │                       │
│  └───────┬───────┘  └──────────────────┘                       │
│          │                                                      │
│  ┌───────▼──────────────────────┐  ┌──────────────────────┐    │
│  │    ExamEngine (Lockdown)     │→ │      Results         │    │
│  └──────────────────────────────┘  └──────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                 REST / JSON (Flask CORS)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                  PILLAR 2: OWNER DASHBOARD                      │
│                 (React 19, Vite, Port 5174)                     │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ Admin Login      │→ │  Command Center  │                    │
│  └──────────────────┘  └────────┬─────────┘                    │
│                                 │                               │
│  ┌───────────────┐  ┌───────────▼──────┐  ┌─────────────────┐  │
│  │ Exam Analytics│  │ Security Feed    │  │ Add New Question│  │
│  └───────────────┘  └──────────────────┘  └─────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                 REST / JSON (Flask CORS)
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    PILLAR 3: FLASK BACKEND                      │
│                  (Flask 3, PyJWT, Port 5000)                    │
│                                                                 │
│  POST /login          →  Admin + Student JWT auth               │
│  GET  /available_exams→  Exam catalogue                         │
│  GET  /start_exam     →  Shuffled MCQ questions                 │
│  POST /submit_exam    →  Grade + ML analysis + persist          │
│  POST /log_tab_switch →  Security violation logging             │
│  GET  /admin_results  →  Full candidate report (admin only)     │
│  POST /add_question   →  Inject new questions (admin only)      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      MySQL 8 Database                           │
│  users  ·  exams  ·  questions  ·  student_responses           │
│  tab_switch_logs  ·  performance_reports                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Features

### 1 · Physical Admin/Student Decoupling
The **Owner Dashboard** runs on an entirely separate application (`Port 5174`). The Student Frontend (`Port 5173`) contains **zero administrative code, components, or logic**. It is impossible for a student to inspect the React source and reverse-engineer admin interfaces because they literally do not exist in their bundle.

### 2 · Invigilator Terminal Unlock Protocol
The student portal **always boots in a locked state**. An invigilator must authenticate with their institutional credentials (`POST /login` with `role='admin'`) to unlock the terminal for candidates. The admin JWT is never stored in the student state.

### 3 · Zero-Tolerance Tab-Switch Auto-Submit
The platform enforces a **single-violation, instant-submit policy**. There are **no warnings**.

| Trigger | Detection Method | Response |
|---|---|---|
| Tab switch / window minimize | `document.visibilitychange` API | **Instant termination + auto-submit** |
| Alt+Tab / OS-level app switch | `window.blur` event | **Instant termination + auto-submit** |
| Windows / Cmd / Meta key | `keydown` metaKey detection | **Instant termination + auto-submit** |
| Fullscreen exit (Esc key) | `document.fullscreenchange` event | **Instant termination + auto-submit** |

All violations are logged asynchronously to the `tab_switch_logs` table.

### 4 · Out-of-Bounds Cursor Block
When an exam is active, the entire browser body becomes a dead zone:

```css
body.exam-active {
  cursor: not-allowed !important;
  pointer-events: none !important;
  user-select: none !important;
}

/* Only the exam container re-enables interactions */
body.exam-active .exam-inner-container {
  cursor: default !important;
  pointer-events: auto !important;
}
```

---

## Setup & Deployment

### Step 1 — Clone the Repository

```bash
git clone https://github.com/harmansaini29/CET-exam-portal-csmu.git
cd CET-exam-portal-csmu
```

### Step 2 — Configure Environment Variables

Create `Backend/.env` with your local MySQL credentials:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost/exam_portal
JWT_SECRET_KEY=replace-with-a-long-random-secret-minimum-32-chars
```

### Step 3 — Initialise the Database

```bash
mysql -u root -p < Backend/schema.sql
```

### Step 4 — Install Dependencies

**Backend:**
```bash
cd Backend
pip install -r requirements.txt
cd ..
```

**Student Frontend:**
```bash
cd Frontend
npm install
cd ..
```

**Owner Dashboard:**
```bash
cd Owner-dashboard/admin-dashboard
npm install
cd ../..
```

### Step 5 — Launch Tri-Pillar Architecture (One Command)

From the **project root**, run the unified launcher:

```bash
python run_project.py
```

This spawns all three servers simultaneously:

| Service | URL |
|---|---|
| Flask API | `http://localhost:5000` |
| Student Frontend | `http://localhost:5173` |
| Owner Dashboard | `http://localhost:5174` |

Press `Ctrl+C` to cleanly terminate all processes.

---

## Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin / Invigilator | `admin1` | `password123` |
| Student | Any name | Any roll number (auto-creates account) |

---

*Built for academic integrity. Engineered for institutional scale.*
