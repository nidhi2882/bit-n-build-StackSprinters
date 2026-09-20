from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from app.classifiers.nlp_classifier import NLPClassifier
from app.severity.severity_engine import SeverityEngine
from app.duplicates.matcher import DuplicateMatcher
from app.copilot.rag_engine import CopilotEngine

router = APIRouter(prefix="/api", tags=["ResQGrid AI Engine"])

classifier = NLPClassifier()
severity_engine = SeverityEngine()
duplicate_matcher = DuplicateMatcher()
copilot_engine = CopilotEngine()

class ClassifyRequest(BaseModel):
    text: str = Field(..., example="Water level rose 4 feet in Subhanpura, 14 residents trapped on roof")

class SeverityRequest(BaseModel):
    text: Optional[str] = ""
    description: Optional[str] = ""
    severity: Optional[int] = 3
    sensorBreach: Optional[bool] = False
    duplicateCount: Optional[int] = 0
    isHumanVerified: Optional[bool] = False

class DuplicateCheckRequest(BaseModel):
    candidate: Dict[str, Any]
    existingIncidents: List[Dict[str, Any]] = []

class CopilotRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = {}
    apiKey: Optional[str] = None

class SetKeyRequest(BaseModel):
    apiKey: str

@router.get("/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "ResQGrid Python AI Microservice",
        "version": "1.0.0",
        "modelsLoaded": ["NLPClassifier", "SeverityEngine", "DuplicateMatcher", "CopilotEngine"]
    }

@router.post("/classify")
def classify_incident(req: ClassifyRequest):
    return classifier.classify(req.text)

@router.post("/severity")
def evaluate_severity(req: SeverityRequest):
    return severity_engine.evaluate(req.model_dump())

@router.post("/duplicates/check")
def check_duplicates(req: DuplicateCheckRequest):
    return duplicate_matcher.check_duplicate(req.candidate, req.existingIncidents)

@router.post("/copilot")
def query_copilot(req: CopilotRequest):
    return copilot_engine.answer_query(req.query, req.context, explicit_key=req.apiKey)

@router.get("/copilot/status")
def get_copilot_status():
    return copilot_engine.get_active_key_info()

@router.post("/copilot/set-key")
def set_copilot_key(req: SetKeyRequest):
    copilot_engine.set_api_key(req.apiKey)
    return copilot_engine.get_active_key_info()

