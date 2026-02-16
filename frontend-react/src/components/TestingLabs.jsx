import { motion } from 'framer-motion';
import { Code, Headphones, Image } from 'lucide-react';
import './TestingLabs.css';

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

function TestingLabs() {
    const textSamples = [
        "I'm feeling so happy and productive today! Everything is going great.",
        "I am really stressed about the upcoming deadline, it feels overwhelming.",
        "I don't know, I'm just feeling a bit bored and neutral today."
    ];

    const audioSamples = [
        { name: 'Happy Voice Sample', url: 'https://github.com/RAID-Project/RAID/raw/master/data/audio/happy.wav' },
        { name: 'Sad Voice Sample', url: 'https://github.com/RAID-Project/RAID/raw/master/data/audio/sad.wav' }
    ];

    return (
        <motion.div
            className="testing-labs"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants}>
                <h1>🧪 Testing Labs</h1>
                <p className="subtitle">
                    Use these sample inputs to verify that the AI Fusion engine is working across all modalities.
                </p>
            </motion.div>

            <div className="labs-grid">
                <motion.div className="lab-card" variants={itemVariants}>
                    <div className="lab-header">
                        <Code size={32} />
                        <h2>📝 Text Samples</h2>
                    </div>
                    <p className="lab-description">Copy these sample prompts to test text emotion analysis:</p>

                    <div className="samples-list">
                        {textSamples.map((sample, index) => (
                            <motion.div
                                key={index}
                                className="sample-item"
                                whileHover={{ scale: 1.02 }}
                                onClick={() => navigator.clipboard.writeText(sample)}
                            >
                                <code>{sample}</code>
                                <span className="copy-hint">Click to copy</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="lab-card" variants={itemVariants}>
                    <div className="lab-header">
                        <Headphones size={32} />
                        <h2>🎤 Voice Samples</h2>
                    </div>
                    <p className="lab-description">Download these sample WAV files to test audio analysis:</p>

                    <div className="samples-list">
                        {audioSamples.map((sample, index) => (
                            <motion.a
                                key={index}
                                href={sample.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sample-link"
                                whileHover={{ scale: 1.02 }}
                            >
                                <span>🔊 {sample.name}</span>
                                <span className="download-icon">↓</span>
                            </motion.a>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="lab-card full-width" variants={itemVariants}>
                    <div className="lab-header">
                        <Image size={32} />
                        <h2>📸 Visual Testing</h2>
                    </div>
                    <div className="visual-testing-content">
                        <div className="info-box">
                            <h3>Testing Tips</h3>
                            <ul>
                                <li>Upload a high-quality portrait photo in the Dashboard tab</li>
                                <li>Ensure the lighting is clear and the face is centered</li>
                                <li>The photo should show clear facial expressions</li>
                                <li>Supported formats: JPG, JPEG, PNG</li>
                            </ul>
                        </div>

                        <div className="info-box">
                            <h3>Best Practices</h3>
                            <ul>
                                <li>Use natural lighting for best results</li>
                                <li>Face should occupy at least 30% of the image</li>
                                <li>Avoid sunglasses or face coverings</li>
                                <li>Neutral background works best</li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div className="quick-start-card" variants={itemVariants}>
                <h2>🚀 Quick Start Guide</h2>
                <div className="steps-grid">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Choose Input</h3>
                        <p>Select text, audio, or image input from the samples above</p>
                    </div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Go to Dashboard</h3>
                        <p>Navigate to the Wellbeing Dashboard tab</p>
                    </div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Analyze</h3>
                        <p>Click "Analyze My State" to see results</p>
                    </div>
                    <div className="step">
                        <div className="step-number">4</div>
                        <h3>Review</h3>
                        <p>Check your wellbeing score and recommendations</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default TestingLabs;
