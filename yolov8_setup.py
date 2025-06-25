#!/usr/bin/env python3
"""
RecycloAI - YOLOv8 Waste Classification Setup Script
"""

import os
import shutil
import random
import zipfile
from pathlib import Path
import yaml
from PIL import Image
import numpy as np

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

# Waste categories
CATEGORIES = [
    'battery', 'biological', 'brown-glass', 'cardboard', 'clothes',
    'green-glass', 'metal', 'paper', 'plastic', 'shoes', 'trash', 'white-glass'
]

def create_directory_structure():
    """Create the necessary directory structure for YOLO training."""
    print("📁 Creating directory structure...")
    
    directories = [
        'dataset',
        'yolo_dataset/train/images',
        'yolo_dataset/train/labels', 
        'yolo_dataset/val/images',
        'yolo_dataset/val/labels',
        'yolo_dataset/test/images',
        'yolo_dataset/test/labels'
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"  ✅ Created: {directory}")
    
    for category in CATEGORIES:
        os.makedirs(f'dataset/{category}', exist_ok=True)
    
    print("✅ Directory structure created successfully!")

def extract_dataset(zip_path):
    """Extract dataset from ZIP file."""
    print(f"📦 Extracting dataset from {zip_path}...")
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall('dataset')
        print("✅ Dataset extracted successfully!")
        return True
    except Exception as e:
        print(f"❌ Error extracting dataset: {e}")
        return False

def analyze_dataset():
    """Analyze the dataset and show statistics."""
    print("\n📊 Analyzing dataset...")
    
    dataset_info = {}
    total_images = 0
    
    for category in CATEGORIES:
        category_path = f'dataset/{category}'
        if os.path.exists(category_path):
            images = [f for f in os.listdir(category_path) 
                     if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))]
            dataset_info[category] = len(images)
            total_images += len(images)
        else:
            dataset_info[category] = 0
    
    print(f"Total images: {total_images}")
    print("\nImages per category:")
    for category, count in dataset_info.items():
        print(f"  {category}: {count} images")
    
    return dataset_info, total_images

def create_yolo_dataset():
    """Convert classification dataset to YOLO format."""
    print("\n🔄 Converting to YOLO format...")
    
    for category_idx, category in enumerate(CATEGORIES):
        category_path = f'dataset/{category}'
        if not os.path.exists(category_path):
            continue
            
        images = [f for f in os.listdir(category_path) 
                 if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))]
        
        if not images:
            print(f"  ⚠️ No images found in {category}")
            continue
        
        random.shuffle(images)
        
        n_images = len(images)
        n_train = int(0.7 * n_images)
        n_val = int(0.2 * n_images)
        
        splits = {
            'train': images[:n_train],
            'val': images[n_train:n_train + n_val],
            'test': images[n_train + n_val:]
        }
        
        print(f"  📂 Processing {category}: {n_images} images")
        
        for split_name, split_images in splits.items():
            for img_name in split_images:
                src_path = os.path.join(category_path, img_name)
                dst_path = f'yolo_dataset/{split_name}/images/{category}_{img_name}'
                shutil.copy2(src_path, dst_path)
                
                try:
                    img = Image.open(src_path)
                    annotation = f"{category_idx} 0.5 0.5 1.0 1.0\n"
                    
                    label_name = f'{category}_{img_name.rsplit(".", 1)[0]}.txt'
                    with open(f'yolo_dataset/{split_name}/labels/{label_name}', 'w') as f:
                        f.write(annotation)
                except Exception as e:
                    print(f"    ⚠️ Error processing {img_name}: {e}")
    
    print("✅ YOLO dataset created successfully!")

def verify_yolo_dataset():
    """Verify the created YOLO dataset."""
    print("\n🔍 Verifying YOLO dataset...")
    
    for split in ['train', 'val', 'test']:
        images_path = f'yolo_dataset/{split}/images'
        labels_path = f'yolo_dataset/{split}/labels'
        
        if not os.path.exists(images_path) or not os.path.exists(labels_path):
            print(f"  ❌ {split}: Missing directories")
            continue
        
        n_images = len([f for f in os.listdir(images_path) 
                       if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff'))])
        n_labels = len([f for f in os.listdir(labels_path) if f.endswith('.txt')])
        
        print(f"  {split.capitalize()}: {n_images} images, {n_labels} labels")
        
        if n_images != n_labels:
            print(f"    ⚠️ Warning: Image and label count mismatch!")

def create_yaml_config():
    """Create YAML configuration file for YOLO training."""
    print("\n📝 Creating YAML configuration...")
    
    yaml_config = {
        'path': './yolo_dataset',
        'train': 'train/images',
        'train': 'train/images',
        'val': 'val/images',
        'test': 'test/images',
        'nc': len(CATEGORIES),
        'names': CATEGORIES
    }
    
    with open('waste_classification.yaml', 'w') as f:
        yaml.dump(yaml_config, f, default_flow_style=False)
    
    print("✅ YAML configuration file created!")
    print("\nConfiguration:")
    for key, value in yaml_config.items():
        print(f"  {key}: {value}")

def main():
    """Main function to run the setup."""
    print("🗑️ RecycloAI - YOLOv8 Waste Classification Setup")
    print("=" * 50)
    
    create_directory_structure()
    
    zip_files = [f for f in os.listdir('.') if f.endswith('.zip')]
    
    if zip_files:
        print(f"\n📦 Found ZIP files: {zip_files}")
        for zip_file in zip_files:
            if extract_dataset(zip_file):
                break
    else:
        print("\n📁 No ZIP files found. Please manually place your images in the category folders:")
        for category in CATEGORIES:
            print(f"  - dataset/{category}/")
    
    dataset_info, total_images = analyze_dataset()
    
    if total_images == 0:
        print("\n❌ No images found in dataset. Please add images to the category folders.")
        return
    
    create_yolo_dataset()
    verify_yolo_dataset()
    create_yaml_config()
    
    print("\n🎉 Setup completed successfully!")
    print("\nNext steps:")
    print("1. Upload this folder to Google Colab")
    print("2. Run the training notebook")
    print("3. Train your YOLOv8 model")

if __name__ == "__main__":
    main()
