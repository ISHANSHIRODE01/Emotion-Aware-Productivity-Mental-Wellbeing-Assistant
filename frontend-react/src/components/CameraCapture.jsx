import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

function CameraCapture({ onCapture }) {
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [imgSrc, setImgSrc] = useState(null);
    const webcamRef = useRef(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImgSrc(imageSrc);

        // Convert base64 to blob/file
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                onCapture(file);
            });
    }, [webcamRef, onCapture]);

    const retake = () => {
        setImgSrc(null);
        onCapture(null);
    };

    const closeCamera = () => {
        setIsCameraOpen(false);
        setImgSrc(null);
    };

    if (!isCameraOpen) {
        return (
            <button
                className="btn-secondary"
                onClick={() => setIsCameraOpen(true)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
                <Camera size={20} />
                Open Camera
            </button>
        );
    }

    return (
        <div className="camera-container" style={{ textAlign: 'center' }}>
            {imgSrc ? (
                <div className="preview-container">
                    <img src={imgSrc} alt="captured" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem' }} />
                    <div className="camera-controls" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-secondary" onClick={retake}>
                            <RefreshCw size={20} /> Retake
                        </button>
                        <button className="btn-primary" onClick={closeCamera}>
                            <Check size={20} /> Done
                        </button>
                    </div>
                </div>
            ) : (
                <div className="webcam-wrapper">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        width="100%"
                        videoConstraints={{ facingMode: "user" }}
                        style={{ borderRadius: '8px', marginBottom: '1rem' }}
                    />
                    <div className="camera-controls" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn-secondary" onClick={closeCamera}>
                            <X size={20} /> Cancel
                        </button>
                        <button className="btn-primary" onClick={capture}>
                            <Camera size={20} /> Capture
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CameraCapture;
