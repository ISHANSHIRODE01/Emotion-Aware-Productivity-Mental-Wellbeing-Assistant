import streamlit as st
import requests
import pandas as pd
import numpy as np
import time
import plotly.express as px
import plotly.graph_objects as go

# Backend URL - assume running locally
BACKEND_URL = "http://127.0.0.1:8000"

st.set_page_config(page_title="Emotion & Wellbeing Assistant", layout="wide", page_icon="🧘")

# --- Custom CSS ---
def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

try:
    local_css("frontend/style.css")
except FileNotFoundError:
    pass 

# --- Sidebar ---
with st.sidebar:
    st.image("https://img.icons8.com/clouds/200/brain.png", width=100) # Placeholder logo
    st.title("Wellbeing AI")
    st.markdown("---")
    user_name = st.text_input("Name", "Alex")
    mode = st.selectbox("Current Mode", ["Work", "Study", "Chill", "Meeting"])
    st.markdown("---")
    st.markdown("### ⚙️ Settings")
    enable_voice = st.toggle("Enable Voice Input", value=True)
    enable_camera = st.toggle("Enable Camera", value=False)

if "history" not in st.session_state:
    st.session_state.history = []

# --- Main Interface ---
# Hero Section
col1, col2 = st.columns([2, 1])
with col1:
    st.title(f"Hello, {user_name}! 👋")
    st.markdown(f"**Mode:** {mode} | **Status:** Ready to assist.")

# Input Section
st.markdown("### 🧠 How are you feeling right now?")
st.caption("Our AI fuses text, voice, and facial expressions to understand your true state.")

with st.container():
    input_col1, input_col2 = st.columns(2)
    
    with input_col1:
        st.markdown("#### 1. 📝 Journal")
        user_text = st.text_area("What's on your mind?", height=150, placeholder="I'm feeling a bit overwhelmed with the project deadline...")
        
        audio_value = None
        if enable_voice:
            st.markdown("#### 2. 🎤 Voice Note")
            audio_value = st.audio_input("Record") 
            if not audio_value: # Fallback
                 audio_value = st.file_uploader("Or upload audio", type=["wav", "mp3"])

    with input_col2:
        image_value = None
        if enable_camera:
            st.markdown("#### 3. 📸 Expression Scan")
            image_value = st.camera_input("Take a snapshot")
        else:
             st.info("Camera input is disabled. Enable it in the sidebar for facial analysis.")

# --- Analysis Button ---
st.markdown("---")
if st.button("🚀 Analyze My State", type="primary", use_container_width=True):
    with st.spinner("✨ Fusing Multi-Modal Data (Text + Audio + Video)..."):
        
        # Prepare payload
        files = {}
        data = {'user_id': user_name} 
        
        if user_text:
            data['text'] = user_text
            
        if audio_value:
            files['audio_file'] = ("audio.wav", audio_value, "audio/wav")
            
        if image_value:
            files['image_file'] = ("image.jpg", image_value, "image/jpeg")

        try:
            # Call Backend
            response = requests.post(f"{BACKEND_URL}/analyze_session", data=data, files=files)
            
            if response.status_code == 200:
                result = response.json()
                
                # --- Result Dashboard ---
                st.markdown("## 📊 Your Wellbeing Report")
                
                # metrics
                score = result.get("wellbeing_score", 50)
                dominant = result.get("dominant_emotion", "Neutral")
                rec = result.get("recommendation", "No recommendation.")
                proc_time = result.get("processing_time_ms", 0)
                
                m1, m2, m3, m4 = st.columns(4)
                m1.metric("Wellbeing Score", f"{score}/100", delta=score-50)
                m2.metric("Dominant Emotion", dominant.title())
                m3.metric("Latency", f"{int(proc_time)}ms")
                m4.metric("Source", "AI Fusion")
                
                # Recommendation Hero Card
                st.info(f"💡 **AI Recommendation:** {rec}", icon="🧠")
                
                # Charts
                c1, c2 = st.columns([1, 1])
                
                fused = result.get("fused_emotions", {})
                
                with c1:
                    st.markdown("### Emotion Radar")
                    if fused:
                        # Radar Chart logic
                        categories = list(fused.keys())
                        values = list(fused.values())
                        
                        fig = go.Figure()
                        fig.add_trace(go.Scatterpolar(
                              r=values,
                              theta=categories,
                              fill='toself',
                              name='Current State',
                              line_color='#FF4B4B'
                        ))
                        fig.update_layout(
                          polar=dict(
                            radialaxis=dict(
                              visible=True,
                              range=[0, 1]
                            )),
                          showlegend=False,
                          margin=dict(l=40, r=40, t=20, b=20),
                          paper_bgcolor='rgba(0,0,0,0)',
                          plot_bgcolor='rgba(0,0,0,0)',
                        )
                        st.plotly_chart(fig, use_container_width=True)

                with c2:
                    st.markdown("### Confidence Distribution")
                    if fused:
                        # Bar chart using Plotly Express for better aesthetics
                        df = pd.DataFrame(list(fused.items()), columns=["Emotion", "Probability"])
                        fig_bar = px.bar(df, x='Emotion', y='Probability', 
                                         color='Probability', 
                                         color_continuous_scale='Bluered_r')
                        fig_bar.update_layout(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
                        st.plotly_chart(fig_bar, use_container_width=True)

                st.success("Session saved to secure database.")

            else:
                st.error(f"Error: {response.status_code} - {response.text}")
                
        except requests.exceptions.ConnectionError:
            st.error("🔴 Could not connect to Backend. Is it running?")
        except Exception as e:
            st.error(f"An error occurred: {e}")

# --- Analytics Tab (Persistent) ---
st.markdown("---")
st.markdown("### 📅 History & Trends")

if st.button("Refresh History"):
    try:
        resp = requests.get(f"{BACKEND_URL}/history", params={"user_id": user_name})
        if resp.status_code == 200:
            history_data = resp.json()
            if history_data:
                df_hist = pd.DataFrame(history_data)
                df_hist['timestamp'] = pd.to_datetime(df_hist['timestamp'])
                df_hist = df_hist.sort_values('timestamp')
                
                # Timeline
                fig_line = px.line(df_hist, x='timestamp', y='wellbeing_score', 
                                   markers=True, title='Wellbeing Timeline',
                                   template="plotly_dark")
                fig_line.update_traces(line_color='#FF914D')
                st.plotly_chart(fig_line, use_container_width=True)
                
                # Data Table
                st.dataframe(
                    df_hist[['timestamp', 'wellbeing_score', 'dominant_emotion', 'recommendation']].sort_values('timestamp', ascending=False),
                    use_container_width=True
                )
            else:
                st.caption("No history yet.")
    except Exception as e:
        st.warning(f"Could not load history: {e}")
