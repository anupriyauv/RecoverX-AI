import json
import time
from sqlalchemy.orm import Session
from .. import models

class MockRecoveryEngine:
    def __init__(self, db: Session, case_id: int):
        self.db = db
        self.case_id = case_id
        
    def load_demo_data(self, json_path: str):
        with open(json_path, 'r') as f:
            data = json.load(f)
            
        # 1. Load Fragments
        for frag in data.get("fragments", []):
            db_frag = models.Fragment(
                case_id=self.case_id,
                filename=frag.get("filename"),
                fragment_type=frag.get("fragment_type"),
                size=frag.get("size"),
                offset=frag.get("offset"),
                status=frag.get("status")
            )
            self.db.add(db_frag)
            
        # 2. Load Recovered Files
        for f in data.get("recovered_files", []):
            db_file = models.RecoveredFile(
                case_id=self.case_id,
                filename=f.get("filename"),
                file_type=f.get("file_type"),
                category=f.get("category"),
                completeness=f.get("completeness"),
                integrity_score=f.get("integrity_score"),
                recovery_confidence=f.get("recovery_confidence"),
                sensitivity=f.get("sensitivity"),
                priority=f.get("priority"),
                status=f.get("status")
            )
            self.db.add(db_file)
            
        self.db.commit()
        
        # 3. Load Fragment Relationships
        for rel in data.get("fragment_relationships", []):
            db_rel = models.FragmentRelationship(
                case_id=self.case_id,
                fragment_a_id=rel.get("fragment_a_id"),
                fragment_b_id=rel.get("fragment_b_id"),
                confidence=rel.get("confidence"),
                reasons=rel.get("reasons")
            )
            self.db.add(db_rel)

        # 4. Load Evidence Relationships
        for rel in data.get("evidence_relationships", []):
            db_ev = models.EvidenceRelationship(
                case_id=self.case_id,
                source_object_id=rel.get("source_object_id"),
                target_object_id=rel.get("target_object_id"),
                relationship_type=rel.get("relationship_type"),
                confidence=rel.get("confidence"),
                reasons=rel.get("reasons")
            )
            self.db.add(db_ev)
            
        self.db.commit()

    def simulate_scan(self):
        # Simulate processing time for the UI animation
        time.sleep(2)
        return {"status": "success", "message": "Scan completed"}
