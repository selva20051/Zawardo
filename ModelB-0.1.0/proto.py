from flask import Flask, request, jsonify, render_template, redirect, url_for, session
import json
import re
import random
from difflib import get_close_matches
from googletrans import Translator  
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Required to use Flask sessions
translator = Translator()  

# Dummy user data (for testing purposes)
users = {"zishan": "201023"}  # Only zishan with password 201023 is valid

def load_dataset(dataset_file: str) -> dict:
    with open(dataset_file, "r") as file:
        data: dict = json.load(file)
        return data

dataset = load_dataset("dataset_2.json")

def find_best_response(user_prompt: str, intents: list[str]) -> str | None:
    matches: list = get_close_matches(user_prompt, intents, n=1, cutoff=0.4)
    return matches[0] if matches else None

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

def detect_emotion() -> str:
    return random.choice(["neutral", "happy", "frustrated"])

def response_to_prompts(question: str, dataset: dict, user_prompt: str) -> str | None:
    for q in dataset["intents"]:
        if question in q["questions"]:
            emotion = detect_emotion()

            # Handle date and time intent
            if q["intent"] == "date_time":
                current_date = datetime.now().strftime("%B %d, %Y")  # e.g., October 06, 2024
                current_time = datetime.now().strftime("%I:%M %p")  # e.g., 01:45 PM

                response_list = q["responses"].get(emotion, q["responses"]["neutral"])
                response_template = random.choice(response_list)

                return response_template.format(date=current_date, time=current_time)

            # Handle other intents (like booking tickets)
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

# Check if user is logged in
def login_required(func):
    def wrapper(*args, **kwargs):
        if 'user' not in session:
            return redirect(url_for('login'))
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

# Homepage route
@app.route('/')
def home():
    return redirect(url_for('login'))

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check for valid credentials
        if username in users and users[username] == password:
            session['user'] = username  # Store username in session
            return redirect(url_for('chatbot'))  # Redirect to chatbot
        else:
            return render_template('login_sign-up.html', error="Wrong username or password.")  # Display error message

    return render_template('login_sign-up.html')  # Ensure the template name matches your file

# Chatbot page - only accessible after login
@app.route('/chatbot', methods=['GET'])
@login_required
def chatbot():
    return render_template('chatbot.html')

# Chat functionality
@app.route('/chat', methods=['POST'])
@login_required
def chat():
    data = request.json
    user_prompt = data.get('message')
    user_language = data.get('language', 'en')

    if not user_prompt:
        return jsonify({'response': 'Sorry! No input detected.'})

    translated_prompt = translate_text(user_prompt, 'en')

    best_response = find_best_response(translated_prompt, [q for intent in dataset["intents"] for q in intent["questions"]])

    if best_response:
        response = response_to_prompts(best_response, dataset, translated_prompt)
        translated_response = translate_text(response, user_language)
        return jsonify({'response': translated_response})
    else:
        return jsonify({'response': 'Sorry! No answers.'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  
