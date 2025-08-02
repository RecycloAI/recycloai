from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
from PIL import Image
import io
import torchvision.transforms as transforms

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Adjust if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
model = torch.jit.load("app/model/best.torchscript")
model.eval()

# Define label to guideline mapping
LABEL_MAP = {
    0: ("white-glass", "Recycle in the white glass bin."),
    1: ("trash", "Dispose in the general waste bin."),
    2: ("shoes", "Donate if wearable, otherwise dispose."),
    3: ("plastic", "Recycle in the plastics bin."),
    4: ("paper", "Recycle in the paper bin."),
    5: ("metal", "Recycle in the metals bin."),
    6: ("green-glass", "Recycle in the green glass bin."),
    7: ("clothes", "Donate or recycle textiles."),
    8: ("cardboard", "Recycle in the cardboard bin."),
    9: ("brown-glass", "Recycle in the brown glass bin."),
    10: ("biological", "Compost if possible."),
    11: ("battery", "Take to a battery collection point."),
}

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
])

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    input_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(input_tensor)
        predicted_class = torch.argmax(output, dim=1).item()

    label, guideline = LABEL_MAP.get(predicted_class, ("Unknown", "No guideline available."))

    return {
        "predicted_class": predicted_class,
        "predicted_label": label,
        "guideline": guideline
    }
