from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)  # 启用 CORS 支持

# Data file path
QUIZ_DATA_FILE = 'data/quiz_data.json'
USER_PROGRESS_FILE = 'data/user_progress.json'
LEARNING_MATERIALS_FILE = 'data/learning_materials.json'

os.makedirs('data', exist_ok=True)

# Initialize data files
def init_data_files():
    if not os.path.exists(QUIZ_DATA_FILE):
        with open(QUIZ_DATA_FILE, 'w') as f:
            json.dump({
                "quizzes": [
                    {
                        "id": 1,
                        "title": "Point Progression",
                        "question": "The score is 30-30. Player A wins the point. What's the new score?",
                        "options": ["40-30", "Deuce", "30-40"],
                        "correct_answer": 0
                    },
                    {
                        "id": 2,
                        "title": "Deuce Scenario",
                        "question": "What happens when the score is 40-40?",
                        "options": ["Game Over", "Deuce", "Advantage"],
                        "correct_answer": 1
                    },
                    {
                        "id": 3,
                        "title": "Point Progression",
                        "question": "What is the first point in tennis called?",
                        "options": ["15", "Love", "30"],
                        "correct_answer": 1
                    }
                ]
            }, f)
    
    if not os.path.exists(USER_PROGRESS_FILE):
        with open(USER_PROGRESS_FILE, 'w') as f:
            json.dump({}, f)
    
    if not os.path.exists(LEARNING_MATERIALS_FILE):
        with open(LEARNING_MATERIALS_FILE, 'w') as f:
            json.dump({
                "materials": [
                    {
                        "id": 1,
                        "title": "The Big Picture",
                        "content": "Understand how points stack up into games, games into sets, and sets into matches.",
                        "order": 1
                    },
                    {
                        "id": 2,
                        "title": "Point Progression",
                        "content": "Learn the sequence of points in tennis: Love, 15, 30, 40, Game.",
                        "order": 2
                    },
                    {
                        "id": 3,
                        "title": "Deuce & Advantage",
                        "content": "Understand what happens when the score reaches 40-40.",
                        "order": 3
                    }
                ]
            }, f)

# Load data
def load_data(filename):
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

# Data preservation
def save_data(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)

# Initialize data files
init_data_files()

@app.route('/')
def home():
    """Home page, display learning materials and quiz overview"""
    learning_data = load_data(LEARNING_MATERIALS_FILE)
    quiz_data = load_data(QUIZ_DATA_FILE)
    return jsonify({
        "learning_materials": learning_data.get("materials", []),
        "quizzes": quiz_data.get("quizzes", [])
    })

@app.route('/api/quiz/<int:quiz_id>')
def get_quiz(quiz_id):
    """Get detailed information about a specific quiz"""
    quiz_data = load_data(QUIZ_DATA_FILE)
    quiz = next((q for q in quiz_data.get("quizzes", []) if q["id"] == quiz_id), None)
    if quiz:
        return jsonify(quiz)
    return jsonify({"error": "Quiz not found"}), 404

@app.route('/api/learning/<int:material_id>')
def get_learning_material(material_id):
    """Get detailed information about a specific learning material"""
    learning_data = load_data(LEARNING_MATERIALS_FILE)
    material = next((m for m in learning_data.get("materials", []) if m["id"] == material_id), None)
    if material:
        return jsonify(material)
    return jsonify({"error": "Learning material not found"}), 404

@app.route('/api/progress', methods=['GET', 'POST'])
def handle_progress():
    """Manage user learning progress"""
    if request.method == 'POST':
        data = request.json
        user_id = data.get('user_id')
        material_id = data.get('material_id')
        status = data.get('status')
        
        if not all([user_id, material_id, status]):
            return jsonify({"error": "Missing required fields"}), 400
            
        progress_data = load_data(USER_PROGRESS_FILE)
        if user_id not in progress_data:
            progress_data[user_id] = {"completed_materials": [], "quiz_scores": {}}
            
        if status == "completed" and material_id not in progress_data[user_id]["completed_materials"]:
            progress_data[user_id]["completed_materials"].append(material_id)
        
        save_data(USER_PROGRESS_FILE, progress_data)
        return jsonify({"message": "Progress updated successfully"})
        
    else:  # GET
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
            
        progress_data = load_data(USER_PROGRESS_FILE)
        return jsonify(progress_data.get(user_id, {"completed_materials": [], "quiz_scores": {}}))

@app.route('/api/quiz-results', methods=['GET', 'POST'])
def handle_quiz_results():
    """Manage quiz results"""
    if request.method == 'POST':
        data = request.json
        user_id = data.get('user_id')
        quiz_id = data.get('quiz_id')
        score = data.get('score')
        
        if not all([user_id, quiz_id, score]):
            return jsonify({"error": "Missing required fields"}), 400
            
        progress_data = load_data(USER_PROGRESS_FILE)
        if user_id not in progress_data:
            progress_data[user_id] = {"completed_materials": [], "quiz_scores": {}}
            
        progress_data[user_id]["quiz_scores"][str(quiz_id)] = {
            "score": score,
            "timestamp": datetime.now().isoformat()
        }
        
        save_data(USER_PROGRESS_FILE, progress_data)
        return jsonify({"message": "Quiz results saved successfully"})
        
    else:  # GET
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID required"}), 400
            
        progress_data = load_data(USER_PROGRESS_FILE)
        return jsonify(progress_data.get(user_id, {}).get("quiz_scores", {}))

@app.route('/api/stats/<user_id>')
def get_user_stats(user_id):
    """Get user statistics"""
    progress_data = load_data(USER_PROGRESS_FILE)
    user_data = progress_data.get(user_id, {"completed_materials": [], "quiz_scores": {}})
    
    # Calculate statistics
    completed_materials = len(user_data.get("completed_materials", []))
    quiz_scores = user_data.get("quiz_scores", {})
    total_quizzes = len(quiz_scores)
    average_score = sum(score["score"] for score in quiz_scores.values()) / total_quizzes if total_quizzes > 0 else 0
    
    return jsonify({
        "completed_materials": completed_materials,
        "total_quizzes": total_quizzes,
        "average_score": average_score,
        "last_activity": max((score["timestamp"] for score in quiz_scores.values()), default=None)
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001) 