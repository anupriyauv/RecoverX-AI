# RecoverX AI — Intelligent Digital Data Recovery & Investigation Platform

> **Recover. Reconstruct. Understand. Prioritize.**

RecoverX AI is a next-generation, AI-assisted data recovery and digital forensics platform designed for complex data loss and investigation scenarios. It goes beyond simple file carving by using artificial intelligence to reconstruct fragmented data, establish relationships between evidence, and provide an interactive investigation assistant.

## The Problem
Traditional data recovery tools provide users with thousands of unnamed, contextless file fragments, leaving investigators and users to manually sift through raw data to find what matters. 

## The RecoverX AI Solution
We do not merely recover data; we **understand** it. RecoverX AI:
- Reconstructs partially corrupted files.
- Generates an interactive Evidence Relationship Graph.
- Calculates Recovery Confidence metrics.
- Prioritizes critical evidence automatically.
- Uses a **Gemini-powered Investigation Assistant** to explain findings and compile structured reports.

## Features
- **Simulated Recovery Engine**: Ingests unstructured fragments and relationships, securely storing them in SQLite.
- **Dynamic Dashboard**: Real-time visualization of total fragments, recoverable files, global confidence, and priority evidence.
- **Interactive Evidence Graph**: Built with React Flow, allowing investigators to visually explore how fragments connect to form files, along with structural confidence scores.
- **Gemini Investigation Assistant**: An integrated AI chat interface that contextually understands the recovered evidence database and generates comprehensive markdown reports.

## Technology Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide Icons, React Flow (for interactive graph rendering), React Markdown.
- **Backend**: Python 3.13, FastAPI, Uvicorn, SQLAlchemy (SQLite).
- **AI Integration**: Google `google-genai` SDK (Gemini 2.5 Pro).

## Getting Started

### 1. Start the Backend API
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
*Note: To enable live AI generation, create a `.env` file in the backend directory containing `GEMINI_API_KEY="your-api-key"`.*

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
1. Navigate to `http://localhost:5173/` in your browser.
2. Click **Start Scan** to begin processing the simulated damaged storage.
3. Once completed, navigate to the **Evidence Graph** to visually explore the fragment connections.
4. Open the **AI Assistant** tab to query Gemini about the recovered evidence and generate a comprehensive AI Report.

## Architecture

```
RecoverX-AI/
├── backend/
│   ├── app/
│   │   ├── api/ (FastAPI endpoints)
│   │   ├── engine/ (Simulated recovery engine logic)
│   │   ├── models.py (SQLAlchemy DB schemas)
│   │   └── database.py (SQLite setup)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/ (Dashboard, GraphView, AIAssistant)
│   │   └── services/api.js (Backend integration)
└── data/ (Simulated datasets)
```

## Hackathon Goal
RecoverX AI is a prototype designed to demonstrate the massive potential of integrating modern Large Language Models into digital forensics and data recovery pipelines, turning raw binary chaos into actionable, explainable intelligence.
