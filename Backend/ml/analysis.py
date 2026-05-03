"""
Machine Learning & Analytics Module for Smart AI Exam Portal.

This module processes student responses to evaluate strengths, weaknesses, 
and provide actionable, dynamic feedback to improve their academic performance.
"""

def analyze_performance(student_answers, question_bank):
    """
    Analyzes student performance to calculate scores, topic-wise accuracy, and generate feedback.

    Args:
        student_answers (dict): A dictionary mapping question IDs to the student's submitted answer.
                                Example: { 1: "Central Processing Unit", 2: "False" }
        question_bank (list): A list of dictionaries representing the exam questions.
                              Expected keys in each dict: 'id', 'topic', 'correct_answer'
                              Example: [{'id': 1, 'topic': 'Computer Science', 'correct_answer': 'Central Processing Unit'}]

    Returns:
        dict: A comprehensive analysis dictionary containing:
            - total_score (int): Total number of correctly answered questions.
            - overall_accuracy (float): Overall accuracy percentage.
            - weak_topics (list): Topics where accuracy is < 50%.
            - strong_topics (list): Topics where accuracy is >= 70%.
            - suggestions (list): Dynamic textual feedback for weak topics.
    """
    # Initialize tracking variables for score and topic-level analytics
    total_score = 0
    topic_stats = {}  # Format: { 'TopicName': {'correct': 0, 'total': 0} }

    # Iterate over the question bank to evaluate answers
    for question in question_bank:
        q_id = question.get('id')
        topic = question.get('topic', 'General')
        correct_answer = question.get('correct_answer')
        
        # Initialize the topic in our tracking dictionary if it doesn't exist yet
        if topic not in topic_stats:
            topic_stats[topic] = {'correct': 0, 'total': 0}
        
        # Increment total questions for this specific topic
        topic_stats[topic]['total'] += 1

        # Check if the student answered this question
        # Note: Depending on front-end formatting, student_answers may use string or int keys. 
        # Using str() ensures safe dictionary lookup.
        student_answer = student_answers.get(q_id) or student_answers.get(str(q_id))

        if student_answer is not None:
            # Compare student's answer to the correct answer (case-insensitive check for robustness)
            if str(student_answer).strip().lower() == str(correct_answer).strip().lower():
                total_score += 1
                topic_stats[topic]['correct'] += 1

    # Calculate overall metrics
    total_questions = len(question_bank)
    overall_accuracy = (total_score / total_questions * 100) if total_questions > 0 else 0.0

    # Initialize classification arrays
    weak_topics = []
    strong_topics = []
    suggestions = []

    # Process accuracy per topic and apply classification rules
    for topic, stats in topic_stats.items():
        if stats['total'] > 0:
            topic_accuracy = (stats['correct'] / stats['total']) * 100
            
            # Classification Rule 1: Weak Topic (< 50% accuracy)
            if topic_accuracy < 50.0:
                weak_topics.append(topic)
                # Generate dynamic suggestion
                suggestions.append(
                    f"Your accuracy in '{topic}' is {topic_accuracy:.1f}%. "
                    f"We highly recommend reviewing the core concepts and practicing more questions in this area."
                )
                
            # Classification Rule 2: Strong Topic (>= 70% accuracy)
            elif topic_accuracy >= 70.0:
                strong_topics.append(topic)
                
            # Topics between 50% and 69.9% are considered average and are not added to either extreme list.

    # If there are no weak topics, provide a positive reinforcing suggestion
    if not weak_topics and total_questions > 0:
        suggestions.append("Great job! You have a solid grasp across all tested topics. Keep up the good work!")

    # Compile the final comprehensive dictionary to return
    analysis_results = {
        "total_score": total_score,
        "overall_accuracy": round(overall_accuracy, 2),
        "weak_topics": weak_topics,
        "strong_topics": strong_topics,
        "suggestions": suggestions
    }

    return analysis_results

# Example usage/test case (can be removed in production)
if __name__ == "__main__":
    sample_q_bank = [
        {'id': 1, 'topic': 'Math', 'correct_answer': '4'},
        {'id': 2, 'topic': 'Math', 'correct_answer': '8'},
        {'id': 3, 'topic': 'Science', 'correct_answer': 'H2O'},
        {'id': 4, 'topic': 'Science', 'correct_answer': 'Oxygen'},
        {'id': 5, 'topic': 'History', 'correct_answer': '1945'}
    ]
    sample_student_ans = {
        1: '4',        # Correct (Math)
        2: '9',        # Incorrect (Math) => Math accuracy: 50% (Average)
        3: 'H2O',      # Correct (Science)
        4: 'Oxygen',   # Correct (Science) => Science accuracy: 100% (Strong)
        5: '1914'      # Incorrect (History) => History accuracy: 0% (Weak)
    }
    
    result = analyze_performance(sample_student_ans, sample_q_bank)
    import json
    print(json.dumps(result, indent=4))
