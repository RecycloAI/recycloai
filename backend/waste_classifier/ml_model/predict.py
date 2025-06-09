# waste_classifier/ml_model/predict.py
import torch
from torchvision import transforms
from PIL import Image

# TODO: model = torch.load('waste_classifier/ml_model/model.pth')
# TODO: model.eval()

def classify_waste(image_path):
    img = Image.open(image_path)
    transform = transforms.Compose([transforms.Resize(256), transforms.ToTensor()])
    img_tensor = transform(img).unsqueeze(0)
    output = model(img_tensor)
    return output  # Return predicted class