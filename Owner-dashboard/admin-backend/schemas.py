from pydantic import BaseModel
from typing import Optional, List

class Exam(BaseModel):
    id: str
    title: str
    subject: str
    status: str
    enrolled: int
    submitted: int
    in_progress: int
    not_started: int
    duration: int
    start_time: str
    type: str
    total_marks: int
    avg_score: Optional[float] = None

class Student(BaseModel):
    id: str
    name: str
    initials: str
    batch: str
    risk_score: int
    progress: int
    submitted: bool
    score: Optional[int] = None
    time_taken: Optional[int] = None
    tab_switches: int
    idle_time: int

class Violation(BaseModel):
    id: str
    student_name: str
    student_id: str
    type: str
    count: int
    exam_title: str
    time: str
    severity: str

class CreateExamRequest(BaseModel):
    title: str
    subject: str
    duration: int
    start_time: str
    exam_type: str
    instructions: Optional[str] = ""
    total_marks: int = 100