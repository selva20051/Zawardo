from transformers import AutoTokenizer, AutoModel
import torch
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
from collections import defaultdict

data =  [
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
      "question": "What will be the output of the following code: class MyClass: def __init__(self): self.x = 10; obj = MyClass(); print(obj.x)?",
      "correct_answer": "10",
      "explanation": "The '__init__' method initializes 'x' to 10, and the object 'obj' retrieves this value.",
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
      "correct_answer": "**",
      "explanation": "The '**' operator raises a number to the power of another, e.g., 2**3 = 8.",
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

# Initialize tokenizer and model
tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
model = AutoModel.from_pretrained('bert-base-uncased')

# Function to get embeddings
def get_embeddings(texts):
    inputs = tokenizer(texts, padding=True, truncation=True, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    embeddings = outputs.last_hidden_state[:, 0, :]  # Use [CLS] token embeddings
    return embeddings

# Precompute and store question embeddings for all dataset questions
question_embeddings = get_embeddings(df['question'].tolist())

# Evaluate function using precomputed question embeddings
def evaluate_student_with_embeddings(questions, answers):
    weak_topics = defaultdict(int)
    results = []

    for i, question in enumerate(questions):
        # Get the embedding of the student's question
        question_embedding = get_embeddings([question])

        # Calculate cosine similarity between the student's question and dataset questions
        similarities = cosine_similarity(question_embedding.numpy(), question_embeddings.numpy())

        # Get the index of the most similar question from the dataset
        best_match_index = similarities.argmax()

        # Retrieve the most similar question's topic, correct answer, and explanation
        topic = df.iloc[best_match_index]['topic']
        correct_answer = df.iloc[best_match_index]['correct_answer']
        explanation = df.iloc[best_match_index]['explanation']

        # Tokenize and compute embeddings for both student's and correct answers
        student_answer_embedding = get_embeddings([answers[i]])
        correct_answer_embedding = get_embeddings([correct_answer])

        # Compute cosine similarity between embeddings of answers
        answer_similarity = cosine_similarity(student_answer_embedding.numpy(), correct_answer_embedding.numpy())[0][0]

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

if __name__ == "__main__":

    student_questions = [
        "What is used to read the contents of a file?",
        "What mode is used to open a file for appending?"
    ]
    student_answers = ["read", "g "] 

    results, weak_topics = evaluate_student_with_embeddings(student_questions, student_answers)

    # Print results
    print("\nEvaluation Results:")
    for result in results:
        print(result)

    print("\nWeak Topics:")
    for topic, count in weak_topics.items():
        print(f"{topic}: {count} incorrect answers")