import torch 
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import requests
import time
import sys

def wait_for_ollama_service(max_retries=5, retry_delay=2):
    print("\nChecking Ollama service status...")
    
    for attempt in range(max_retries):
        try:
            response = requests.get('http://localhost:11434/api/health')
            if response.status_code == 200:
                print("�� Ollama service is ready!")
                return True
                
        except requests.exceptions.ConnectionError:
            remaining = max_retries - attempt - 1
            print(f"Waiting for Ollama service... ({remaining} attempts remaining)")
            time.sleep(retry_delay)
            
    print("❌ Error: Could not connect to Ollama service")
    print("Please ensure Ollama is running with: 'ollama serve'")
    return False

# Initialize models
print("Initializing models...")
model_checkpoint_path = r"C:\Users\ms979\OneDrive\Desktop\Zawardo\botv2\checkpoint-9990"
model = AutoModelForSeq2SeqLM.from_pretrained(model_checkpoint_path)
tokenizer = AutoTokenizer.from_pretrained(model_checkpoint_path)

# Add this at the start of your main code
if not wait_for_ollama_service():
    sys.exit(1)

def generate_t5_response(input_text):
    inputs = tokenizer(input_text, return_tensors="pt", padding=True, truncation=True, max_length=512)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    inputs = {key: val.to(device) for key, val in inputs.items()}

    outputs = model.generate(
        inputs['input_ids'],
        max_length=120,
        num_beams=3,
        no_repeat_ngram_size=2
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

def generate_ollama_response(input_text):
    try:
        response = requests.post('http://localhost:11434/api/generate',
                               json={
                                   "model": "mistral",
                                   "prompt": input_text,
                                   "stream": False
                               })
        return response.json()['response']
    except Exception as e:
        print(f"Ollama error: {e}")
        return None

def generate_blended_response(input_text):
    print("Generating T5 response...")
    t5_response = generate_t5_response(input_text)
    
    print("Generating Mistral response...")
    mistral_response = generate_ollama_response(input_text)
    
    if not mistral_response:
        return t5_response
        
    return f"T5: {t5_response}\nMistral: {mistral_response}"

print("\nBlended Bot Ready! (Type 'exit' to quit)")
while True:
    user_input = input("\nYou: ")
    if user_input.lower() in ["exit", "quit"]:
        break
    
    response = generate_blended_response(user_input)
    print(f"Bot: {response}")