import torch

# Path to the directory-based TorchScript model
model_path = "app/model/best.torchscript"

# Load the model
model = torch.jit.load(model_path)
model.eval()

# Dummy inference (example)
import torchvision.transforms as transforms
from PIL import Image

# Load a sample image
image = Image.open("test.jpg").convert("RGB")
transform = transforms.Compose([
    transforms.Resize((224, 224)),  # or model's input size
    transforms.ToTensor(),
])
input_tensor = transform(image).unsqueeze(0)

# Run prediction
with torch.no_grad():
    output = model(input_tensor)
    predicted_class = output.argmax().item()

print("Predicted class:", predicted_class)
