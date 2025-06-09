from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .ml_model.predict import classify_waste
import os


def home(request):
    return render(request, 'index.html')

def stats(request):
    return render(request, 'stats.html')

def index(request):
    return render(request, 'index.html')

def classify_page (request):
    return render(request, 'classify.html')

def stats_view (request):
    return render(request, 'stats.html')

@api_view(['POST'])
def classify(request):
    if request.FILES.get('image'):
        image = request.FILES['image']
        upload_path = os.path.join('media', image.name)
        with open(upload_path, 'wb') as f:
            for chunk in image.chunks():
                f.write(chunk)
        prediction = classify_waste(upload_path)
        return Response({"prediction": prediction})
    return Response({"error": "No image uploaded"}, status=400)




def classify_view(request):
    if request.method == 'POST':
        image = request.FILES['image']
        # Save image temporarily (or use in-memory processing)
        with open('temp_img.jpg', 'wb+') as f:
            for chunk in image.chunks():
                f.write(chunk)
        
        # Get prediction
        prediction, confidence = classify_waste('temp_img.jpg')
        
        # Disposal guide mapping
        disposal_guides = {
            "plastic": "Recycle in designated plastic bins.",
            "paper": "Recycle if clean, compost if soiled.",
            "metal": "Recycle in metal collection.",
            "organic": "Compost or use organic waste bins."
        }
        
        return render(request, 'classify.html', {
            'prediction': prediction,
            'confidence': round(confidence * 100, 2),
            'disposal_guide': disposal_guides.get(prediction.lower(), "Check local guidelines.")
        })
    
    return render(request, 'classify.html')




# TODO: # Implement the stats_pageviewdatabase function to fetch and display statistics
# from .models import Classification  # Assuming you have this model
def stats_pageviewdatabase(request):
    # Sample data - replace with real queries
    classifications = Classification.objects.all()
    
    context = {
        'total_classifications': classifications.count(),
        'recycling_rate': 72,  # Calculate from your data
        'top_material': "Plastic",
        'recent_classifications': classifications.order_by('-timestamp')[:10],
        'material_labels': ['Plastic', 'Paper', 'Metal', 'Organic', 'Other'],
        'material_data': [45, 30, 15, 25, 5],
        'week_labels': ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        'recyclable_data': [30, 45, 36, 52],
        'landfill_data': [20, 15, 24, 18]
    }
    return render(request, 'stats.html', context)

