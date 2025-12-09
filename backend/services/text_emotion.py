from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np

class TextEmotionModel:
    def __init__(self, model_name="j-hartmann/emotion-english-distilroberta-base"):
        print(f"Loading TextEmotionModel: {model_name}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.labels = self.model.config.id2label
        print("TextEmotionModel loaded.")

    def predict(self, text: str):
        """
        Predict emotion from text.
        Returns a dictionary mapping emotion labels to probabilities.
        """
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = self.model(**inputs)
        
        probs = torch.softmax(outputs.logits, dim=-1)[0].numpy()
        
        # Map to labels
        results = {self.labels[i]: float(probs[i]) for i in range(len(probs))}
        
        # Sort by probability descending
        sorted_results = dict(sorted(results.items(), key=lambda item: item[1], reverse=True))
        return sorted_results
