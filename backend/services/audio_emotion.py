from transformers import pipeline
import numpy as np

class AudioEmotionModel:
    def __init__(self, model_name="superb/wav2vec2-base-superb-er"):
        """
        Initialize AudioEmotionModel using HuggingFace Transformers.
        Downloads a pre-trained Speech Emotion Recognition model.
        """
        print(f"Loading AudioEmotionModel: {model_name}...")
        try:
            # simple 'audio-classification' pipeline handles loading and prediction
            self.classifier = pipeline("audio-classification", model=model_name)
            print("AudioEmotionModel loaded (Transformer).")
        except Exception as e:
            print(f"Error loading Audio emotion model: {e}")
            self.classifier = None

    def predict(self, file_path):
        """
        Predict emotion from audio file using the Transformer pipeline.
        """
        if self.classifier is None:
            return {"error": "Model not loaded"}
            
        try:
            # Pipeline accepts file path directly
            # top_k=None returns all labels
            predictions = self.classifier(file_path, top_k=None)
            
            # Format: [{'score': 0.9, 'label': 'happy'}, ...]
            results = {}
            for p in predictions:
                label = p['label']
                score = p['score']
                
                # Standardize labels from 'superb-er' model (neu, hap, ang, sad) to our keys
                if label == 'neu': label = 'neutral'
                elif label == 'hap': label = 'happy'
                elif label == 'ang': label = 'angry'
                elif label == 'sad': label = 'sad'
                
                results[label] = float(score)
            
            return dict(sorted(results.items(), key=lambda item: item[1], reverse=True))

        except Exception as e:
            print(f"Error predicting audio: {e}")
            return {"error": str(e)}

if __name__ == "__main__":
    # Test
    model = AudioEmotionModel()
    print("Model initialized.")
