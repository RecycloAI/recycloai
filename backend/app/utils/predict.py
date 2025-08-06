# model/predictor.py

import torch
from PIL import Image
from torchvision import transforms

# Load the model once
model = torch.jit.load("app/model/best.torchscript")
model.eval()

# Define transform
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

# Waste type labels 
labels = ['cardboard', 'glass', 'metal', 'paper', 'plastic', 'trash']

def predict_image(image: Image.Image):
    img_tensor = transform(image).unsqueeze(0)  # [1, 3, 224, 224]
    with torch.no_grad():
        outputs = model(img_tensor)
        predicted_class = outputs.argmax(1).item()
        return labels[predicted_class]
