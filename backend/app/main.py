from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import torch
from PIL import Image
import io
import torchvision.transforms as transforms

app = FastAPI()

# CORS setup to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # Update if deployed elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the trained TorchScript model
model = torch.jit.load("app/model/best.torchscript")
model.eval()

# Extended label map with richer recycling guidelines
LABEL_MAP = {
    0: ("cardboard", "Recycle in the cardboard bin. Remove any plastic tape or food residue."),
    1: ("glass", "Recycle in the glass bin. Rinse before recycling. Do not include ceramics or mirrors."),
    2: ("metal", "Recycle in the metal bin. Includes cans, tins, foil. Rinse before recycling."),
    3: ("paper", 
        """Recycle in the paper bin. However:
- **Clean magazine paper** can be recycled.
- **Greasy or food-stained paper** (like oily wrappers) should go to trash.
- **Plastic-coated paper** (like bread loaf nylon) is usually not recyclable – dispose in general waste unless your facility accepts it."""
    ),
    4: ("plastic", 
        """Recycle in the plastic bin. Ensure it's clean and dry.
- **Bottles, containers, jugs** are recyclable.
- **Plastic bags, wrappers, films** may not be accepted — check with local programs.
- **Avoid black plastics** unless specified recyclable."""
    ),
    5: ("trash", "Dispose in the general waste bin. Not recyclable."),
}

# Image preprocessing (should match model training preprocessing)
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