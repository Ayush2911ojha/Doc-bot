# Doc-bot 🩺 – Simple Medical Chatbot

Doc-bot is a chatbot that answers health-related questions using a medical PDF book.  
Built with React, FastAPI, Gemini AI, and Pinecone.

Example: “What are the side effects of antidepressants?”

## How It Works
- Frontend: React app (App.jsx) for chatting.
- Backend: FastAPI (app.py) searches the book & calls AI.
- AI Service (Node.js): geminiService.js uses the Gemini API to generate answers based on the retrieved context.

- Vector Search (Pinecone): Stores embeddings (vector representations) of the medical PDF's text chunks for fast similarity search.

- RAG Pipeline:

    - Document Processing – The PDF is split into small chunks (few hundred words) for better search accuracy.
    - Embeddings – Each chunk is converted into a numeric vector using an embedding model.
    - Storage – These vectors are stored in Pinecone’s vector database.
    - Query – When a user asks a question, it is converted to a vector embedding.
    - Retrieval – Pinecone finds the most similar text chunks from the stored vectors.
    - Answer Generation – The retrieved chunks are sent to Gemini AI along with the question to create a contextual, accurate answer.



## Setup & Run
### 1.Clone the Repository

```bash 
git clone https://github.com/Ayush2911ojha/Doc-bot.git
cd Doc-bot

```
### 2. In the Doc-bot folder (root), create a .env file:
 
```bash
PINECONE_API_KEY=your_pinecone_api_key
GEMINI_API_KEY=your_gemini_api_key
PORT=4000
```
### 3. Install & Run FastAPI Backend

```bash
python -m venv venv
venv\Scripts\activate
```
###  Install backend dependencies:
``` bash
pip install -r requirements.txt
```
### Start the FastAPI backend (from the root directory):
```bash 
    
 uvicorn app:app --host 0.0.0.0 --port 8080

 ```

### 4. Install & Run Gemini Node.js Service
```bash

npm install express cors dotenv
node geminiService.js

```

### 5. Run React Frontend

```bash
cd frontend
npm install
npm start

```

## Usage
Open http://localhost:5173  
Ask questions like:
- Hello
- What are the side effects of antidepressants?



## General Notes

- Ensure that your FastAPI and Node.js servers are running before using the frontend.

- You may need to adjust CORS settings or environment variables for local development.

- The backend expects the medical PDF to be chunked, embedded, and indexed in Pinecone during initial setup.