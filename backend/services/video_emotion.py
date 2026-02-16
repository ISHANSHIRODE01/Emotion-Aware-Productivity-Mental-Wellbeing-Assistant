import cv2
import numpy as np

class VideoEmotionModel:
    def __init__(self, mtcnn=False):
        """
        Initialize VideoEmotionModel using FER library.
        Falls back to neutral emotions if FER is not available (for deployment).
        """
        print("Loading VideoEmotionModel (FER)...")
        self.detector = None
        self.fer_available = False
        
        try:
            from fer.fer import FER
            self.detector = FER(mtcnn=mtcnn)
            self.fer_available = True
            print("✓ VideoEmotionModel loaded with FER.")
        except ImportError:
            print("⚠ FER not available - video emotion analysis disabled (deployment mode)")
            print("  Install 'fer' and 'tensorflow' for full functionality")
        except Exception as e:
            print(f"⚠ Error loading FER model: {e}")

    def detect_face(self, frame):
        """
        Detect faces in the frame. 
        Returns the bounding boxes: [x, y, w, h]
        """
        # FER internal detection is tied to prediction
        pass

    def predict_frame(self, frame):
        """
        Predict emotions for faces in the given frame.
        Frame should be an image array (numpy) from OpenCV (BGR or RGB).
        Returns neutral emotions if FER is unavailable.
        """
        if not self.fer_available or self.detector is None:
            # Return neutral emotions when FER is not available
            return [{
                'box': (0, 0, frame.shape[1], frame.shape[0]),
                'emotions': {
                    'angry': 0.0,
                    'disgust': 0.0,
                    'fear': 0.0,
                    'happy': 0.0,
                    'sad': 0.0,
                    'surprise': 0.0,
                    'neutral': 1.0
                }
            }]

        # FER expects RGB, OpenCV gives BGR
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # detect_emotions returns a list of dictionaries
        # [{'box': (x, y, w, h), 'emotions': {'angry': 0.0, ...}}]
        results = self.detector.detect_emotions(rgb_frame)
        
        # If no faces detected, return neutral
        if not results:
            return [{
                'box': (0, 0, frame.shape[1], frame.shape[0]),
                'emotions': {
                    'angry': 0.0,
                    'disgust': 0.0,
                    'fear': 0.0,
                    'happy': 0.0,
                    'sad': 0.0,
                    'surprise': 0.0,
                    'neutral': 1.0
                }
            }]
        
        return results

if __name__ == "__main__":
    # Simple test
    model = VideoEmotionModel(mtcnn=False)
    print("Video Emotion Model initialized.")
