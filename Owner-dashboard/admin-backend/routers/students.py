from fastapi import APIRouter, HTTPException
from data.mock_data import students

router = APIRouter(prefix="/students", tags=["students"])

@router.get("/")
def get_all_students():
    return students

@router.get("/live")
def get_live_students():
    # Students currently in the exam (not submitted yet)
    return [s for s in students if not s["submitted"]]

@router.get("/submitted")
def get_submitted_students():
    return [s for s in students if s["submitted"]]

@router.get("/high-risk")
def get_high_risk_students():
    # ML will update these scores — for now filter by risk_score >= 70
    return [s for s in students if s["risk_score"] >= 70]

@router.get("/{student_id}")
def get_student(student_id: str):
    student = next((s for s in students if s["id"] == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student