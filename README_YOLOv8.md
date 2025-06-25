# 🗑️ RecycloAI - YOLOv8 Waste Classification Setup

This guide will help you set up and train a YOLOv8 model for waste classification using your Google Drive dataset.

## 📋 Prerequisites

- Google Colab account (free)
- Your waste classification dataset from Google Drive
- Basic Python knowledge

## 🚀 Quick Start

### Step 1: Download Your Dataset

1. Go to your [Google Drive folder](https://drive.google.com/drive/folders/1p83dWFqfpa5z4sm4bXU2z4npOIyQNZtT?usp=sharing)
2. Select all folders (battery, biological, brown-glass, etc.)
3. Right-click → "Download"
4. Extract the ZIP file to your local machine

### Step 2: Prepare Your Dataset

Run the setup script to organize your data:

```bash
python yolov8_setup.py
```

This will:
- Create the necessary directory structure
- Extract your dataset (if it's a ZIP file)
- Convert images to YOLO format
- Create training/validation/test splits
- Generate the YAML configuration file

### Step 3: Upload to Google Colab

1. Go to [Google Colab](https://colab.research.google.com/)
2. Create a new notebook
3. Upload your prepared dataset folder
4. Copy and paste the training code from the notebook below

## 📊 Dataset Categories

Your dataset includes 12 waste categories:
- battery
- biological
- brown-glass
- cardboard
- clothes
- green-glass
- metal
- paper
- plastic
- shoes
- trash
- white-glass

## 🎯 Training Configuration

The model will be trained with:
- **Model**: YOLOv8n (nano) - fast and efficient
- **Image size**: 640x640 pixels
- **Batch size**: 16
- **Epochs**: 100 (with early stopping)
- **Split ratio**: 70% train, 20% validation, 10% test

## 📈 Expected Results

With a good dataset, you can expect:
- **mAP50**: 0.85+ (85% accuracy)
- **Training time**: 2-4 hours on Colab GPU
- **Model size**: ~6MB (YOLOv8n)

## 🔧 Google Colab Training Notebook

Copy this code into your Colab notebook:

```python
# Install dependencies
!pip install ultralytics
!pip install roboflow
!pip install opencv-python pillow matplotlib seaborn pandas numpy

# Import libraries
import os
import cv2
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
import shutil
import random
from pathlib import Path
import yaml
from ultralytics import YOLO
import zipfile
from google.colab import files
import warnings
warnings.filterwarnings('ignore')

# Set random seeds
random.seed(42)
np.random.seed(42)

# Check GPU
import torch
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.1f} GB")
else:
    print("⚠️ No GPU detected. Training will be slower on CPU.")

# Upload your prepared dataset
print("Please upload your prepared dataset ZIP file...")
uploaded = files.upload()

# Extract dataset
for filename in uploaded.keys():
    if filename.endswith('.zip'):
        print(f"Extracting {filename}...")
        with zipfile.ZipFile(filename, 'r') as zip_ref:
            zip_ref.extractall('.')
        print("Dataset extracted successfully!")
        break

# Initialize and train YOLOv8 model
model = YOLO('yolov8n.pt')

print("🚀 Starting YOLOv8 training...")

results = model.train(
    data='waste_classification.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device='auto',
    workers=8,
    patience=20,
    save=True,
    save_period=10,
    project='waste_classification',
    name='yolov8_waste_model',
    exist_ok=True,
    pretrained=True,
    optimizer='auto',
    verbose=True,
    seed=42,
    deterministic=True,
    single_cls=False,
    rect=False,
    cos_lr=False,
    close_mosaic=10,
    resume=False,
    amp=True,
    fraction=1.0,
    cache=False,
    lr0=0.01,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3.0,
    warmup_momentum=0.8,
    warmup_bias_lr=0.1,
    box=7.5,
    cls=0.5,
    dfl=1.5,
    pose=12.0,
    kobj=2.0,
    label_smoothing=0.0,
    nbs=64,
    overlap_mask=True,
    mask_ratio=4,
    dropout=0.0,
    val=True,
    plots=True
)

print("✅ Training completed!")

# Evaluate model
best_model_path = 'waste_classification/yolov8_waste_model/weights/best.pt'
model = YOLO(best_model_path)
metrics = model.val()

print("📊 Model Evaluation Results:")
print(f"mAP50: {metrics.box.map50:.4f}")
print(f"mAP50-95: {metrics.box.map:.4f}")
print(f"Precision: {metrics.box.mp:.4f}")
print(f"Recall: {metrics.box.mr:.4f}")

# Export models
print("📦 Exporting models...")
onnx_path = model.export(format='onnx', dynamic=True, simplify=True)
tflite_path = model.export(format='tflite', int8=True)
coreml_path = model.export(format='coreml')
torchscript_path = model.export(format='torchscript')

print(f"✅ ONNX: {onnx_path}")
print(f"✅ TensorFlow Lite: {tflite_path}")
print(f"✅ CoreML: {coreml_path}")
print(f"✅ TorchScript: {torchscript_path}")

# Download models
import zipfile
with zipfile.ZipFile('waste_classification_models.zip', 'w') as zipf:
    if os.path.exists('waste_classification/yolov8_waste_model/weights/best.pt'):
        zipf.write('waste_classification/yolov8_waste_model/weights/best.pt', 'best.pt')
    
    for ext in ['onnx', 'tflite', 'coreml', 'torchscript']:
        model_file = f'waste_classification/yolov8_waste_model/weights/best.{ext}'
        if os.path.exists(model_file):
            zipf.write(model_file, f'best.{ext}')

files.download('waste_classification_models.zip')
print("📥 Model package downloaded!")
```

## 🚀 Deployment Options

After training, you have several deployment options:

### 1. Web API (Recommended for React app)
- Deploy ONNX model to Google Cloud Run
- Create FastAPI/Flask backend
- React app calls API with uploaded images

### 2. Browser-based (TensorFlow.js)
- Convert to TensorFlow.js format
- Run inference directly in browser
- No backend needed

### 3. Cloud AI Services
- Google Cloud AI Platform
- AWS SageMaker
- Azure Machine Learning

## 📝 Next Steps

1. **Train your model** using the Colab notebook
2. **Download the trained model** (ZIP file)
3. **Choose deployment method** based on your needs
4. **Integrate with RecycloAI** React app

## 🆘 Troubleshooting

### Common Issues:

**"No GPU detected"**
- Go to Runtime → Change runtime type → GPU
- Restart the runtime

**"Out of memory"**
- Reduce batch size to 8 or 4
- Reduce image size to 416

**"Dataset not found"**
- Make sure you uploaded the correct ZIP file
- Check that `waste_classification.yaml` exists

**"Training is slow"**
- Ensure GPU is enabled
- Reduce dataset size for testing

## 📞 Support

If you encounter issues:
1. Check the error messages in Colab
2. Verify your dataset structure
3. Ensure all dependencies are installed
4. Restart the runtime if needed

---

**Ready to start?** Follow the steps above and let me know if you need help with any part of the process!
