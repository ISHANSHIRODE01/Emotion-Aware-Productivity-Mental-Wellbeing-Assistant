import numpy as np

# Standard set of emotions for the system
EMOTIONS = ['happy', 'sad', 'angry', 'fear', 'disgust', 'surprise', 'neutral']

def normalize_emotion_dict(emotion_dict):
    """
    Normalize emotion dictionary keys to standard set.
    e.g. 'joy' -> 'happy', 'sadness' -> 'sad'
    """
    normalized = {e: 0.0 for e in EMOTIONS}
    if not emotion_dict:
        return normalized

    for k, v in emotion_dict.items():
        k_lower = k.lower()
        if k_lower == 'joy':
            normalized['happy'] = v
        elif k_lower == 'sadness':
            normalized['sad'] = v
        elif k_lower in normalized:
            normalized[k_lower] = v
    
    return normalized

def fuse_emotions(text_probs=None, audio_probs=None, face_probs=None, weights=None):
    """
    Fuse emotion probabilities from multiple modalities.
    Inputs are dictionaries of {emotion: probability}.
    Returns a dictionary of {emotion: fused_probability}.
    """
    if weights is None:
        weights = {"text": 0.33, "audio": 0.33, "face": 0.34}

    # Normalize inputs to ensure common keys
    p_text = normalize_emotion_dict(text_probs)
    p_audio = normalize_emotion_dict(audio_probs)
    p_face = normalize_emotion_dict(face_probs)

    fused_probs = {e: 0.0 for e in EMOTIONS}
    
    # Calculate valid total weight (handle missing modalities)
    total_weight = 0.0
    if text_probs: total_weight += weights.get('text', 0)
    if audio_probs: total_weight += weights.get('audio', 0)
    if face_probs: total_weight += weights.get('face', 0)

    if total_weight == 0:
        return fused_probs # Return all zeros if no input

    # Weighted sum
    for e in EMOTIONS:
        val = 0.0
        if text_probs:
            val += weights.get('text', 0) * p_text[e]
        if audio_probs:
            val += weights.get('audio', 0) * p_audio[e]
        if face_probs:
            val += weights.get('face', 0) * p_face[e]
        
        fused_probs[e] = val / total_weight

    return fused_probs

def calculate_wellbeing_score(fused_probs):
    """
    Calculate a Wellbeing Score (0-100) based on fused emotion probabilities.
    Score rules:
    - Happy: High positive contribution
    - Neutral/Surprise: Moderate/Neutral contribution
    - Sad/Angry/Fear/Disgust: Low (negative impact)
    """
    # Define score for each emotion (0-100 scale)
    emotion_scores = {
        'happy': 100,
        'neutral': 60,   # Baseline state
        'surprise': 60,
        'sad': 20,
        'angry': 10,
        'fear': 10,
        'disgust': 10
    }
    
    score = 0.0
    for e, prob in fused_probs.items():
        score += prob * emotion_scores.get(e, 50)
        
    return round(score, 2)
