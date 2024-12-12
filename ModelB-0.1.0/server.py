from flask import Flask, request, jsonify
from googleapiclient.discovery import build
from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from collections import defaultdict
import json
from googletrans import Translator
from datetime import datetime
import random
import re
from difflib import get_close_matches

app = Flask(__name__)

# YouTube API configuration
API_KEY = 'AIzaSyBUifBNejneMKD3DlpqNl4E--HDITZUQRQ'

# Load BERT model and tokenizer
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
model = AutoModel.from_pretrained('bert-base-uncased')

# Load dataset
data = [
    {
        "question": "Who developed Python programming language?",
        "correct_answer": "Guido van Rossum",
        "explanation": "Python was created by Guidol van Rossum in the late 1980s and first released in 1991.",
        "topic": "History of Python"
    },
    # ... continuing withe all 24 questions from test.py covering topics like:
    # - Python History
    # - Variables
    # - If-Else
    # - Loops
    # - Classes and Objects
    # - Operators
    # - Lists
    #a - Tuples
    # - Dictionaries
    # - Functions
    # - Exceptions
    # - File Handling
]

df = pd.DataFrame(data)
question_embeddings = None  # Will be initialized with BERT embeddingsr
translator = Translator()
dataset = None

def init_embeddings():
    global question_embeddings
    question_embeddings = get_embeddings(df['question'].tolist())

# Helper functions
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

def load_dataset(dataset_file: str) -> dict:
    with open(dataset_file, "r") as file:
        return json.load(file)

def find_best_response(user_prompt: str, intents: list[str]) -> str | None:
    matches = get_close_matches(user_prompt, intents, n=1, cutoff=0.6)
    return matches[0] if matches else None

def detect_emotion() -> str:
    return random.choice(["neutral", "happy", "frustrated"])

def extract_ticket_info(user_prompt: str) -> tuple[int, int]:
    adult_tickets = 0
    children_tickets = 0
    adult_match = re.search(r'(\d+)\s*adult', user_prompt, re.IGNORECASE)
    children_match = re.search(r'(\d+)\s*child', user_prompt, re.IGNORECASE)
    
    if adult_match:
        adult_tickets = int(adult_match.group(1))
    if children_match:
        children_tickets = int(children_match.group(1))
    
    return adult_tickets, children_tickets

def response_to_prompts(question: str, dataset: dict, user_prompt: str) -> str | None:
    for q in dataset["intents"]:
        if question in q["questions"]:
            emotion = detect_emotion()
            
            if q["intent"] == "date_time":
                current_date = datetime.now().strftime("%B %d, %Y")
                current_time = datetime.now().strftime("%I:%M %p")
                response_list = q["responses"].get(emotion, q["responses"]["neutral"])
                response_template = random.choice(response_list)
                return response_template.format(date=current_date, time=current_time)
            
            if q["intent"] == "book_tickets_with_quantity":
                num_adults, num_children = extract_ticket_info(user_prompt)
                total_price = num_adults * 300 + num_children * 200
                response_list = q["responses"].get(emotion, q["responses"]["neutral"])
                response_template = random.choice(response_list)
                return response_template.format(
                    num_adults=num_adults,
                    num_children=num_children,
                    total_price=total_price
                )
            
            response_list = q["responses"].get(emotion, q["responses"]["neutral"])
            return random.choice(response_list)

def translate_text(text: str, dest_language: str) -> str:
    translation = translator.translate(text, dest=dest_language)
    return translation.text

def find_best_match(user_prompt: str, dataset: dict) -> tuple[str, str, float]:
    best_confidence = 0
    best_answer = None
    matched_intent = None
    
    # Clean and normalize input
    user_prompt = user_prompt.lower().strip()
    
    for intent in dataset["intents"]:
        # Check each question in the intent
        for question in intent["questions"]:
            # Get similarity scores using different methods
            exact_match = user_prompt == question.lower()
            close_matches = get_close_matches(user_prompt, [question.lower()], n=1, cutoff=0.6)
            word_overlap = len(set(user_prompt.split()) & set(question.lower().split())) / len(set(user_prompt.split()))
            
            # Calculate confidence score
            confidence = 0
            if exact_match:
                confidence = 1.0
            elif close_matches:
                confidence = 0.8
            elif word_overlap > 0.5:
                confidence = word_overlap
            
            # Update best match if confidence is higher
            if confidence > best_confidence:
                best_confidence = confidence
                best_answer = random.choice(intent["answers"])
                matched_intent = intent["intent"]
    
    return best_answer, matched_intent, best_confidence

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    user_prompt = data.get('message')
    user_language = data.get('language', 'en')

    if not user_prompt:
        return jsonify({'response': 'Sorry! No input detected.'}), 400

    try:
        # Translate to English if needed
        if user_language != 'en':
            translated_prompt = translate_text(user_prompt, 'en')
        else:
            translated_prompt = user_prompt

        # Find best matching response
        answer, intent, confidence = find_best_match(translated_prompt, dataset)
        
        # If confidence is too low, provide a fallback response
        if confidence < 0.4:
            return jsonify({
                'response': 'I apologize, but I am not confident about answering that question. Could you please rephrase or ask about specific programming concepts?',
                'confidence': confidence,
                'videos': fetch_youtube_videos("python programming basics", max_results=3)
            }), 200
            
        # Get relevant videos based on intent
        videos = fetch_youtube_videos(f"python {intent} tutorial", max_results=3)
        
        # Translate response if needed
        if user_language != 'en':
            answer = translate_text(answer, user_language)
        
        return jsonify({
            'response': answer,
            'intent': intent,
            'confidence': confidence,
            'videos': videos
        })

    except Exception as e:
        print(f"Error in chat endpoint: {str(e)}")
        return jsonify({
            'response': 'Sorry, there was an error processing your request.',
            'error': str(e)
        }), 500

# API Routes
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

if __name__ == '__main__':
    dataset = load_dataset("dataset_hackathon.json")
    init_embeddings()
    app.run(debug=True, port=5000)