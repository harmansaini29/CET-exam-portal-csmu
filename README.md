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

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND  (Port 5173)                       │
│  React 19 · Vite 8 · Framer Motion · Lucide Icons              │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │ InvigilatorLogin │→ │  StudentLogin    │                    │
│  └──────────────────┘  └────────┬─────────┘                    │
│                                 │                               │
│  ┌───────────────┐  ┌───────────▼──────┐  ┌─────────────────┐  │
│  │ Instructions  │←─│ StudentDashboard │  │  AdminDashboard │  │
│  └───────┬───────┘  └──────────────────┘  └─────────────────┘  │
│          │                                                      │
│  ┌───────▼──────────────────────┐  ┌──────────────────────┐    │
│  │    ExamEngine (Lockdown)     │→ │      Results         │    │
│  │  · Fullscreen enforcement   │  │  · SVG score ring    │    │
│  │  · Out-of-bounds cursor lock│  │  · AI suggestions    │    │
│  │  · Tab-switch termination   │  │  · Tailored message  │    │
│  └──────────────────────────────┘  └──────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────┘
                           │  REST / JSON  (Flask-CORS)
┌──────────────────────────▼──────────────────────────────────────┐
│                     BACKEND  (Port 5000)                        │
│  Flask 3 · Flask-SQLAlchemy · Flask-CORS · PyJWT               │
│                                                                 │
│  POST /login          →  Admin + Student JWT auth               │
│  GET  /available_exams→  Exam catalogue                         │
│  GET  /start_exam     →  Shuffled MCQ questions                 │
│  POST /submit_exam    →  Grade + ML analysis + persist          │
│  POST /log_tab_switch →  Security violation logging             │
│  GET  /admin_results  →  Full candidate report (admin only)     │
└──────────────────────────┬──────────────────────────────────────┘
                           │  SQLAlchemy ORM
┌──────────────────────────▼──────────────────────────────────────┐
│                      MySQL 8 Database                           │
│  users  ·  exams  ·  questions  ·  student_responses           │
│  tab_switch_logs  ·  performance_reports                        │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│               ML Engine  — Backend/ml/analysis.py               │
│  analyze_performance(student_answers, question_bank)            │
│  Returns: total_score · overall_accuracy · strong/weak topics   │
│           personalized suggestions                              │
│                                                                 │
│  ► TEAMMATE DROP-IN: Replace analyze_performance() to swap      │
│    in any external model. No frontend changes required.         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Features

### 1 · Invigilator Terminal Unlock Protocol

The portal **always boots in a locked state**. Before any candidate can log in, an invigilator (admin/teacher) must authenticate with their institutional credentials. The flow is:

1. Invigilator enters ID + password → `POST /login` validates against `role='admin'` in MySQL.
2. On success, the JWT is used **only** to confirm identity and is **immediately discarded** — it is never stored in React state.
3. The terminal unlocks and the UI transitions to the candidate login screen.
4. The student authenticates independently and receives their own scoped JWT.

This ensures that no admin-privileged token is ever accessible to a candidate during the session.

---

### 2 · Zero-Tolerance Tab-Switch Auto-Submit

Unlike traditional 3-strike warning systems, this platform enforces a **single-violation, instant-submit policy**. There are **no warnings**.

| Trigger | Detection Method | Response |
|---|---|---|
| Tab switch / window minimize | `document.visibilitychange` API | **Instant termination + auto-submit** |
| Alt+Tab / OS-level app switch | `window.blur` event | **Instant termination + auto-submit** |
| Windows / Cmd / Meta key | `keydown` metaKey detection | **Instant termination + auto-submit** |
| Fullscreen exit (Esc key) | `document.fullscreenchange` event | **Instant termination + auto-submit** |

All violations are logged asynchronously to the `tab_switch_logs` MySQL table with a UTC timestamp, student ID, exam ID, and a descriptive reason string. The invigilator dashboard surfaces this as a **Security Flags** count per candidate.

---

### 3 · Fullscreen Enforcement

When the candidate clicks **Start Exam**, the browser enters mandatory fullscreen via:

```js
await document.documentElement.requestFullscreen();
```

The `fullscreenchange` listener monitors for any exit. Exiting fullscreen for any reason is treated as a zero-tolerance security violation.

---

### 4 · Out-of-Bounds Cursor Block

When an exam is active, the entire browser body becomes a dead zone:

```css
/* Applied via body.exam-active (toggled by React on exam start/end) */
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

Within the exam container, only explicitly whitelisted elements (`.option-btn`, `.nav-btn`, `.palette-btn`) receive `pointer-events: auto`. The candidate physically cannot right-click, highlight text, or interact with anything outside the question area.

---

## AI Topic-Wise Performance Engine

After submission, answers are processed by `Backend/ml/analysis.py`:

1. **Accuracy Calculation** — Correct answers are graded per `question_type` (topic).
2. **Classification** — `≥ 70%` → `strong_topics` · `< 50%` → `weak_topics`.
3. **Suggestion Engine** — Generates personalised study recommendations per weak topic.
4. **Persistence** — Full report saved to `performance_reports` table.
5. **Results Display** — Animated SVG score ring, topic badges, AI suggestions, and a **tailored closing message** based on overall accuracy tier:
   - `≥ 90%` → *"Exceptional performance…"*
   - `≥ 75%` → *"Great work…"*
   - `≥ 55%` → *"Solid effort…"*
   - `< 55%` → *"Keep going…"*

---

## Setup & Deployment

### Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.10 + |
| Node.js + npm | 18 + |
| MySQL Server | 8.0 + |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/harmansaini29/CET-exam-portal-csmu.git
cd CET-exam-portal-csmu
```

---

### Step 2 — Configure Environment Variables

Create `Backend/.env` with your local MySQL credentials:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_MYSQL_PASSWORD@localhost/exam_portal
JWT_SECRET_KEY=replace-with-a-long-random-secret-minimum-32-chars
```

> The application falls back to `root:password` and a default JWT secret if `.env` is missing, but **always set this for any real deployment**.

---

### Step 3 — Initialise the Database

Import the full schema and seed data into MySQL:

```bash
mysql -u root -p < Backend/schema.sql
```

This creates the `exam_portal` database, all six tables, and seeds an admin user (`admin1` / `password123`) plus sample exam questions.

---

### Step 4 — Install Backend Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

Key packages: `Flask`, `Flask-SQLAlchemy`, `Flask-CORS`, `PyMySQL`, `PyJWT`, `python-dotenv`.

---

### Step 5 — Install Frontend Dependencies

```bash
cd Frontend
npm install
```

---

### Step 6 — Launch (One Command)

From the **project root**, run the unified launcher:

```bash
python run_project.py
```

This spawns both servers simultaneously:

| Service | URL |
|---|---|
| Flask API | `http://localhost:5000` |
| React Frontend | `http://localhost:5173` |

Press `Ctrl+C` to cleanly terminate both processes.

---

## Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin / Invigilator | `admin1` | `password123` |
| Student | Any name | Any roll number (auto-creates account) |

---

## Project Structure

```
CET-exam-portal-csmu/
├── Backend/
│   ├── app.py              # Flask API — all routes & JWT auth
│   ├── models.py           # SQLAlchemy ORM models (6 tables)
│   ├── schema.sql          # MySQL DDL schema + seed data
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Secrets (git-ignored)
│   └── ml/
│       └── analysis.py     # ← ML TEAMMATE DROP-IN POINT
├── Frontend/
│   └── src/
│       ├── App.jsx                      # State orchestrator + proctoring hooks
│       ├── index.css                    # Design system + lockdown CSS
│       └── components/
│           ├── InvigilatorLogin.jsx     # Stage 1: Invigilator terminal
│           ├── StudentLogin.jsx         # Stage 2: Candidate verification
│           ├── Instructions.jsx         # Stage 3: Personalised guidelines
│           ├── StudentDashboard.jsx     # Stage 4: Exam selection
│           ├── ExamEngine.jsx           # Stage 5: Lockdown exam interface
│           ├── Results.jsx              # Stage 6: AI performance report
│           └── AdminDashboard.jsx       # Admin control panel (decoupled)
├── run_project.py          # One-click unified launcher
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + Vite 8 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Backend Framework | Flask 3 (Python) |
| ORM | Flask-SQLAlchemy |
| Authentication | PyJWT (HS256) |
| Database | MySQL 8 |
| ML Engine | Pure Python — `Backend/ml/analysis.py` |
| Config Management | python-dotenv |
| Cross-Origin | Flask-CORS |

---

*Built for academic integrity. Engineered for institutional scale.*
