import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Exam, Question, StudentResponse, TabSwitchLog, PerformanceReport
import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from ml.analysis import analyze_performance
from dotenv import load_dotenv
import random

load_dotenv()

app = Flask(__name__)
# Enable CORS for the frontend Vite server
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'mysql+pymysql://root:password@localhost/exam_portal')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-for-jwt')

db.init_app(app)

# Decorator to enforce JWT authentication
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            # Expecting "Bearer <token>"
            token = token.split(" ")[1] if " " in token else token
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = db.session.get(User, data['user_id'])
            if not current_user:
                raise Exception("User not found")
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

@app.route('/login', methods=['POST'])
def login():
    """
    Handles both Admin and Student login.
    Admin uses 'id' and 'pass'.
    Student uses 'name' and 'roll'.
    """
    data = request.get_json()
    
    # 1. Admin Login
    if 'id' in data and 'pass' in data:
        user = User.query.filter_by(username=data['id'], role='admin').first()
        if user and user.check_password(data['pass']):
            token = jwt.encode({'user_id': user.id, 'exp': datetime.now(timezone.utc) + timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({'token': token, 'role': user.role, 'user_id': user.id})
        return jsonify({'message': 'Invalid Admin Credentials'}), 401
        
    # 2. Student Login
    elif 'name' in data and 'roll' in data:
        # Assuming roll number is used as password for students or we use a simplified verification for the dummy data.
        user = User.query.filter_by(username=data['name'], role='student').first()
        if not user:
            # Auto-create student for demo purposes if they don't exist
            user = User(username=data['name'], email=f"{data['name']}@student.edu", role='student')
            user.set_password(data['roll'])
            db.session.add(user)
            db.session.commit()
        else:
            # For strict login, you would uncomment this check:
            # if not user.check_password(data['roll']):
            #     return jsonify({'message': 'Invalid Student Credentials'}), 401
            pass

        token = jwt.encode({'user_id': user.id, 'exp': datetime.now(timezone.utc) + timedelta(hours=24)}, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token, 'role': user.role, 'user_id': user.id, 'name': user.username})
    
    return jsonify({'message': 'Invalid payload'}), 400

@app.route('/start_exam', methods=['GET'])
@token_required
def start_exam(current_user):
    """
    Fetches MCQ questions for the exam and formats them for the frontend.
    """
    exam_id = request.args.get('exam_id', 1) # Default to exam 1
    questions = Question.query.filter_by(exam_id=exam_id).all()
    
    # Shuffle and select subset (e.g. up to 10 questions for a unique exam)
    random.shuffle(questions)
    questions = questions[:10]
    
    q_list = []
    for q in questions:
        # Assuming options is stored as JSON list in DB
        options = q.options if isinstance(q.options, list) else json.loads(q.options) if q.options else []
        
        # Shuffle options to randomize the correct answer position
        if options:
            correct_ans_text = q.correct_answer
            random.shuffle(options)
            correct_idx = options.index(correct_ans_text) if correct_ans_text in options else 0
        else:
            correct_idx = 0
            
        q_list.append({
            'id': q.id,
            'question': q.question_text,
            'options': options,
            'correct': correct_idx,
            'topic': q.question_type # Using type as topic for demo
        })
    return jsonify(q_list)

@app.route('/available_exams', methods=['GET'])
@token_required
def available_exams(current_user):
    """
    Returns a list of all upcoming/available exams.
    """
    exams = Exam.query.all()
    exam_list = [{
        'id': e.id,
        'title': e.title,
        'description': e.description,
        'duration_minutes': e.duration_minutes
    } for e in exams]
    return jsonify(exam_list), 200

@app.route('/add_question', methods=['POST'])
@token_required
def add_question(current_user):
    """
    Allows admins and teachers to add new questions to exams.
    """
    if current_user.role not in ['admin', 'teacher']:
        return jsonify({'message': 'Unauthorized. Admin or Teacher access required.'}), 403

    try:
        data = request.get_json()
        exam_id = data.get('exam_id')
        question_text = data.get('question_text')
        options = data.get('options')
        correct_answer = data.get('correct_answer')
        marks = data.get('marks', 1)

        if not all([exam_id, question_text, options, correct_answer]):
            return jsonify({'message': 'Missing required fields'}), 400

        new_question = Question(
            exam_id=exam_id,
            question_text=question_text,
            options=json.dumps(options) if isinstance(options, list) else options,
            correct_answer=correct_answer,
            marks=int(marks)
        )
        db.session.add(new_question)
        db.session.commit()
        
        return jsonify({'message': 'Question added successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to add question", "details": str(e)}), 500

@app.route('/log_tab_switch', methods=['POST'])
@token_required
def log_tab_switch(current_user):
    """
    Records cheating attempts (tab switches/loss of focus) into the database.
    """
    data = request.get_json()
    exam_id = data.get('exam_id', 1)
    details = data.get('details', 'Switched tab or lost focus during exam')
    
    log = TabSwitchLog(exam_id=exam_id, student_id=current_user.id, details=details)
    db.session.add(log)
    db.session.commit()
    
    return jsonify({'message': 'Tab switch logged successfully', 'log_id': log.id}), 200

@app.route('/submit_exam', methods=['POST'])
@token_required
def submit_exam(current_user):
    """
    Submits student responses and performs ML performance analysis.
    """
    try:
        data = request.get_json()
        exam_id = data.get('exam_id', 1)
        answers = data.get('answers', [])
        
        # Get question bank for this exam
        questions = Question.query.filter_by(exam_id=exam_id).all()
        question_bank = []
        student_answers = {}
        
        # Format the questions for the ML module
        for q in questions:
            question_bank.append({
                'id': q.id,
                'topic': q.question_type,
                'correct_answer': q.correct_answer
            })
            
        # Parse answers. If it's a list from frontend, map index to text
        if isinstance(answers, list) and len(questions) == len(answers):
            for i, q in enumerate(questions):
                options = q.options if isinstance(q.options, list) else json.loads(q.options) if q.options else []
                if answers[i] is not None and 0 <= answers[i] < len(options):
                    student_answers[q.id] = options[answers[i]]
                else:
                    student_answers[q.id] = None
        elif isinstance(answers, dict):
            student_answers = answers
            
        # 1. Invoke analyze_performance from ml.analysis
        ml_report = analyze_performance(student_answers, question_bank)
        
        # 2. Save the raw answers and score into the student_responses MySQL table
        for q_id, ans_text in student_answers.items():
            if ans_text is not None:
                # Determine correctness
                is_correct = False
                for q in question_bank:
                    if q['id'] == q_id and str(q['correct_answer']).strip().lower() == str(ans_text).strip().lower():
                        is_correct = True
                        break
                        
                response_record = StudentResponse(
                    exam_id=exam_id,
                    question_id=q_id,
                    student_id=current_user.id,
                    submitted_answer=str(ans_text),
                    is_correct=is_correct
                )
                db.session.add(response_record)
                
        # 3. Save the ML report data into the performance_reports table
        report_record = PerformanceReport(
            exam_id=exam_id,
            student_id=current_user.id,
            total_score=ml_report.get('total_score', 0),
            overall_accuracy=ml_report.get('overall_accuracy', 0.0),
            weak_topics=ml_report.get('weak_topics', []),
            strong_topics=ml_report.get('strong_topics', []),
            suggestions=ml_report.get('suggestions', [])
        )
        db.session.add(report_record)
        
        db.session.commit()
        
        # 4. Return the complete ML report as a JSON response
        return jsonify(ml_report), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "Failed to process exam submission", "details": str(e)}), 500

@app.route('/admin_results', methods=['GET'])
@token_required
def admin_results(current_user):
    """
    Retrieves all student submissions including scores, tab switches, and weak topics.
    """
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized. Admin access required.'}), 403

    try:
        results = []
        reports = PerformanceReport.query.all()
        
        for report in reports:
            student = db.session.get(User, report.student_id)
            tab_switches = TabSwitchLog.query.filter_by(
                student_id=report.student_id, 
                exam_id=report.exam_id
            ).count()
            
            results.append({
                'id': report.id,
                'student_name': student.username if student else 'Unknown',
                'score': report.total_score,
                'accuracy': report.overall_accuracy,
                'tab_switches': tab_switches,
                'weak_topics': report.weak_topics if isinstance(report.weak_topics, list) else json.loads(report.weak_topics) if report.weak_topics else []
            })
            
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch admin results", "details": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        # Ensure tables are created (if they aren't already from schema.sql)
        pass
    app.run(debug=True, port=5000)
