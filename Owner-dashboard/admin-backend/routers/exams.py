from fastapi import APIRouter, HTTPException
from data.mock_data import exams
from schemas import CreateExamRequest
import uuid

router = APIRouter(prefix="/exams", tags=["exams"])

@router.get("/")
def get_all_exams():
    # Returns every exam in our list
    return exams

@router.get("/live")
def get_live_exam():
    # Find the exam that is currently happening
    live = [e for e in exams if e["status"] == "live"]
    if not live:
        raise HTTPException(status_code=404, detail="No live exam found")
    return live[0]

@router.get("/upcoming")
def get_upcoming_exams():
    return [e for e in exams if e["status"] == "upcoming"]

@router.get("/completed")
def get_completed_exams():
    return [e for e in exams if e["status"] == "completed"]

@router.get("/{exam_id}")
def get_exam_by_id(exam_id: str):
    exam = next((e for e in exams if e["id"] == exam_id), None)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    return exam

@router.post("/create")
def create_exam(data: CreateExamRequest):
    # Create a new exam and add it to our list
    new_exam = {
        "id": f"exam-{str(uuid.uuid4())[:6]}",
        "title": data.title,
        "subject": data.subject,
        "status": "upcoming",
        "enrolled": 0,
        "submitted": 0,
        "in_progress": 0,
        "not_started": 0,
        "duration": data.duration,
        "start_time": data.start_time,
        "type": data.exam_type,
        "total_marks": data.total_marks,
        "avg_score": None,
    }
    exams.append(new_exam)
    return {"message": "Exam created successfully", "exam": new_exam}