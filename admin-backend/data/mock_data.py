from datetime import datetime

exams = [
    {
        "id": "exam-001",
        "title": "Physics — Unit 4 Test",
        "subject": "Physics",
        "status": "live",
        "enrolled": 60,
        "submitted": 34,
        "in_progress": 18,
        "not_started": 8,
        "duration": 90,
        "start_time": "2026-05-03T14:00:00",
        "type": "MCQ + Short Answer",
        "total_marks": 100,
        "avg_score": None,
    },
    {
        "id": "exam-002",
        "title": "Mathematics — Algebra Mid-Term",
        "subject": "Mathematics",
        "status": "upcoming",
        "enrolled": 45,
        "submitted": 0,
        "in_progress": 0,
        "not_started": 45,
        "duration": 60,
        "start_time": "2026-05-05T10:00:00",
        "type": "MCQ",
        "total_marks": 100,
        "avg_score": None,
    },
    {
        "id": "exam-003",
        "title": "Computer Science — DSA",
        "subject": "Computer Science",
        "status": "upcoming",
        "enrolled": 32,
        "submitted": 0,
        "in_progress": 0,
        "not_started": 32,
        "duration": 120,
        "start_time": "2026-05-08T15:00:00",
        "type": "Descriptive",
        "total_marks": 100,
        "avg_score": None,
    },
    {
        "id": "exam-004",
        "title": "Chemistry — Chemical Bonds",
        "subject": "Chemistry",
        "status": "completed",
        "enrolled": 55,
        "submitted": 55,
        "in_progress": 0,
        "not_started": 0,
        "duration": 45,
        "start_time": "2026-04-28T10:00:00",
        "type": "MCQ",
        "total_marks": 100,
        "avg_score": 71,
    },
    {
        "id": "exam-005",
        "title": "English — Comprehension Test",
        "subject": "English",
        "status": "completed",
        "enrolled": 48,
        "submitted": 48,
        "in_progress": 0,
        "not_started": 0,
        "duration": 60,
        "start_time": "2026-04-22T11:00:00",
        "type": "Descriptive",
        "total_marks": 100,
        "avg_score": 82,
    },
]

students = [
    {"id": "s001", "name": "Priya Mehta",  "initials": "PM", "batch": "Batch A", "risk_score": 12, "progress": 100, "submitted": True,  "score": 96, "time_taken": 38, "tab_switches": 0, "idle_time": 2},
    {"id": "s002", "name": "Karan Shah",   "initials": "KS", "batch": "Batch A", "risk_score": 18, "progress": 100, "submitted": True,  "score": 91, "time_taken": 42, "tab_switches": 1, "idle_time": 3},
    {"id": "s007", "name": "Nisha Verma",  "initials": "NV", "batch": "Batch D", "risk_score": 8,  "progress": 100, "submitted": True,  "score": 94, "time_taken": 35, "tab_switches": 0, "idle_time": 1},
    {"id": "s008", "name": "Dev Sharma",   "initials": "DS", "batch": "Batch A", "risk_score": 22, "progress": 100, "submitted": True,  "score": 88, "time_taken": 44, "tab_switches": 1, "idle_time": 5},
    {"id": "s003", "name": "Aisha Khan",   "initials": "AK", "batch": "Batch C", "risk_score": 38, "progress": 45,  "submitted": False, "score": None, "time_taken": None, "tab_switches": 2, "idle_time": 8},
    {"id": "s004", "name": "Sneha Rao",    "initials": "SR", "batch": "Batch C", "risk_score": 45, "progress": 72,  "submitted": False, "score": None, "time_taken": None, "tab_switches": 2, "idle_time": 12},
    {"id": "s005", "name": "Riya Patel",   "initials": "RP", "batch": "Batch B", "risk_score": 82, "progress": 65,  "submitted": False, "score": None, "time_taken": None, "tab_switches": 5, "idle_time": 18},
    {"id": "s006", "name": "Aman Desai",   "initials": "AD", "batch": "Batch B", "risk_score": 74, "progress": 58,  "submitted": False, "score": None, "time_taken": None, "tab_switches": 4, "idle_time": 15},
]

violations = [
    {"id": "v1", "student_name": "Riya Patel",  "student_id": "s005", "type": "Tab switch",      "count": 3, "exam_title": "Physics — Unit 4", "time": "2 min ago",  "severity": "high"},
    {"id": "v2", "student_name": "Aman Desai",  "student_id": "s006", "type": "Fullscreen exit", "count": 1, "exam_title": "Physics — Unit 4", "time": "5 min ago",  "severity": "medium"},
    {"id": "v3", "student_name": "Sneha Rao",   "student_id": "s004", "type": "Copy attempt",    "count": 1, "exam_title": "Physics — Unit 4", "time": "11 min ago", "severity": "medium"},
    {"id": "v4", "student_name": "Dev Sharma",  "student_id": "s008", "type": "Tab switch",      "count": 1, "exam_title": "Physics — Unit 4", "time": "18 min ago", "severity": "low"},
    {"id": "v5", "student_name": "Aisha Khan",  "student_id": "s003", "type": "Tab switch",      "count": 2, "exam_title": "Physics — Unit 4", "time": "24 min ago", "severity": "medium"},
]

submission_timeline = [
    {"time": "2:00", "submissions": 0,  "active": 0},
    {"time": "2:10", "submissions": 5,  "active": 52},
    {"time": "2:20", "submissions": 11, "active": 49},
    {"time": "2:30", "submissions": 17, "active": 43},
    {"time": "2:40", "submissions": 24, "active": 36},
    {"time": "2:50", "submissions": 29, "active": 28},
    {"time": "Now",  "submissions": 34, "active": 18},
]

question_difficulty = [
    {"q": "Q1",  "correct": 91, "tag": "Easy"},
    {"q": "Q2",  "correct": 78, "tag": "Medium"},
    {"q": "Q3",  "correct": 83, "tag": "Medium"},
    {"q": "Q4",  "correct": 54, "tag": "Medium"},
    {"q": "Q5",  "correct": 67, "tag": "Medium"},
    {"q": "Q6",  "correct": 71, "tag": "Medium"},
    {"q": "Q7",  "correct": 28, "tag": "Hard"},
    {"q": "Q8",  "correct": 49, "tag": "Medium"},
    {"q": "Q9",  "correct": 85, "tag": "Easy"},
    {"q": "Q10", "correct": 32, "tag": "Hard"},
]

score_distribution = [
    {"range": "0–20",   "count": 3},
    {"range": "20–40",  "count": 6},
    {"range": "40–60",  "count": 11},
    {"range": "60–80",  "count": 10},
    {"range": "80–100", "count": 4},
]



##uvicorn main:app --reload --port 8000