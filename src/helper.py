from langchain.document_loaders import PyPDFLoader,DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter

from typing import List
from langchain.schema import Document

from langchain.embeddings import HuggingFaceEmbeddings

#load pdf

def load_pdf_files(data):
    loader =  DirectoryLoader(
        data,
        glob="*.pdf", 
        loader_cls=PyPDFLoader
    )
    documents = loader.load()
    return documents


#removing unnessary info from pdf

def filter_to_minimal_docs(docs: List[Document]) -> List[Document]:

    minimal_docs: List[Document] = []
    for doc in docs:
        src = doc.metadata.get("source")
        minimal_docs.append(
            Document(
                page_content=doc.page_content,
                metadata={"source": src}
            )
        )
    return minimal_docs



#chunking

def text_split(minimul_docs):
    text_spilitter = RecursiveCharacterTextSplitter(
        chunk_size = 500,
        chunk_overlap = 20,
       
    )
    texts_chunk = text_spilitter.split_documents(minimul_docs)
    return texts_chunk


#embdedding


def download_embeddings():
    model_name = "sentence-transformers/all-MiniLM-L6-v2"
    embeddings = HuggingFaceEmbeddings(
        model_name = model_name,
        
    )
    return embeddings



