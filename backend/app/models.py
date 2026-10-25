from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Case(Base):
    __tablename__ = "cases"

    id = Column(Integer, primary_key=True, index=True)
    case_name = Column(String, index=True)
    dataset_ref = Column(String)
    status = Column(String, default="Created")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    fragments = relationship("Fragment", back_populates="case")
    recovered_files = relationship("RecoveredFile", back_populates="case")

class Fragment(Base):
    __tablename__ = "fragments"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    filename = Column(String, nullable=True)
    fragment_type = Column(String) # e.g., JPEG, PDF, Unknown
    size = Column(Integer)
    offset = Column(Integer)
    hash_val = Column(String, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    status = Column(String) # e.g., Recoverable, Partial, Corrupted

    case = relationship("Case", back_populates="fragments")

class RecoveredFile(Base):
    __tablename__ = "recovered_files"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    filename = Column(String)
    file_type = Column(String)
    category = Column(String) # e.g., Financial, Personal
    completeness = Column(Float)
    integrity_score = Column(Float)
    recovery_confidence = Column(Float)
    sensitivity = Column(String) # e.g., LOW, MEDIUM, HIGH
    priority = Column(String)    # e.g., LOW, MEDIUM, HIGH
    status = Column(String)
    
    case = relationship("Case", back_populates="recovered_files")

class FragmentRelationship(Base):
    __tablename__ = "fragment_relationships"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    fragment_a_id = Column(Integer, ForeignKey("fragments.id"))
    fragment_b_id = Column(Integer, ForeignKey("fragments.id"))
    confidence = Column(Float)
    reasons = Column(JSON) # List of strings explaining relationship

class EvidenceRelationship(Base):
    __tablename__ = "evidence_relationships"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    source_object_id = Column(Integer, ForeignKey("recovered_files.id"))
    target_object_id = Column(Integer, ForeignKey("recovered_files.id"))
    relationship_type = Column(String) # e.g., mentions, references
    confidence = Column(Float)
    reasons = Column(JSON)
    
class AIReport(Base):
    __tablename__ = "ai_reports"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    report = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
