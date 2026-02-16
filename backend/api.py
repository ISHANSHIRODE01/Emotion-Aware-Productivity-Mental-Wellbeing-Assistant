from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
import tempfile
import cv2
import numpy as np
import logging
import time

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("uvicorn-backend")

# Import services
from backend.services.text_emotion import TextEmotionModel
from backend.services.audio_emotion import AudioEmotionModel
from backend.services.video_emotion import VideoEmotionModel
from backend.services.fusion import fuse_emotions, calculate_wellbeing_score
from backend.services.recommendations import generate_recommendation
from backend.database import save_session, get_user_history
from backend.schemas import AnalysisResponse

app = FastAPI()

# Allow CORS for frontend interaction
# Allow CORS for frontend interaction
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models
text_model = None
audio_model = None
video_model = None

@app.on_event("startup")
async def startup_event():
    global text_model, audio_model, video_model
    try:
        logger.info("Initializing AI models...")
        # Initialize models here. 
        text_model = TextEmotionModel()
        audio_model = AudioEmotionModel()
        video_model = VideoEmotionModel()

        logger.info("✓ All models loaded successfully.")
    except Exception as e:
        logger.error(f"✗ Error loading models during startup: {e}")

@app.get("/")
def read_root():
    return {"message": "Emotion-Wellbeing Assistant Backend is running"}

@app.get("/history")
def get_history(user_id: str):
    """Get past sessions for a user."""
    return get_user_history(user_id)

@app.post("/analyze_session", response_model=AnalysisResponse)
async def analyze_session(
    user_id: str = Form("default_user"),
    text: str = Form(None),
    audio_file: UploadFile = File(None),
    image_file: UploadFile = File(None)
):
    """
    Analyze a session using text, audio, and/or image inputs.
    Returns emotion breakdown, wellbeing score, and recommendations.
    Saves result to database.
    """
    start_time = time.time()
    results = {}
    text_probs = {}
    audio_probs = {}
    face_probs = {}
    
    # 1. Text Analysis
    if text and text_model:
        # print(f"Analyzing text: {text[:50]}...")
        try:
            text_probs = text_model.predict(text)
        except Exception as e:
            logger.warning(f"Text analysis error: {e}")
            
    # 2. Audio Analysis
    if audio_file and audio_model:
        # print(f"Analyzing audio: {audio_file.filename}")
        try:
            # Save temp file
            suffix = os.path.splitext(audio_file.filename)[1]
            if not suffix: suffix = ".wav"
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                shutil.copyfileobj(audio_file.file, tmp)
                tmp_path = tmp.name
            
            # Predict
            audio_probs = audio_model.predict(tmp_path)
            
            # Cleanup
            os.remove(tmp_path)
        except Exception as e:
            logger.warning(f"Audio analysis error: {e}")

    # 3. Video/Face Analysis
    if image_file and video_model:
        # print(f"Analyzing image: {image_file.filename}")
        try:
            # Read image bytes
            contents = await image_file.read()
            nparr = np.frombuffer(contents, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Predict
            video_results = video_model.predict_frame(frame)
            if video_results and len(video_results) > 0:
                # Taking the first face found for simplicity
                face_probs = video_results[0]['emotions']
            else:
                 face_probs = {} # Empty dict implies "Face not detected"
                 
        except Exception as e:
            logger.warning(f"Video analysis error: {e}")

    # 4. Fusion
    fused_probs = fuse_emotions(text_probs, audio_probs, face_probs)
    
    # Determine dominant emotion
    dominant_emotion = "neutral"
    if fused_probs:
        dominant_emotion = max(fused_probs, key=fused_probs.get)
    
    # 5. Wellbeing Score
    score = calculate_wellbeing_score(fused_probs)
    
    # 6. Recommendation
    rec = generate_recommendation(dominant_emotion, score)
    
    # 7. Persistence
    save_session(user_id, score, dominant_emotion, rec, text)

    processing_time = (time.time() - start_time) * 1000

    return {
        "user_id": user_id,
        "wellbeing_score": score,
        "dominant_emotion": dominant_emotion,
        "recommendation": rec,
        "fused_emotions": fused_probs,
        "text_analysis": text_probs if text_probs else None,
        "audio_analysis": audio_probs if audio_probs else None,
        "face_analysis": face_probs if face_probs else "No face detected",
        "processing_time_ms": processing_time
    }
