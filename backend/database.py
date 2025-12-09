import sqlite3
import datetime
from typing import List, Dict, Any

DB_NAME = "data/wellbeing.db"

def init_db():
    """Initialize the SQLite database and create tables if they don't exist."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            wellbeing_score REAL,
            dominant_emotion TEXT,
            recommendation TEXT,
            text_snippet TEXT
        )
    ''')
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {DB_NAME}")

def save_session(user_id: str, score: float, emotion: str, recommendation: str, text: str = ""):
    """Save a session to the database."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    c.execute('''
        INSERT INTO sessions (user_id, wellbeing_score, dominant_emotion, recommendation, text_snippet)
        VALUES (?, ?, ?, ?, ?)
    ''', (user_id, score, emotion, recommendation, text[:500] if text else "")) # Truncate text if too long
    
    conn.commit()
    conn.close()

def get_user_history(user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieve history for a user."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row # Return rows as dict-like objects
    c = conn.cursor()
    
    c.execute('''
        SELECT * FROM sessions 
        WHERE user_id = ? 
        ORDER BY timestamp DESC 
        LIMIT ?
    ''', (user_id, limit))
    
    rows = c.fetchall()
    conn.close()
    
    return [dict(row) for row in rows]

# Initialize DB on module import (or can be called explicitly)
init_db()
