# backend/app/utils/predict.py
import torch
from torchvision import transforms
from PIL import Image
import io

def load_model():
    model = torch.jit.load("app/model/best.torchscript", map_location=torch.device("cpu"))
    model.eval()
    return model

def predict_image(image_bytes, model):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    preprocess = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])
    input_tensor = preprocess(image).unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)[0]
        class_index = output.argmax().item()
        class_name = model.names[class_index]

    return class_name