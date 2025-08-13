# Doc-bot 🩺 – Simple Medical Chatbot

Doc-bot is a chatbot that answers health-related questions using a medical PDF book.  
Built with React, FastAPI, Gemini AI, and Pinecone.

Example: “What are the side effects of antidepressants?”

## How It Works
- Frontend: React app (App.jsx) for chatting.
- Backend: FastAPI (app.py) searches the book & calls AI.
- AI: Node.js server (your_gemini_server.js) using Gemini API.
- Search: Pinecone finds relevant text from the medical book.

## Setup & Run

### 1. Create `.env` in Doc-bot folder
 
```bash
PINECONE_API_KEY=your_pinecone_api_key
GEMINI_API_KEY=your_gemini_api_key
PORT=4000
```
### 2. Run FastAPI Backend

```bash
cd Doc-bot
python -m venv docBot
source docBot/Scripts/activate # On Windows use: docBot\Scripts\activate
pip install fastapi==0.115.4 uvicorn==0.32.0 langchain langchain-pinecone sentence-transformers==4.1.0 requests python-dotenv
uvicorn app:app --host 0.0.0.0 --port 8080


```
### 3. Run Gemini Server
```bash


cd Doc-bot
npm install express cors dotenv
node your_gemini_server.js

```

### 4. Run React Frontend

```bash
cd medical-chatbot
npm install
npm start

```

## Usage
Open http://localhost:5173  
Ask questions like:
- Hello
- What are the side effects of antidepressants?



