import torch
from PIL import Image
import io

MODEL_PATH = "app/model/best.torchscript"
CLASSES = ["Organic", "Plastic", "Paper", "Metal", "Glass"]  # Update with your classes

def load_model():
    return torch.jit.load(MODEL_PATH, map_location="cpu")

def predict_image(image_bytes):
    model = load_model()
    image = Image.open(io.BytesIO(image_bytes))
    # Add your preprocessing here (resize/normalize)
    tensor = torch.Tensor(image)  # Simplified - adjust for your model
    outputs = model(tensor)
    _, predicted = torch.max(outputs, 1)
    return CLASSES[predicted.item()]