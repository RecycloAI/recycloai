import torch

model_path = "app/model/best.torchscript"

try:
    model = torch.jit.load(model_path)
    model.eval()
    print("✅ Model loaded successfully!")
except Exception as e:
    print("❌ Error loading model:", e)
