# backend/ml/analysis.py

def analyze_performance(answers, questions):
    total = len(questions)
    correct = 0

    topic_stats = {}

    for q in questions:
        qid = str(q["id"])
        topic = q["topic"]
        correct_ans = q["correct"]

        # initialize topic
        if topic not in topic_stats:
            topic_stats[topic] = {"correct": 0, "total": 0}

        topic_stats[topic]["total"] += 1

        # check answer
        if str(answers.get(qid)) == str(correct_ans):
            correct += 1
            topic_stats[topic]["correct"] += 1

    accuracy = round((correct / total) * 100, 2) if total else 0

    topic_wise_accuracy = {}
    weak_topics = []
    strong_topics = []

    for topic, stats in topic_stats.items():
        acc = round((stats["correct"] / stats["total"]) * 100, 2)
        topic_wise_accuracy[topic] = acc

        if acc < 50:
            weak_topics.append(topic)
        elif acc >= 70:
            strong_topics.append(topic)

    # suggestions
    suggestions = []

    for t in weak_topics:
        suggestions.append(f"Practice more questions from {t}")

    if not suggestions:
        suggestions.append("Great performance! Keep practicing.")

    return {
        "score": correct,
        "total": total,
        "accuracy": accuracy,
        "topic_wise_accuracy": topic_wise_accuracy,
        "weak_topics": weak_topics,
        "strong_topics": strong_topics,
        "suggestions": suggestions
    }



if __name__ == "__main__":
    answers = {"1": "A", "2": "C", "3": "B"}

    questions = [
        {"id": 1, "correct": "A", "topic": "Algebra"},
        {"id": 2, "correct": "B", "topic": "Logic"},
        {"id": 3, "correct": "B", "topic": "Algebra"},
    ]

    result = analyze_performance(answers, questions)
    print(result)