from pydantic import BaseModel
from typing import Dict, Optional, List

# Response Models
class EmotionBreakdown(BaseModel):
    happy: float = 0.0
    sad: float = 0.0
    angry: float = 0.0
    fear: float = 0.0
    disgust: float = 0.0
    surprise: float = 0.0
    neutral: float = 0.0

class AnalysisResponse(BaseModel):
    user_id: str
    wellbeing_score: float
    dominant_emotion: str
    recommendation: str
    fused_emotions: Dict[str, float]
    text_analysis: Optional[Dict[str, float]] = None
    audio_analysis: Optional[Dict[str, float]] = None
    face_analysis: Optional[Dict[str, float]] | str = None 
    processing_time_ms: float

class SessionHistoryItem(BaseModel):
    id: int
    user_id: str
    timestamp: str
    wellbeing_score: float
    dominant_emotion: str
    recommendation: str
