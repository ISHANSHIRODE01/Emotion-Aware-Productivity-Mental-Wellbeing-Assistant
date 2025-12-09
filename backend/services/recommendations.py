import random

def generate_recommendation(emotion_label, wellbeing_score, history=None):
    """
    Generate a productivity/wellbeing recommendation based on current state.
    Uses random variation to feel less robotic.
    """
    if history is None:
        history = []

    # High Stress / Low Score (< 30)
    if wellbeing_score < 30:
        options = [
            f"Your stress levels seem high ({emotion_label}). Stop everything for 5 minutes. Close your eyes and breathe.",
            "It looks like you're struggling. A 10-minute walk outside can reduce cortisol by 20%. Please take a break.",
            "Productivity requires energy, and you're running on empty. Go drink a full glass of water and stretch.",
            "Detected high tension. Try the '4-7-8 Breathing Method': Inhale for 4s, hold for 7s, exhale for 8s."
        ]
        return random.choice(options)
    
    # Moderate / Tired (< 50)
    if wellbeing_score < 55:
        options = [
            "You might be getting mentally tired. Switch to 'Passive Work' (emails, organizing) for the next 30 mins.",
            "Energy is dipping. A quick 15-minute power nap or a coffee break could reset your focus.",
            f"I sense some {emotion_label}. Playing some lofi beats or instrumental music might help smooth the workflow.",
            "Don't push too hard. The Pomodoro technique (25m work / 5m break) is perfect for this energy level."
        ]
        return random.choice(options)
    
    # Good Flow (55 - 79)
    if wellbeing_score < 80:
        options = [
            "Your energy is steady. It's a good time for routine tasks or organizing your day.",
            "You are in a stable mood. Try tackling that one task you've been putting off.",
            "Good balance. Maintain this rhythm by staying hydrated.",
            f"Feeling {emotion_label} is okay. Channel it into steady progress."
        ]
        return random.choice(options)

    # Peak State (>= 80)
    return random.choice([
        "You're in a great state! This is your 'Golden Hour'. Block distractions and do Deep Work.",
        "Excellent mood detected! Use this high energy to brainstorm creative solutions or solve complex problems.",
        "You are firing on all cylinders. Challenge yourself with the hardest item on your todo list right now.",
        "Peak performance detected! Keep riding this wave 🌊."
    ])
