from fastapi import APIRouter
from data.mock_data import violations

router = APIRouter(prefix="/violations", tags=["violations"])

@router.get("/")
def get_all_violations():
    return violations

@router.get("/live")
def get_live_violations():
    # In real backend: filter violations for the currently live exam
    return violations

@router.get("/student/{student_id}")
def get_student_violations(student_id: str):
    return [v for v in violations if v["student_id"] == student_id]