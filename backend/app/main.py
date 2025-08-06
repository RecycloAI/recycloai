from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
from PIL import Image
import io
import torchvision.transforms as transforms

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Adjust if your frontend is hosted elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model
model = torch.jit.load("app/model/best.torchscript")
model.eval()

# Class index to label and disposal guideline
LABEL_MAP = {
    0: ("cardboard", "Recycle in the cardboard bin."),
    1: ("glass", "Recycle in the glass bin."),
    2: ("metal", "Recycle in the metals bin."),
    3: ("paper", "Recycle in the paper bin."),
    4: ("plastic", "Recycle in the plastics bin."),
    5: ("trash", "Dispose in the general waste bin."),
}

# Preprocessing
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
