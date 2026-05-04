import os
import json
import jwt
import datetime
from functools import wraps
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from models import db, User, Exam, Question, StudentResponse, TabSwitchLog, PerformanceReport
from ml.analysis import analyze_performance

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Enable CORS for explicit origins (Student Frontend: 5173, Owner Dashboard: 5174)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"]}})

# Database and JWT configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:password@localhost/exam_portal')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default_super_secret')

db.init_app(app)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Handle OPTIONS preflight within token validation if it slips through
        if request.method == "OPTIONS":
            return '', 200
            
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            token = auth_header.split(" ")[1]
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                raise Exception("User not found")
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@app.route("/")
def home():
    return "Backend running"

@app.route("/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return '', 200
        
    data = request.json
    
    # 1. Invigilator/Admin Login
    if 'id' in data and 'pass' in data:
        user = User.query.filter_by(username=data['id'], role='admin').first()
        if user and user.check_password(data['pass']):
            token = jwt.encode({
                'user_id': user.id, 
                'role': user.role, 
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=4)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            return jsonify({'token': token, 'role': user.role})
        return jsonify({'message': 'Invalid admin credentials'}), 401
        
    # 2. Student Login
    if 'name' in data and 'roll' in data:
        # Create student if not exists based on roll (username)
        user = User.query.filter_by(username=data['roll'], role='student').first()
        if not user:
            user = User(username=data['roll'], email=f"{data['roll']}@student.edu", role='student')
            user.set_password('default123')
            db.session.add(user)
            db.session.commit()
            
        token = jwt.encode({
            'user_id': user.id, 
            'role': user.role, 
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=4)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({
            'token': token, 
            'role': user.role, 
            'name': data['name'], 
            'roll': data['roll']
        })
        
    return jsonify({'message': 'Invalid request format'}), 400

@app.route("/available_exams", methods=["GET", "OPTIONS"])
@token_required
def get_available_exams(current_user):
    exams = Exam.query.all()
    results = []
    for e in exams:
        results.append({
            'id': e.id,
            'title': e.title,
            'description': e.description,
            'duration_minutes': e.duration_minutes
        })
    return jsonify(results)

@app.route("/start_exam", methods=["GET", "OPTIONS"])
@token_required
def start_exam(current_user):
    exam_id = request.args.get('exam_id')
    questions = Question.query.filter_by(exam_id=exam_id).all()
    
    q_data = []
    for q in questions:
        # Parse options if it's stored as JSON string
        opts = q.options
        if isinstance(opts, str):
            try:
                opts = json.loads(opts)
            except:
                opts = []
                
        q_data.append({
            'id': q.id,
            'question': q.question_text,
            'options': opts,
            'topic': q.question_type
        })
        
    # Dummy fallback to prevent frontend crashes if DB is empty
    if not q_data:
        q_data = [
            {"id": 1, "question": "What does AI stand for?", "options": ["Artificial Intelligence", "Automated Information", "Advanced Integration", "App Intelligence"], "topic": "General IT"},
            {"id": 2, "question": "Which language is primarily used for Web Development?", "options": ["Python", "Java", "JavaScript", "C++"], "topic": "Web Development"},
        ]
        
    return jsonify(q_data)

@app.route("/submit_exam", methods=["POST", "OPTIONS"])
@token_required
def submit_exam(current_user):
    data = request.json
    exam_id = data.get('exam_id', 1)
    # answers is an array of selected option indices (e.g., [0, 2, 1, ...])
    answers = data.get('answers', []) 
    
    # Get questions
    questions = Question.query.filter_by(exam_id=exam_id).all()
    
    q_list = []
    for q in questions:
        opts = q.options
        if isinstance(opts, str):
            try: opts = json.loads(opts)
            except: opts = []
            
        # find index of correct_answer in options
        correct_idx = -1
        if q.correct_answer in opts:
            correct_idx = opts.index(q.correct_answer)
            
        q_list.append({
            "id": str(q.id),
            "correct": str(correct_idx),
            "topic": q.question_type
        })
        
    # Mapping logic for dummy data if DB questions are empty
    if not q_list:
        q_list = [
            {"id": "1", "correct": "0", "topic": "General IT"},
            {"id": "2", "correct": "2", "topic": "Web Development"},
        ]
        
    # Map frontend answers (array of indices) to ml/analysis format (dict of "id": "idx")
    formatted_answers = {}
    for i, ans_idx in enumerate(answers):
        if i < len(q_list) and ans_idx is not None:
            formatted_answers[str(q_list[i]["id"])] = str(ans_idx)
            
    # Mock ML analysis call
    result = analyze_performance(formatted_answers, q_list)
    
    # Save performance to DB
    pr = PerformanceReport(
        exam_id=exam_id, 
        student_id=current_user.id,
        total_score=result.get('score', 0),
        overall_accuracy=result.get('accuracy', 0.0),
        weak_topics=result.get('weak_topics', []),
        strong_topics=result.get('strong_topics', []),
        suggestions=result.get('suggestions', [])
    )
    db.session.add(pr)
    db.session.commit()
    
    # Map back to frontend expected keys
    frontend_result = {
        'total_score': result.get('score', 0),
        'overall_accuracy': result.get('accuracy', 0.0),
        'weak_topics': result.get('weak_topics', []),
        'strong_topics': result.get('strong_topics', []),
        'suggestions': result.get('suggestions', [])
    }
    
    return jsonify(frontend_result)

@app.route("/log_tab_switch", methods=["POST", "OPTIONS"])
@token_required
def log_tab_switch(current_user):
    data = request.json
    exam_id = data.get('exam_id', 1)
    details = data.get('details', 'Tab switch / focus loss detected')
    
    log = TabSwitchLog(exam_id=exam_id, student_id=current_user.id, details=details)
    db.session.add(log)
    db.session.commit()
    return jsonify({'status': 'success'})

@app.route("/add_question", methods=["POST", "OPTIONS"])
@token_required
def add_question(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.json
    exam_id = data.get('exam_id')
    question_text = data.get('question_text')
    question_type = data.get('question_type', 'multiple_choice')
    options = data.get('options', [])
    correct_answer = data.get('correct_answer')
    marks = data.get('marks', 1)
    
    if not all([exam_id, question_text, options, correct_answer]):
        return jsonify({'message': 'Missing required fields'}), 400
        
    # Convert options list to JSON string for storage
    opts_json = json.dumps(options)
    
    new_q = Question(
        exam_id=exam_id,
        question_text=question_text,
        question_type=question_type,
        options=opts_json,
        correct_answer=correct_answer,
        marks=marks
    )
    
    db.session.add(new_q)
    db.session.commit()
    
    return jsonify({'status': 'success', 'message': 'Question added successfully', 'question_id': new_q.id})

@app.route("/admin_results", methods=["GET", "OPTIONS"])
@token_required
def admin_results(current_user):
    if current_user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    students = User.query.filter_by(role='student').all()
    results = []
    
    total_enrolled = len(students)
    total_submitted = 0
    total_violations = 0
    total_high_risk = 0
    
    for s in students:
        pr = PerformanceReport.query.filter_by(student_id=s.id).order_by(PerformanceReport.created_at.desc()).first()
        flags_count = TabSwitchLog.query.filter_by(student_id=s.id).count()
        total_violations += flags_count
        
        if pr:
            total_submitted += 1
            if pr.overall_accuracy < 50 or flags_count > 0:
                total_high_risk += 1
                
            results.append({
                'id': s.id,
                'name': s.username,
                'accuracy': pr.overall_accuracy,
                'flags': flags_count,
                'status': 'Terminated' if flags_count > 0 else 'Completed',
                'time_taken': 15,
                'initials': s.username[:2].upper()
            })
            
    stats = {
        'enrolled': total_enrolled,
        'submitted': total_submitted,
        'violations': total_violations,
        'high_risk': total_high_risk
    }
            
    return jsonify({'results': results, 'stats': stats})

if __name__ == "__main__":
    app.run(debug=True)