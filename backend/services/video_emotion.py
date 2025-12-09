import cv2
import numpy as np

class VideoEmotionModel:
    def __init__(self, mtcnn=True):
        """
        Initialize VideoEmotionModel using FER library.
        mtcnn=True uses a more accurate face detector.
        """
        print("Loading VideoEmotionModel (FER)...")
        try:
            from fer import FER
            self.detector = FER(mtcnn=mtcnn)
            print("VideoEmotionModel loaded.")
        except Exception as e:
            print(f"Error loading FER model: {e}")
            self.detector = None

    def detect_face(self, frame):
        """
        Detect faces in the frame. 
        Returns the bounding boxes: [x, y, w, h]
        """
        # FER internal detection is tied to prediction, but we can use OpenCV/Haar for raw detection if needed.
        # Here we will rely on FER's detect_emotions which handles detection + classification.
        pass

    def predict_frame(self, frame):
        """
        Predict emotions for faces in the given frame.
        Frame should be an image array (numpy) from OpenCV (BGR or RGB).
        """
        if self.detector is None:
            return [{"error": "Model not loaded"}]

        # FER expects RGB usually, OpenCV gives BGR
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # detect_emotions returns a list of dictionaries
        # [{'box': (x, y, w, h), 'emotions': {'angry': 0.0, ...}}]
        results = self.detector.detect_emotions(rgb_frame)
        return results

if __name__ == "__main__":
    # Simple test
    model = VideoEmotionModel(mtcnn=False) # Use Haar Cascade for speed in test
    print("Video Emotion Model initialized.")
