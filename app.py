from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.helper import download_embeddings
from langchain_pinecone import PineconeVectorStore
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
import requests
from langchain_core.language_models.llms import BaseLLM
from langchain_core.outputs import Generation, LLMResult
from typing import Any, List, Optional
import os
import logging
import time
from functools import lru_cache

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Log CORS configuration
logger.info("CORS configured for origins: http://localhost:5173")

# Load environment variables
load_dotenv()
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not PINECONE_API_KEY or not GEMINI_API_KEY:
    raise ValueError("PINECONE_API_KEY or GEMINI_API_KEY not set in .env")

os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY
os.environ["GEMINI_API_KEY"] = GEMINI_API_KEY

# Initialize embeddings and Pinecone
embeddings = download_embeddings()
index_name = "doc-chatbot"
docsearch = PineconeVectorStore.from_existing_index(
    index_name=index_name,
    embedding=embeddings
)
retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k": 3})  # Reduced k for better relevance

# Cache retriever results
@lru_cache(maxsize=100)
def cached_retriever(query: str) -> List[Any]:
    start_time = time.time()
    docs = retriever.invoke(query)
    logger.info(f"Retriever took {time.time() - start_time:.2f} seconds")
    return docs

# Define NodeJsLLM
class NodeJsLLM(BaseLLM):
    endpoint_url: str

    def _llm_type(self) -> str:
        return "nodejs_gemini"

    def _generate(
        self,
        prompts: List[str],
        stop: Optional[List[str]] = None,
        **kwargs: Any,
    ) -> LLMResult:
        prompt = prompts[0]
        start_time = time.time()
        try:
            response = requests.post(
                self.endpoint_url,
                json={"messages": [{"role": "user", "content": prompt}]},
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            data = response.json()
            content = data.get("content", "Sorry, no response from server.")
            logger.info(f"Gemini API call took {time.time() - start_time:.2f} seconds")
            return LLMResult(generations=[[Generation(text=content)]])
        except Exception as e:
            logger.error(f"Error in NodeJsLLM: {str(e)}")
            return LLMResult(generations=[[Generation(text=f"Error: {str(e)}")]])

chatModel = NodeJsLLM(endpoint_url="http://localhost:4000/chat")

# Define prompt
prompt = PromptTemplate.from_template(
    """You are a friendly Medical Assistant chatbot designed to answer health-related questions. 
Follow these rules:
1. For greetings like 'hello', 'hi', or 'hey', respond with 'Hi! I'm your Medical Assistant, ready to help with health questions.'
2. For questions about yourself (e.g., 'who are you', 'tell me about yourself'), introduce yourself as: 'I'm a Medical Assistant chatbot, built to answer your health questions using reliable medical information.'
3. For vague queries (e.g., 'more', 'anything else'), refer to the conversation history to continue the previous topic or ask for clarification if no history exists.
4. For health-related questions, use the provided context to answer concisely and accurately. Include all relevant information, such as specific drug names and their side effects, if available in the context.
5. If the question includes 'in points' or similar, format the answer as bullet points.
6. If the context has no relevant information for a health question, respond with 'I don't know.' Do not say 'I don't know' if the context contains any relevant details, even if partial.
7. Keep answers clear, natural, and avoid mentioning the context or source directly.

Conversation History:
{history}

Context:
{context}

Question:
{input}"""
)

# Initialize RAG chain
question_answer_chain = create_stuff_documents_chain(chatModel, prompt)
rag_chain = create_retrieval_chain(retriever, question_answer_chain)

# Request model for /api/chat
class ChatRequest(BaseModel):
    message: str

# Chat endpoint
@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        start_time = time.time()
        logger.info(f"Processing request: {request.message}")
        # Use cached retriever
        retrieved_docs = cached_retriever(request.message)
        logger.info("Retrieved documents:")
        for doc in retrieved_docs:
            logger.info(f"Content: {doc.page_content}")
        # Provide empty history for now
        rag_start_time = time.time()
        response = rag_chain.invoke({"input": request.message, "history": ""})
        logger.info(f"RAG chain took {time.time() - rag_start_time:.2f} seconds")
        logger.info(f"Response: {response['answer']}")
        logger.info(f"Request processed in {time.time() - start_time:.2f} seconds")
        return {"response": response["answer"]}
    except Exception as e:
        logger.error(f"Error in /api/chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)

