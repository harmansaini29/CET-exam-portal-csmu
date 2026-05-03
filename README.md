# 🎓 Smart AI Exam Portal
### Enterprise-Grade Proctored Examination Platform

> A production-ready, AI-powered examination system built for institutions that demand the highest standard of academic integrity. Featuring **zero-tolerance fullscreen enforcement**, an **Invigilator Terminal Unlock Protocol**, and a real-time **ML Topic-Wise Performance Engine**.

---

## 🏛️ Architectural Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (Port 5173)                     │
│  React 18 + Vite 5 + Framer Motion + Lucide Icons            │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Invigilator │→│ Student Auth │→│ Exam Engine (Lock) │  │
│  │  Terminal   │  │  + Dashboard │  │ + Proctoring Layer │  │
│  └─────────────┘  └──────────────┘  └────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │ REST / JSON (CORS)
┌────────────────────────▼─────────────────────────────────────┐
│                      BACKEND (Port 5000)                     │
│  Flask 3 + Flask-SQLAlchemy + Flask-CORS + PyJWT             │
│  ┌───────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ JWT Auth  │  │  Exam Routes │  │   ML Analysis Engine │  │
│  │ /login    │  │ /start_exam  │  │  analyze_performance  │  │
│  │ /add_q    │  │ /submit_exam │  │  Topic Accuracy+Tags  │  │
│  └───────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │ SQLAlchemy ORM
┌────────────────────────▼─────────────────────────────────────┐
│                     MySQL Database                           │
│  users · exams · questions · student_responses               │
│  tab_switch_logs · performance_reports                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

### 1. Invigilator Terminal Unlock Protocol
The portal launches in a **locked state**. A teacher must first enter their admin credentials to unlock the terminal for a student session. The admin JWT is discarded immediately — it is **never stored** in state. The student then logs in independently, receiving their own session token.

### 2. Zero-Tolerance Auto-Submit Proctoring
Unlike traditional 3-strike systems, this platform enforces a **single-violation auto-submit policy**:

| Trigger | Response |
|---|---|
| Tab switch / window minimize | **Instant termination + auto-submit** |
| Browser loses focus (Alt+Tab, OS switch) | **Instant termination + auto-submit** |
| Meta / Windows / Cmd key pressed | **Instant termination + auto-submit** |
| Fullscreen exit (Esc key) | **Instant termination + auto-submit** |

All violations are logged asynchronously to the `tab_switch_logs` MySQL table with a timestamp and details string.

### 3. Fullscreen Enforcement
When a student clicks **Start Exam**, the browser's native `document.documentElement.requestFullscreen()` API is triggered. The `fullscreenchange` event listener monitors for any exit. Exiting fullscreen is treated as a security violation and triggers instant submission.

### 4. Cursor Block (CSS Layer)
The entire exam container has `user-select: none` and `pointer-events: none` applied globally via the `.exam-lockdown` CSS class. Only explicitly whitelisted elements — `.option-btn`, `.nav-btn`, `.palette-btn` — receive `pointer-events: auto`, making it impossible to click outside the exam container or highlight/copy question text.

---

## 🧠 AI Topic-Wise Performance Engine

After submission, answers are processed by `Backend/ml/analysis.py`:

1. **Accuracy Calculation** — Compares submitted answers against `correct_answer` in the question bank, grouped by `question_type` (topic).
2. **Classification**:
   - `accuracy >= 70%` → `strong_topics`
   - `accuracy < 50%` → `weak_topics`
3. **Suggestion Engine** — Generates dynamic text recommendations for each weak topic.
4. **Persistence** — Full report (score, accuracy, topics, suggestions) saved to `performance_reports` table.
5. **Frontend Display** — Results page shows a personalized greeting, animated score ring, topic badges, and AI suggestion list.

---

## 🚀 Setup & Deployment

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- MySQL 8.0+

### Step 1 — Database Setup

```bash
# Import the full schema and seed data
mysql -u root -p < Backend/schema.sql
```

### Step 2 — Configure Environment

Create `Backend/.env` with your local credentials:

```env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/exam_portal
JWT_SECRET_KEY=replace-this-with-a-long-random-secret-string
```

> The app gracefully falls back to defaults if `.env` is missing.

### Step 3 — Install Backend Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### Step 4 — Install Frontend Dependencies

```bash
cd Frontend
npm install
```

### Step 5 — Launch (One Command)

From the **project root**, run the unified launch script:

```bash
python run_project.py
```

This spawns both servers simultaneously:

| Service | URL |
|---|---|
| Flask API | `http://localhost:5000` |
| React Frontend | `http://localhost:5173` |

Press `Ctrl+C` to cleanly shut down both processes.

---

## 👤 Default Credentials

| Role | Username | Password |
|---|---|---|
| Admin / Invigilator | `admin1` | `password123` |
| Student | `johndoe` | *(any roll number — auto-creates account)* |

---

## 📁 Project Structure

```
smart-AI-exam-portal/
├── Backend/
│   ├── app.py              # Flask API — all routes
│   ├── models.py           # SQLAlchemy ORM models
│   ├── database.py         # DB connection helper
│   ├── schema.sql          # MySQL schema + seed data
│   ├── requirements.txt    # Python dependencies
│   ├── .env                # Secrets (git-ignored)
│   └── ml/
│       └── analysis.py     # AI Performance Engine
├── Frontend/
│   └── src/
│       ├── App.jsx         # Main React application
│       ├── index.css       # Design system + lockdown CSS
│       └── App.css
├── run_project.py          # One-click launcher
└── README.md
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + Vite 5 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Backend Framework | Flask 3 (Python) |
| ORM | Flask-SQLAlchemy |
| Authentication | PyJWT (HS256) |
| Database | MySQL 8 |
| ML Engine | Pure Python (ml/analysis.py) |
| Config Management | python-dotenv |

---

*Built for academic integrity. Engineered for scale.*
