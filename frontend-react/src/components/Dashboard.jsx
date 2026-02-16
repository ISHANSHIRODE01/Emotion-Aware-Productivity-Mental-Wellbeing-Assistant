import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Mic, Camera, TrendingUp, Zap, FileAudio, Image as ImageIcon, Check } from 'lucide-react';
import axios from 'axios';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import Webcam from 'react-webcam';
import { ReactMediaRecorder } from "react-media-recorder";
import './Dashboard.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 }
    }
};

function Dashboard({ userName }) {
    const [text, setText] = useState('');

    // Audio State
    const [audioMode, setAudioMode] = useState('upload'); // 'upload' or 'record'
    const [audioFile, setAudioFile] = useState(null);

    // Video State
    const [videoMode, setVideoMode] = useState('upload'); // 'upload' or 'camera'
    const [imageFile, setImageFile] = useState(null);

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);

    // Camera Refs
    const webcamRef = useRef(null);
    const [capturedImage, setCapturedImage] = useState(null);

    const handleAnalyze = async () => {
        if (!text && !audioFile && !imageFile) {
            alert('Please provide at least one input (text, audio, or image)');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('user_id', userName);
        if (text) formData.append('text', text);
        if (audioFile) formData.append('audio_file', audioFile);
        if (imageFile) formData.append('image_file', imageFile);

        try {
            const response = await axios.post(`${BACKEND_URL}/analyze_session`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setResult(response.data);
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Failed to analyze. Make sure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        try {
            const response = await axios.get(`${BACKEND_URL}/history`, {
                params: { user_id: userName }
            });
            setHistory(response.data);
        } catch (error) {
            console.error('History error:', error);
        }
    };

    // Helper Functions for Camera
    const capturePhoto = () => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
        // Convert base64 to File
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                setImageFile(file);
            });
    };

    const retakePhoto = () => {
        setCapturedImage(null);
        setImageFile(null);
    };

    // Helper for Audio Recording
    const handleStopRecording = (blobUrl, blob) => {
        const file = new File([blob], "recording.wav", { type: "audio/wav" });
        setAudioFile(file);
    };

    const prepareRadarData = () => {
        if (!result?.fused_emotions) return [];
        return Object.entries(result.fused_emotions).map(([emotion, value]) => ({
            emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
            value: value
        }));
    };

    const prepareBarData = () => {
        if (!result?.fused_emotions) return [];
        return Object.entries(result.fused_emotions).map(([emotion, probability]) => ({
            emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
            probability: probability
        }));
    };

    const prepareHistoryData = () => {
        return history.map(item => ({
            time: new Date(item.timestamp).toLocaleTimeString(),
            score: item.wellbeing_score
        }));
    };

    return (
        <motion.div
            className="dashboard"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Input Section */}
            <motion.div className="input-section" variants={itemVariants}>
                <h2>🧠 How are you feeling right now?</h2>
                <p className="subtitle">Our AI fuses text, voice, and facial expressions to understand your true state.</p>

                <div className="input-grid">
                    {/* Text Journal */}
                    <div className="input-card">
                        <h3>📝 Journal</h3>
                        <textarea
                            className="textarea"
                            placeholder="What's on your mind? I'm feeling a bit overwhelmed with the project deadline..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    </div>

                    {/* Audio Input */}
                    <div className="input-card">
                        <div className="card-header">
                            <h3>🎤 Voice Note</h3>
                            <div className="mode-toggle">
                                <button
                                    className={`toggle-btn ${audioMode === 'upload' ? 'active' : ''}`}
                                    onClick={() => setAudioMode('upload')}
                                    title="Upload File"
                                >
                                    <Upload size={16} />
                                </button>
                                <button
                                    className={`toggle-btn ${audioMode === 'record' ? 'active' : ''}`}
                                    onClick={() => setAudioMode('record')}
                                    title="Record Live"
                                >
                                    <Mic size={16} />
                                </button>
                            </div>
                        </div>

                        {audioMode === 'upload' ? (
                            <motion.label
                                className="file-upload"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <FileAudio size={32} />
                                <p>{audioFile ? audioFile.name : 'Upload Audio File'}</p>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setAudioFile(e.target.files[0])}
                                />
                            </motion.label>
                        ) : (
                            <div className="recorder-container">
                                <ReactMediaRecorder
                                    audio
                                    onStop={handleStopRecording}
                                    render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                                        <div className="audio-controls">
                                            <div className="status-badge" data-status={status}>
                                                {status === 'recording' ? '🔴 Recording...' : status === 'stopped' ? '✅ Ready' : '⚫ Idle'}
                                            </div>
                                            <div className="buttons-row">
                                                <button
                                                    className="btn-secondary"
                                                    onClick={startRecording}
                                                    disabled={status === 'recording'}
                                                >
                                                    Start
                                                </button>
                                                <button
                                                    className="btn-secondary"
                                                    onClick={stopRecording}
                                                    disabled={status !== 'recording'}
                                                >
                                                    Stop
                                                </button>
                                            </div>
                                            {mediaBlobUrl && (
                                                <audio src={mediaBlobUrl} controls className="audio-player" />
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    {/* Video Input */}
                    <div className="input-card">
                        <div className="card-header">
                            <h3>📸 Expression Scan</h3>
                            <div className="mode-toggle">
                                <button
                                    className={`toggle-btn ${videoMode === 'upload' ? 'active' : ''}`}
                                    onClick={() => setVideoMode('upload')}
                                    title="Upload Photo"
                                >
                                    <Upload size={16} />
                                </button>
                                <button
                                    className={`toggle-btn ${videoMode === 'camera' ? 'active' : ''}`}
                                    onClick={() => setVideoMode('camera')}
                                    title="Use Camera"
                                >
                                    <Camera size={16} />
                                </button>
                            </div>
                        </div>

                        {videoMode === 'upload' ? (
                            <motion.label
                                className="file-upload"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <ImageIcon size={32} />
                                <p>{imageFile ? imageFile.name : 'Upload Photo'}</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                />
                            </motion.label>
                        ) : (
                            <div className="camera-wrapper">
                                {capturedImage ? (
                                    <div className="capture-preview">
                                        <img src={capturedImage} alt="Captured" />
                                        <button className="btn-secondary retake-btn" onClick={retakePhoto}>
                                            Retake
                                        </button>
                                    </div>
                                ) : (
                                    <div className="webcam-container">
                                        <Webcam
                                            audio={false}
                                            ref={webcamRef}
                                            screenshotFormat="image/jpeg"
                                            className="webcam-view"
                                            videoConstraints={{ facingMode: "user" }}
                                        />
                                        <button className="btn-secondary capture-btn" onClick={capturePhoto}>
                                            Capture
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <motion.button
                    className="btn-primary"
                    onClick={handleAnalyze}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    {loading ? (
                        <>
                            <div className="spinner-small"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Zap size={20} />
                            Analyze My State
                        </>
                    )}
                </motion.button>
            </motion.div>

            {/* Results Section */}
            {result && (
                <motion.div
                    className="results-section"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                >
                    <h2>📊 Your Wellbeing Report</h2>

                    {/* Metrics */}
                    <div className="metrics-grid">
                        <motion.div
                            className="metric-card"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="metric-label">Wellbeing Score</div>
                            <div className="metric-value">{result.wellbeing_score}/100</div>
                            <div className={`metric-delta ${result.wellbeing_score > 50 ? 'positive' : 'negative'}`}>
                                {result.wellbeing_score > 50 ? '↑' : '↓'} {Math.abs(result.wellbeing_score - 50).toFixed(1)}
                            </div>
                        </motion.div>

                        <motion.div
                            className="metric-card"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="metric-label">Dominant Emotion</div>
                            <div className="metric-value">{result.dominant_emotion}</div>
                        </motion.div>

                        <motion.div
                            className="metric-card"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="metric-label">Latency</div>
                            <div className="metric-value">{Math.round(result.processing_time_ms)}ms</div>
                        </motion.div>

                        <motion.div
                            className="metric-card"
                            whileHover={{ scale: 1.05 }}
                        >
                            <div className="metric-label">Source</div>
                            <div className="metric-value">AI Fusion</div>
                        </motion.div>
                    </div>

                    {/* Recommendation */}
                    <motion.div
                        className="recommendation-card"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                    >
                        <h3>💡 AI Recommendation</h3>
                        <p>{result.recommendation}</p>
                    </motion.div>

                    {/* Charts */}
                    <div className="charts-grid">
                        <div className="chart-container">
                            <h3>Emotion Radar</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={prepareRadarData()}>
                                    <PolarGrid stroke="rgba(255, 75, 75, 0.2)" />
                                    <PolarAngleAxis dataKey="emotion" />
                                    <PolarRadiusAxis angle={90} domain={[0, 1]} />
                                    <Radar
                                        name="Current State"
                                        dataKey="value"
                                        stroke="#FF4B4B"
                                        fill="#FF4B4B"
                                        fillOpacity={0.6}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="chart-container">
                            <h3>Confidence Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prepareBarData()}>
                                    <XAxis dataKey="emotion" />
                                    <YAxis domain={[0, 1]} />
                                    <Tooltip />
                                    <Bar dataKey="probability" fill="#FF4B4B" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* History Section */}
            <motion.div className="history-section" variants={itemVariants}>
                <h2>📅 History & Trends</h2>
                <button className="btn-secondary" onClick={loadHistory}>
                    <TrendingUp size={18} />
                    Refresh History
                </button>

                {history.length > 0 && (
                    <div className="chart-container" style={{ marginTop: '1rem' }}>
                        <h3>Wellbeing Timeline</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={prepareHistoryData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis dataKey="time" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#FF914D"
                                    strokeWidth={3}
                                    dot={{ fill: '#FF4B4B', r: 5 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
}

export default Dashboard;
