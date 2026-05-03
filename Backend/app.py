from flask import Flask, request, jsonify
from flask_cors import CORS
from ml.analysis import analyze_performance

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "Backend running"

@app.route("/submit_exam", methods=["POST"])
def submit_exam():
    data = request.json

    answers = data["answers"]

    # TEMP questions (later from DB)
    questions = [
    {"id": 1, "correct": "A", "topic": "General IT"},
    {"id": 2, "correct": "C", "topic": "Web Development"},
    {"id": 3, "correct": "D", "topic": "Geography"},
    {"id": 4, "correct": "B", "topic": "Science"},
    {"id": 5, "correct": "B", "topic": "Literature"},
    {"id": 6, "correct": "C", "topic": "Math"},
    {"id": 7, "correct": "B", "topic": "Science"},
    {"id": 8, "correct": "C", "topic": "History"},
    {"id": 9, "correct": "B", "topic": "Biology"},
    {"id": 10, "correct": "C", "topic": "Computer Science"},
    {"id": 11, "correct": "B", "topic": "General Knowledge"},
    {"id": 12, "correct": "B", "topic": "Science"},
    {"id": 13, "correct": "C", "topic": "Biology"},
    {"id": 14, "correct": "C", "topic": "Geography"},
    {"id": 15, "correct": "C", "topic": "Arts"},
    {"id": 16, "correct": "C", "topic": "Science"},
    {"id": 17, "correct": "B", "topic": "Biology"},
    {"id": 18, "correct": "B", "topic": "Geography"},
    {"id": 19, "correct": "D", "topic": "Tech"},
    {"id": 20, "correct": "C", "topic": "Math"},
    {"id": 21, "correct": "B", "topic": "Geography"},
    {"id": 22, "correct": "B", "topic": "Physics"},
    {"id": 23, "correct": "B", "topic": "Science"},
    {"id": 24, "correct": "B", "topic": "Physics"},
    {"id": 25, "correct": "B", "topic": "General Knowledge"},
]

    result = analyze_performance(answers, questions)

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)