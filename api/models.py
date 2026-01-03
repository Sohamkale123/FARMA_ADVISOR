from django.db import models
from PIL import Image
import torch
from torchvision import transforms

class_labels = ['Healthy', 'Leaf Spot', 'Blight', 'Rust']  # Example labels

def predict_disease(img):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])
    input_tensor = transform(img).unsqueeze(0)
    model = torch.load("api/plant_model.pt", map_location=torch.device('cpu'))
    model.eval()
    output = model(input_tensor)
    predicted_class = output.argmax().item()
    return class_labels[predicted_class]

class FarmerProfile(models.Model):
    name = models.CharField(max_length=100)
    phone = models.CharField(max_length=15)
    location = models.CharField(max_length=100)
    language = models.CharField(max_length=20)

class FarmerQuery(models.Model):
    crop = models.CharField(max_length=100, blank=True, null=True)
    season = models.CharField(max_length=100, blank=True, null=True)
    region = models.CharField(max_length=100, blank=True, null=True)
    #new added
    query_text = models.TextField()
    response = models.TextField()
    confidence = models.FloatField()
    escalated = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='query_images/', null=True, blank=True)
    diagnosis = models.CharField(max_length=100, null=True, blank=True)
    escalated_to = models.CharField(max_length=100, null=True, blank=True)  # officer name or ID
    escalation_notes = models.TextField(null=True, blank=True)
    assigned_to = models.CharField(max_length=100, blank=True, null=True)
    
    class FarmerProfile(models.Model):
        name = models.CharField(max_length=100)
        phone = models.CharField(max_length=15, unique=True)
        region = models.CharField(max_length=100, blank=True, null=True)
        preferred_crop = models.CharField(max_length=100, blank=True, null=True)
        preferred_season = models.CharField(max_length=50, blank=True, null=True)
        language = models.CharField(max_length=20, default='hi')  # for future multilingual support



    def __str__(self):
        return f"{self.query_text[:50]}... ({self.timestamp})"
