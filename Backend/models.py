from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student') # Options: 'admin', 'teacher', 'student'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    exams_created = db.relationship('Exam', backref='creator', lazy=True)
    responses = db.relationship('StudentResponse', backref='student', lazy=True)
    tab_logs = db.relationship('TabSwitchLog', backref='student', lazy=True)

    def set_password(self, password):
        """Securely hash and store the user's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """Verify the given password against the stored hash."""
        return check_password_hash(self.password_hash, password)


class Exam(db.Model):
    __tablename__ = 'exams'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    questions = db.relationship('Question', backref='exam', lazy=True, cascade="all, delete-orphan")
    responses = db.relationship('StudentResponse', backref='exam', lazy=True, cascade="all, delete-orphan")
    tab_logs = db.relationship('TabSwitchLog', backref='exam', lazy=True, cascade="all, delete-orphan")


class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), nullable=False, default='multiple_choice') # 'multiple_choice', 'true_false', 'short_answer'
    options = db.Column(db.JSON, nullable=True) # e.g., ["A", "B", "C", "D"]
    correct_answer = db.Column(db.String(255), nullable=False)
    marks = db.Column(db.Integer, default=1)

    # Relationships
    responses = db.relationship('StudentResponse', backref='question', lazy=True, cascade="all, delete-orphan")


class StudentResponse(db.Model):
    __tablename__ = 'student_responses'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    submitted_answer = db.Column(db.String(255), nullable=True)
    is_correct = db.Column(db.Boolean, default=False)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)


class TabSwitchLog(db.Model):
    __tablename__ = 'tab_switch_logs'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    switch_time = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.String(255), nullable=True) # e.g., 'Switched to new tab'


class PerformanceReport(db.Model):
    __tablename__ = 'performance_reports'
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total_score = db.Column(db.Integer, nullable=False)
    overall_accuracy = db.Column(db.Float, nullable=False)
    weak_topics = db.Column(db.JSON, nullable=True)
    strong_topics = db.Column(db.JSON, nullable=True)
    suggestions = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
