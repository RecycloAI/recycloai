# Google Colab Training Code for YOLOv8 Waste Classification
# Copy and paste this into a new Google Colab notebook

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
