from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from . import models
from .database import engine
from .api import endpoints

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RecoverX AI API",
    description="Intelligent Digital Data Recovery & Investigation Platform",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Welcome to RecoverX AI API"}

