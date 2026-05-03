from fastapi import APIRouter
from data.mock_data import (
    students, submission_timeline,
    question_difficulty, score_distribution, exams
)

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/live")
def get_live_analytics():
    # This is what the React dashboard polls every 5 seconds
    live_exam = next((e for e in exams if e["status"] == "live"), None)

    submitted   = len([s for s in students if s["submitted"]])
    in_progress = len([s for s in students if not s["submitted"] and s["progress"] > 0])
    not_started = len([s for s in students if s["progress"] == 0])
    high_risk   = len([s for s in students if s["risk_score"] >= 70])
    violations  = sum(s["tab_switches"] for s in students)

    return {
        "live_stats": {
            "submitted":   submitted,
            "in_progress": in_progress,
            "not_started": not_started,
            "violations":  violations,
            "high_risk":   high_risk,
            "enrolled":    live_exam["enrolled"] if live_exam else 0,
        },
        "submission_timeline":  submission_timeline,
        "score_distribution":   score_distribution,
        "question_difficulty":  question_difficulty,
    }

@router.get("/exam/{exam_id}")
def get_exam_analytics(exam_id: str):
    # Post-exam analytics for results page
    submitted_students = [s for s in students if s["submitted"]]
    scores = [s["score"] for s in submitted_students if s["score"] is not None]

    return {
        "exam_id":              exam_id,
        "leaderboard":          sorted(submitted_students, key=lambda x: x["score"] or 0, reverse=True),
        "score_distribution":   score_distribution,
        "question_difficulty":  question_difficulty,
        "avg_score":            round(sum(scores) / len(scores), 1) if scores else 0,
        "highest_score":        max(scores) if scores else 0,
        "lowest_score":         min(scores) if scores else 0,
    }