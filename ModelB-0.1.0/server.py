import random
import torch
import requests
from transformers import T5Tokenizer, T5ForConditionalGeneration
import logging
import re
from collections import defaultdict
import pandas as pd
from googleapiclient.discovery import build
from googletrans import Translator
from sklearn.metrics.pairwise import cosine_similarity
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModel
from flask_cors import CORS  # Import CORS

# Flask app setup
app = Flask(__name__)
CORS(app)

# YouTube API configuration
API_KEY = 'AIzaSyBUifBNejneMKD3DlpqNl4E--HDITZUQRQ'

# Load BERT model and tokenizer for student evaluation
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
model = AutoModel.from_pretrained('bert-base-uncased')

# Initialize the chatbot model (T5 and Ollama)
MODEL_DIR = r"C:\Users\SRIMANTA MAHARANA\Desktop\vinayak\Zawardo\checkpoint-12000"
OLLAMA_API_URL = "http://localhost:11434/api/generate"

# Model weights and patterns - Adjusted to favor Ollama
T5_KEYWORDS = {
    'explain': 0.6,
    'what is': 0.6,
    'how to': 0.6,
    'define': 0.6,
    'calculate': 0.5,
    'analyze': 0.5
}

OLLAMA_PATTERNS = {
    r'\?$': 0.7,  # Increased from 0.6
    r'^(hi|hello|hey)': 0.9,
    r'(can you|could you)': 0.8,
    r'opinion|think|feel': 0.9,
    r'chat|talk': 0.95,
    r'^[^.!?]*$': 0.6,  # Simple statements
    r'(thanks|thank you)': 0.9,
    r'(yes|no|maybe)': 0.8,
    r'tell me': 0.8
}

tokenizer_chat = T5Tokenizer.from_pretrained(MODEL_DIR)
model_chat = T5ForConditionalGeneration.from_pretrained(MODEL_DIR)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model_chat.to(device)

# BERT Dataset and Evaluation
data = [
   {
      "question": "Who developed Python programming language?",
      "correct_answer": "Guido van Rossum",
      "explanation": "Python was created by Guido van Rossum in the late 1980s and first released in 1991.",
      "topic": "History of Python"
    },
    {
      "question": "In which year was Python released?",
      "correct_answer": "1991",
      "explanation": "Python's first public release was in February 1991.",
      "topic": "History of Python"
    },
    {
      "question": "Which of the following is a valid variable name in Python?",
      "correct_answer": "var_name",
      "explanation": "Variable names in Python can include letters, digits, and underscores but cannot start with a digit.",
      "topic": "Variables"
    },
    {
      "question": "What will be the output of x = 10; y = 20; print(x + y)?",
      "correct_answer": "30",
      "explanation": "The values of x and y are added together, resulting in 30.",
      "topic": "Variables"
    },
    {
      "question": "What will be the output of the code: if 5 > 3: print('Yes') else: print('No')?",
      "correct_answer": "Yes",
      "explanation": "Since 5 is greater than 3, the condition is True, and 'Yes' is printed.",
      "topic": "If-Else"
    },
    {
      "question": "Which keyword is used for conditional statements in Python?",
      "correct_answer": "if",
      "explanation": "The 'if' keyword is used to test a condition in Python.",
      "topic": "If-Else"
    },
    {
      "question": "What will be the output of the following code: for i in range(3): print(i)?",
      "correct_answer": "0 1 2",
      "explanation": "The range(3) generates numbers 0, 1, and 2, which are printed by the loop.",
      "topic": "Loops"
    },
    {
      "question": "Which loop is not supported in Python?",
      "correct_answer": "do-while",
      "explanation": "Python does not have a 'do-while' loop; it only supports 'for' and 'while' loops.",
      "topic": "Loops"
    },
    {
      "question": "Which of the following correctly creates a class in Python?",
      "correct_answer": "class MyClass():",
      "explanation": "Python uses the 'class' keyword to define a class, followed by parentheses for optional inheritance.",
      "topic": "Classes and Objects"
    },
    {
      "question": "What will be the output of the following code: class MyClass: def _init_(self): self.x = 10; obj = MyClass(); print(obj.x)?",
      "correct_answer": "10",
      "explanation": "The '_init_' method initializes 'x' to 10, and the object 'obj' retrieves this value.",
      "topic": "Classes and Objects"
    },
    {
      "question": "What will be the output of the following code: print(5 // 2)?",
      "correct_answer": "2",
      "explanation": "The '//' operator performs integer (floor) division, so 5 divided by 2 results in 2.",
      "topic": "Operators"
    },
    {
      "question": "Which operator is used for exponential calculation in Python?",
      "correct_answer": "",
      "explanation": "The '' operator raises a number to the power of another, e.g., 2**3 = 8.",
      "topic": "Operators"
    },
    {
      "question": "What will the following code return: len(['a', 'b', 'c'])?",
      "correct_answer": "3",
      "explanation": "The 'len()' function returns the number of items in the list, which is 3.",
      "topic": "Lists"
    },
    {
      "question": "Which method is used to add an item to a list?",
      "correct_answer": "append",
      "explanation": "The 'append()' method adds an element to the end of the list.",
      "topic": "Lists"
    },
    {
      "question": "How can you access the second element of a tuple (1, 2, 3)?",
      "correct_answer": "2",
      "explanation": "Tuple indexing starts at 0, so the second element is at index 1, which is 2.",
      "topic": "Tuples"
    },
    {
      "question": "What is the key difference between a list and a tuple?",
      "correct_answer": "Tuples are immutable",
      "explanation": "Unlike lists, tuples cannot be modified after creation, making them immutable.",
      "topic": "Tuples"
    },
    {
      "question": "Which method is used to retrieve a value from a dictionary by its key?",
      "correct_answer": "get",
      "explanation": "The 'get()' method retrieves the value associated with a specified key in a dictionary.",
      "topic": "Dictionaries"
    },
    {
      "question": "What will be the output of {'a': 1, 'b': 2}['a']?",
      "correct_answer": "1",
      "explanation": "The key 'a' corresponds to the value 1 in the dictionary.",
      "topic": "Dictionaries"
    },
    {
      "question": "How do you define a function in Python?",
      "correct_answer": "def",
      "explanation": "Functions in Python are defined using the 'def' keyword.",
      "topic": "Functions"
    },
    {
      "question": "What is the output of the code: def func(x): return x * 2; print(func(5))?",
      "correct_answer": "10",
      "explanation": "The function 'func' multiplies its input by 2, so func(5) returns 10.",
      "topic": "Functions"
    },
    {
      "question": "Which keyword is used to handle exceptions in Python?",
      "correct_answer": "try",
      "explanation": "The 'try' keyword is used to test a block of code for errors.",
      "topic": "Exceptions"
    },
    {
      "question": "What will be the output of: try: 1/0 except ZeroDivisionError: print('Error')?",
      "correct_answer": "Error",
      "explanation": "The 'except' block catches the ZeroDivisionError and prints 'Error'.",
      "topic": "Exceptions"
    },
    {
      "question": "Which method is used to read the contents of a file?",
      "correct_answer": "read",
      "explanation": "The 'read()' method reads the entire content of a file as a string.",
      "topic": "File Handling"
    },
    {
      "question": "Which mode is used to open a file for appending?",
      "correct_answer": "a",
      "explanation": "The 'a' mode is used to open a file for appending content to the end of the file.",
      "topic": "File Handling"
    }
]

df = pd.DataFrame(data)
question_embeddings = None  # Will be initialized with BERT embeddings
translator = Translator()

# Initialize question embeddings for student evaluation
def init_embeddings():
    global question_embeddings
    question_embeddings = get_embeddings(df['question'].tolist())

def get_embeddings(texts):
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state[:, 0, :]

def fetch_youtube_videos(query, max_results=5):
    youtube = build('youtube', 'v3', developerKey=API_KEY)
    request = youtube.search().list(
        q=query,
        part='snippet',
        type='video',
        maxResults=max_results
    )
    response = request.execute()
    
    videos = []
    for item in response.get('items', []):
        videos.append({
            'title': item['snippet']['title'],
            'url': f"https://www.youtube.com/watch?v={item['id']['videoId']}",
            'thumbnail': item['snippet']['thumbnails']['medium']['url']
        })
    return videos

def evaluate_student(questions, answers):
    weak_topics = defaultdict(int)
    results = []
    
    for i, question in enumerate(questions):
        question_embedding = get_embeddings([question])
        similarities = cosine_similarity(question_embedding.numpy(), question_embeddings.numpy())
        best_match_index = similarities.argmax()
        
        topic = df.iloc[best_match_index]['topic']
        correct_answer = df.iloc[best_match_index]['correct_answer']
        explanation = df.iloc[best_match_index]['explanation']
        
        student_answer_embedding = get_embeddings([answers[i]])
        correct_answer_embedding = get_embeddings([correct_answer])
        answer_similarity = cosine_similarity(student_answer_embedding.numpy(), 
                                           correct_answer_embedding.numpy())[0][0]
        
        if answer_similarity > 0.99:
            results.append({"question": question, "status": "Correct", "topic": topic})
        else:
            results.append({
                "question": question,
                "status": "Incorrect",
                "topic": topic,
                "correct_answer": correct_answer,
                "explanation": explanation
            })
            weak_topics[topic] += 1
            
    return results, weak_topics

def calculate_weights(input_text):
    text = input_text.lower()
    t5_score = 0
    ollama_score = 0.3  # Base score for Ollama to favor it

    # Calculate T5 score based on keywords
    for keyword, weight in T5_KEYWORDS.items():
        if keyword in text:
            t5_score += weight

    # Calculate Ollama score based on patterns
    for pattern, weight in OLLAMA_PATTERNS.items():
        if re.search(pattern, text):
            ollama_score += weight

    # Normalize scores with Ollama bias
    total = t5_score + ollama_score
    if total == 0:
        return 0.2, 0.8  # Even stronger default bias towards Ollama

    t5_weight = (t5_score / total) * 0.8  # Reduce T5 influence
    ollama_weight = (ollama_score / total) * 1.2  # Boost Ollama influence

    # Ensure weights sum to 1
    total_weight = t5_weight + ollama_weight
    t5_weight = t5_weight / total_weight
    ollama_weight = ollama_weight / total_weight

    return t5_weight, ollama_weight

def generate_t5_response(input_text):
    try:
        inputs = tokenizer_chat(input_text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        inputs = {k: v.to(device) for k, v in inputs.items()}
        
        outputs = model_chat.generate(
            inputs['input_ids'],
            max_length=120,
            num_beams=3,
            no_repeat_ngram_size=2,
            temperature=0.7
        )
        
        return tokenizer_chat.decode(outputs[0], skip_special_tokens=True)
    except Exception as e:

        return None

def query_ollama(input_text, model_name="mistral"):
    try:
        response = requests.post(
            OLLAMA_API_URL,
            json={
                "model": model_name,
                "prompt": input_text,
                "stream": False
            }
        )
        if response.status_code == 200:
            return response.json().get('response', '').strip()
        return None
    except Exception as e:
    
        return None

def get_blended_response(input_text):
    t5_weight, ollama_weight = calculate_weights(input_text)

    # Select model based on weights
    if t5_weight > ollama_weight:
        response = generate_t5_response(input_text)
        model_used = f"T5 (confidence: {t5_weight:.2f})"
        
        # Fallback to Ollama if T5 fails
        if not response:
            response = query_ollama(input_text)
            model_used = f"Ollama (fallback, original T5 weight: {t5_weight:.2f})"
    else:
        response = query_ollama(input_text)
        model_used = f"Ollama (confidence: {ollama_weight:.2f})"
        
        # Fallback to T5 if Ollama fails
        if not response:
            response = generate_t5_response(input_text)
            model_used = f"T5 (fallback, original Ollama weight: {ollama_weight:.2f})"

    return response, model_used

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message', '')


    if not user_input:
        return jsonify({"error": "No input provided"}), 400

    response, model_used = get_blended_response(user_input)
    print(response)

    return jsonify({
        "response": response,
        "model_used": model_used
    })
  

# API Routes for YouTube Videos and Student Evaluation
@app.route('/api/videos', methods=['POST'])
def get_videos():
    data = request.json
    query = data.get('query', '')
    max_results = data.get('max_results', 5)
    videos = fetch_youtube_videos(query, max_results)
    return jsonify({"videos": videos})

@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    data = request.json
    questions = data.get('questions', [])
    answers = data.get('answers', [])
    
    if not questions or not answers or len(questions) != len(answers):
        return jsonify({"error": "Invalid input"}), 400
        
    results, weak_topics = evaluate_student(questions, answers)
    return jsonify({
        "results": results,
        "weak_topics": dict(weak_topics)
    })


# Initialize embeddings and start the app
init_embeddings()
app.run(debug=True, port=5001)