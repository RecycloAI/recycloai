from ultralytics import YOLO

# Load YOLOv8 classification model from TorchScript file
model = YOLO("backend/best.torchscript")

def classify_image(image_path: str):
    results = model.predict(source=image_path)
    class_id = int(results[0].probs.top1)
    class_name = results[0].names[class_id]
    return {"class_id": class_id, "class_name": class_name}