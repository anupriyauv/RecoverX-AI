from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, database
from ..engine.mock_engine import MockRecoveryEngine
from typing import List

router = APIRouter()

@router.post("/cases")
def create_case(case_name: str, dataset_ref: str, db: Session = Depends(database.get_db)):
    db_case = models.Case(case_name=case_name, dataset_ref=dataset_ref)
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case

@router.get("/cases")
def get_cases(db: Session = Depends(database.get_db)):
    return db.query(models.Case).all()

@router.post("/cases/{case_id}/scan")
def scan_case(case_id: int, db: Session = Depends(database.get_db)):
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    engine = MockRecoveryEngine(db, case_id)
    # Clear existing for demo rerun safety
    db.query(models.Fragment).filter(models.Fragment.case_id == case_id).delete()
    db.query(models.RecoveredFile).filter(models.RecoveredFile.case_id == case_id).delete()
    db.query(models.FragmentRelationship).filter(models.FragmentRelationship.case_id == case_id).delete()
    db.query(models.EvidenceRelationship).filter(models.EvidenceRelationship.case_id == case_id).delete()
    db.commit()
    
    # Load dataset based on ref (relative to the script execution which is root or backend)
    # Assuming execution from backend folder
    import os
    # Try resolving path assuming running from backend or root
    dataset_path = f"../data/demo_cases/{case.dataset_ref}.json"
    if not os.path.exists(dataset_path):
         dataset_path = f"data/demo_cases/{case.dataset_ref}.json"
         
    try:
        engine.load_demo_data(dataset_path)
        case.status = "Analysis Complete"
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
    return engine.simulate_scan()

@router.get("/cases/{case_id}/dashboard")
def get_dashboard(case_id: int, db: Session = Depends(database.get_db)):
    fragments = db.query(models.Fragment).filter(models.Fragment.case_id == case_id).all()
    files = db.query(models.RecoveredFile).filter(models.RecoveredFile.case_id == case_id).all()
    
    total_fragments = len(fragments)
    recoverable = sum(1 for f in fragments if f.status == "Recoverable")
    partial = sum(1 for f in fragments if f.status == "Partial")
    corrupted = sum(1 for f in fragments if f.status == "Corrupted")
    
    high_priority = sum(1 for f in files if f.priority == "HIGH")
    sensitive_objects = sum(1 for f in files if f.sensitivity == "HIGH")
    
    avg_confidence = sum(f.recovery_confidence for f in files) / len(files) if files else 0
    
    return {
        "total_fragments": total_fragments,
        "recoverable": recoverable,
        "partial": partial,
        "corrupted": corrupted,
        "recovery_confidence": round(avg_confidence, 1),
        "high_priority": high_priority,
        "sensitive_objects": sensitive_objects,
        "fragment_clusters": len(db.query(models.FragmentRelationship).filter(models.FragmentRelationship.case_id == case_id).all()),
        "priority_evidence": files
    }

@router.get("/cases/{case_id}/fragments")
def get_fragments(case_id: int, db: Session = Depends(database.get_db)):
    return db.query(models.Fragment).filter(models.Fragment.case_id == case_id).all()

@router.get("/cases/{case_id}/relationships")
def get_relationships(case_id: int, db: Session = Depends(database.get_db)):
    frag_rels = db.query(models.FragmentRelationship).filter(models.FragmentRelationship.case_id == case_id).all()
    ev_rels = db.query(models.EvidenceRelationship).filter(models.EvidenceRelationship.case_id == case_id).all()
    
    return {
        "fragment_relationships": frag_rels,
        "evidence_relationships": ev_rels
    }

# --- Groq AI Endpoints ---
from pydantic import BaseModel
import os
from groq import Groq

# Global cache for hackathon demo to store contents of uploaded files
UPLOADED_FILE_CONTENTS = {}

class AIQuery(BaseModel):
    query: str

@router.post("/cases/{case_id}/ai/query")
def ask_ai(case_id: int, payload: AIQuery, db: Session = Depends(database.get_db)):
    # 1. Fetch Structured Context
    files = db.query(models.RecoveredFile).filter(models.RecoveredFile.case_id == case_id).all()
    context_str = "Recovered Evidence Context:\n"
    for f in files:
        context_str += f"- {f.filename} ({f.file_type}): Confidence {f.recovery_confidence}%, Priority: {f.priority}, Sensitive: {f.sensitivity}\n"
        if f.filename in UPLOADED_FILE_CONTENTS:
            context_str += f"  Content Transcript: \"{UPLOADED_FILE_CONTENTS[f.filename]}\"\n"
    
    # Inject mock ransomware content for the hackathon demo
    context_str += "\nHIDDEN MALWARE ARTIFACT DETECTED in [item_cluster_012]:\n"
    context_str += "Type: Ransomware Extortion Note\n"
    context_str += "Content Transcript: 'YOUR CORPORATE NETWORK HAS BEEN COMPROMISED. All financial files (transactions.csv, invoice_2026.pdf) are locked. Pay 2.5 Bitcoin to wallet address: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa within 48 hours or your data will be permanently deleted and leaked.'\n"
    
    prompt = f"You are the RecoverX AI digital forensics assistant. Use ONLY the following case context to answer the user's query clearly and professionally. If they ask about the ransomware, read the hidden malware artifact transcript.\n\n{context_str}\n\nUser Query: {payload.query}"
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"response": f"[MOCK AI RESPONSE] I see you asked: '{payload.query}'. Based on the evidence, we have several high priority files like 'invoice_2026.pdf' because they contain financial data. (Note: Provide GROQ_API_KEY in .env for live AI)."}
        
    try:
        client = Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="qwen/qwen3.8-27b",
            max_tokens=500,
        )
        return {"response": chat_completion.choices[0].message.content}
    except Exception as e:
        return {"response": f"AI Error: {str(e)}"}

@router.post("/cases/{case_id}/ai/report")
def generate_report(case_id: int, db: Session = Depends(database.get_db)):
    files = db.query(models.RecoveredFile).filter(models.RecoveredFile.case_id == case_id).all()
    context_str = "Recovered Evidence:\n"
    for f in files:
        context_str += f"- {f.filename} | Priority: {f.priority} | Complete: {f.completeness}%\n"
        
    prompt = f"You are the RecoverX AI engine. Generate a structured AI Investigation Report summarizing these findings. Include Case Overview, High Priority Findings, and Potential Sensitive Data.\n\n{context_str}"
    
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"report": "## AI Investigation Report\n\n**Case Overview**\nThe analysis revealed multiple recovered fragments with strong structural integrity.\n\n**Priority Findings**\n- `invoice_2026.pdf` is fully reconstructed.\n- `transactions.csv` contains high-priority financial data.\n\n*(Add GROQ_API_KEY for live generation)*"}
        
    try:
        client = Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="qwen/qwen3.8-27b",
            max_tokens=500,
        )
        report_text = chat_completion.choices[0].message.content
        report = models.AIReport(case_id=case_id, report=report_text)
        db.add(report)
        db.commit()
        return {"report": report_text}
    except Exception as e:
        return {"report": f"AI Generation Failed: {str(e)}"}

from fastapi import UploadFile, File

@router.post("/cases/{case_id}/upload-corrupted")
async def upload_corrupted_file(case_id: int, file: UploadFile = File(...), db: Session = Depends(database.get_db)):
    content = await file.read()
    
    api_key = os.getenv("GROQ_API_KEY")
    
    is_audio = file.filename.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg', '.flac'))
    is_pdf = file.filename.lower().endswith('.pdf')
    
    if is_audio:
        if not api_key:
             text = "[NO API KEY] Simulated audio transcription... garbled audio detected."
        else:
             try:
                 client = Groq(api_key=api_key)
                 transcription = client.audio.transcriptions.create(
                     file=(file.filename, content),
                     model="whisper-large-v3-turbo",
                 )
                 text = transcription.text
             except Exception as e:
                 text = f"[Audio Transcription Failed: {str(e)}]"
    elif is_pdf:
        try:
            import io
            from PyPDF2 import PdfReader
            pdf_reader = PdfReader(io.BytesIO(content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        except Exception as e:
            text = f"[PDF Parsing Failed: {str(e)}]"
    else:
        try:
            text = content.decode('utf-8', errors='replace')
        except Exception:
            text = str(content)
        
    if not api_key:
        return {
            "original": text, 
            "corrected": f"[GROQ API KEY MISSING] Simulated Reconstruction:\n\n{text}\n\n[Reconstruction Complete]",
            "filename": file.filename
        }
        
    # Standard Reconstruction Prompt
    prompt = f"The following text is from a corrupted file fragment or a noisy audio transcription. Reconstruct the missing or corrupted parts of this text, fix formatting, and return ONLY the corrected, highly legible file content without any markdown blocks or explanations.\n\nIMPORTANT: If the text is overwhelmingly random noise, garbled characters, or pure hexadecimal, and contains no discernible human language or structure to recover, you MUST output EXACTLY: 'CRITICAL FAILURE: Entropy levels exceed recoverable threshold. The mathematical structure of this file has been permanently destroyed.'\n\n---CORRUPTED CONTENT---\n{text}"
    
    try:
        client = Groq(api_key=api_key)
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a specialized AI data reconstruction engine. Your job is to take corrupted file fragments and restore them to their original intended state. You must also detect if a file is permanently destroyed."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="qwen/qwen3.8-27b",
            max_tokens=500
        )
        corrected_text = chat_completion.choices[0].message.content
        
        audio_base64 = None
        if is_audio:
            try:
                import io
                import base64
                from gtts import gTTS
                
                tts = gTTS(text=corrected_text, lang='en')
                mp3_fp = io.BytesIO()
                tts.write_to_fp(mp3_fp)
                mp3_fp.seek(0)
                audio_base64 = base64.b64encode(mp3_fp.read()).decode('utf-8')
            except Exception as e:
                print(f"TTS Error: {e}")
                
        # Save to database so AI Investigator can see it
        try:
            new_file = models.RecoveredFile(
                case_id=case_id,
                filename=file.filename,
                file_type="Audio/Text",
                category="Forensic Intercept",
                completeness=100.0,
                integrity_score=95.0,
                recovery_confidence=0.99,
                sensitivity="HIGH",
                priority="CRITICAL",
                status="Recovered"
            )
            db.add(new_file)
            db.commit()
            UPLOADED_FILE_CONTENTS[file.filename] = corrected_text
        except Exception as e:
            print(f"DB Error: {e}")

        return {
            "original": text, 
            "corrected": corrected_text, 
            "filename": file.filename,
            "audio_base64": audio_base64
        }
    except Exception as e:
        return {"original": text, "corrected": f"AI Reconstruction Failed: {str(e)}", "filename": file.filename}
