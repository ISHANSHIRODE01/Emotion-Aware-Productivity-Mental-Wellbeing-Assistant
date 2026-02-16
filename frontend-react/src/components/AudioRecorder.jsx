import { ReactMediaRecorder } from "react-media-recorder";
import { Mic, Check, RotateCcw } from "lucide-react";
// Import styles if needed

const AudioRecorder = ({ onRecordingComplete }) => {
    return (
        <div className="audio-recorder">
            <ReactMediaRecorder
                audio
                onStop={(blobUrl, blob) => {
                    // Create a File object from the blob
                    const file = new File([blob], "recording.wav", { type: "audio/wav" });
                    onRecordingComplete(file);
                }}
                render={({ status, startRecording, stopRecording, mediaBlobUrl }) => (
                    <div className="recorder-controls" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                        <div className="status-indicator" style={{
                            color: status === 'recording' ? '#ef4444' : 'var(--text-secondary)',
                            fontWeight: 'bold',
                            fontSize: '0.875rem'
                        }}>
                            Status: {status}
                        </div>

                        <div className="button-group" style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className={`btn-secondary ${status === 'recording' ? 'active' : ''}`}
                                onClick={startRecording}
                                disabled={status === 'recording'}
                                style={{ flex: 1 }}
                            >
                                <Mic size={18} /> Record
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={stopRecording}
                                disabled={status !== 'recording'}
                                style={{ flex: 1 }}
                            >
                                Stop
                            </button>
                        </div>

                        {mediaBlobUrl && (
                            <div className="preview-audio" style={{ width: '100%' }}>
                                <audio src={mediaBlobUrl} controls style={{ width: '100%', marginTop: '0.5rem' }} />
                            </div>
                        )}
                    </div>
                )}
            />
        </div>
    );
};

export default AudioRecorder;
