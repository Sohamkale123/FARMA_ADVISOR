from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from .models import FarmerQuery, predict_disease, FarmerProfile
from PIL import Image
from openai import OpenAI
from openai import OpenAI, RateLimitError
client = OpenAI(
  api_key="********************"
)
@api_view(['GET'])
def officer_stats(request):
    stats = FarmerQuery.objects.values('assigned_to').annotate(
        total=Count('id'),
        resolved=Count('id', filter=Q(resolved=True)),
        avg_conf=Avg('confidence')
    )
    return Response({"officers": list(stats)})

@api_view(['GET'])
def feedback_stats(request):
    low_confidence = FarmerQuery.objects.filter(confidence__lt=0.5).count()
    escalated = FarmerQuery.objects.filter(escalated=True).count()
    flagged_combos = FarmerQuery.objects.filter(confidence__lt=0.5).values('crop', 'season').annotate(count=Count('id')).order_by('-count')[:5]

    return Response({
        "low_confidence": low_confidence,
        "escalated": escalated,
        "flagged_combos": list(flagged_combos)
    })


@api_view(['GET'])
def get_profile(request, phone):
    try:
        farmer = FarmerProfile.objects.get(phone=phone)
        return Response({
            "region": farmer.region,
            "preferred_crop": farmer.preferred_crop,
            "preferred_season": farmer.preferred_season,
            "language": farmer.language
        })
    except FarmerProfile.DoesNotExist:
        return Response({"error": "Farmer not found"}, status=404)


@api_view(['GET'])
def dashboard_stats(request):
    total = FarmerQuery.objects.count()
    escalated = FarmerQuery.objects.filter(escalated=True).count()
    resolved = FarmerQuery.objects.filter(resolved=True).count()
    common_diag = FarmerQuery.objects.values('diagnosis').annotate(count=Count('diagnosis')).order_by('-count')[:5]
    avg_conf = FarmerQuery.objects.aggregate(avg=Avg('confidence'))['avg']

    return Response({
        'total': total,
        'escalated': escalated,
        'resolved': resolved,
        'common_diagnoses': list(common_diag),
        'average_confidence': round(avg_conf or 0, 2)
    })

@api_view(['POST'])
def handle_query(request):
    if request.method == "POST":
        try:
            query = request.data.get("query_text", "")
            #query = request.data.get("query_text", "")
            crop = request.data.get("crop", "")
            season = request.data.get("season", "")
            region = request.data.get("region", "")
            image = request.FILES.get("image")
            phone = request.data.get("phone", "") # <-- Add this line
            print("Incoming data:", request.data)


            # ✅ Save preferences to FarmerProfile
            if phone:
                profile, _ = FarmerProfile.objects.get_or_create(phone=phone)
                profile.region = region or profile.region
                profile.preferred_crop = crop or profile.preferred_crop
                profile.preferred_season = season or profile.preferred_season
                profile.save()
            response_text = ""
            confidence = 0.9
            escalated = False
            diagnosis = None

            # Crop-season advisory logic
            if crop and season:
                if crop == 'banana' and season == 'kharif':
                    response_text = "Use Propiconazole for leaf spot. Maintain spacing and avoid overhead irrigation."

                elif crop == 'banana' and season == 'summer':
                    response_text = "Ensure mulching and drip irrigation. Monitor for leaf spot and apply Propiconazole if needed."

                elif crop == 'rice' and season == 'rabi':
                    response_text = "Watch for blast and brown spot. Apply Tricyclazole if symptoms appear."

                elif crop == 'rice' and season == 'kharif':
                    response_text = "Stem borer and blast risk. Use Cartap hydrochloride and Tricyclazole."

                elif crop == 'wheat' and season == 'rabi':
                    response_text = "Monitor for rust and aphids. Use Mancozeb for rust and Imidacloprid for aphids."

                elif crop == 'wheat' and season == 'summer':
                    response_text = "Avoid late sowing. Monitor for rust and apply Propiconazole if symptoms appear."

                elif crop == 'tomato' and season == 'summer':
                    response_text = "High risk of fruit borer and leaf curl virus. Use pheromone traps and spray Neem oil weekly."

                elif crop == 'tomato' and season == 'rabi':
                    response_text = "Late blight and fruit borer risk. Use Mancozeb and install pheromone traps."

                elif crop == 'cotton' and season == 'kharif':
                    response_text = "Check for bollworms and sucking pests. Use Spinosad for bollworms and Acetamiprid for jassids."

                elif crop == 'maize' and season == 'kharif':
                    response_text = "Fall armyworm alert. Use Chlorantraniliprole early and maintain weed-free fields."

                elif crop == 'maize' and season == 'rabi':
                    response_text = "Stem borer and leaf blight common. Use Chlorantraniliprole and maintain spacing."

                elif crop == 'chili' and season == 'rabi':
                    response_text = "Thrips and powdery mildew common. Use Emamectin benzoate and Sulfur-based fungicide."

                elif crop == 'chili' and season == 'kharif':
                    response_text = "Thrips and leaf curl virus common. Use Imidacloprid and maintain field hygiene."

                elif crop == 'soybean' and season == 'kharif':
                    response_text = "Monitor for stem fly and rust. Use Thiamethoxam for stem fly and Hexaconazole for rust."

                elif crop == 'soybean' and season == 'rabi':
                    response_text = "Rust and stem fly risk. Use Hexaconazole and Thiamethoxam."

                elif crop == 'groundnut' and season == 'summer':
                    response_text = "Leaf spot and root rot risk. Apply Mancozeb and ensure proper drainage."

                elif crop == 'groundnut' and season == 'kharif':
                    response_text = "Leaf spot and collar rot common. Use Mancozeb and ensure proper drainage."

                elif crop == 'onion' and season == 'rabi':
                    response_text = "Purple blotch and thrips are common. Use Metalaxyl and spray Spinosad weekly."

                elif crop == 'onion' and season == 'kharif':
                    response_text = "Purple blotch and thrips alert. Use Mancozeb and Spinosad weekly."

                elif crop == 'brinjal' and season == 'rabi':
                    response_text = "Shoot and fruit borer risk. Use pheromone traps and spray Cypermethrin weekly."

                elif crop == 'brinjal' and season == 'summer':
                    response_text = "Shoot and fruit borer alert. Use Cypermethrin and rotate crops to reduce infestation."

                elif crop == 'turmeric' and season == 'kharif':
                    response_text = "Rhizome rot and leaf blotch common. Use Copper oxychloride and maintain soil aeration."

                elif crop == 'turmeric' and season == 'rabi':
                    response_text = "Rhizome rot and leaf blotch. Use Copper oxychloride and maintain soil moisture."

                elif crop == 'ginger' and season == 'summer':
                    response_text = "Soft rot and nematodes. Apply Trichoderma and use neem cake during planting."

                elif crop == 'ginger' and season == 'kharif':
                    response_text = "Soft rot and nematodes. Apply Trichoderma and neem cake during planting."

                elif crop == 'mango' and season == 'kharif':
                    response_text = "Monitor for anthracnose and fruit fly. Use Carbendazim and set up traps before flowering."

                elif crop == 'papaya' and season == 'rabi':
                    response_text = "Watch for powdery mildew and mosaic virus. Use Sulfur spray and remove infected plants."

                elif crop == 'guava' and season == 'summer':
                    response_text = "Fruit fly and wilt are common. Use neem-based sprays and maintain soil aeration."

                elif crop == 'moong' and season == 'kharif':
                    response_text = "Yellow mosaic virus alert. Use Imidacloprid and remove infected plants."

                elif crop == 'chana' and season == 'rabi':
                    response_text = "Wilt and pod borer alert. Use Carbendazim and install pheromone traps."

                elif crop == 'mustard' and season == 'rabi':
                    response_text = "Aphids and white rust alert. Use Imidacloprid and Metalaxyl spray."


            # If image is uploaded, override with image analysis
            if image:
                img = Image.open(image)
                diagnosis = predict_disease(img)
                response_text = f"ഫോട്ടോ വിശകലന പ്രകാരം: {diagnosis}. ദയവായി താഴെ പറയുന്ന ചികിത്സ സ്വീകരിക്കുക..."
            elif not response_text:
                # If no crop-season match, fallback to ChatGPT
            # Original OpenAI call
                try:
                    response = client.chat.completions.create(
                    model="gpt-4.1-mini",   # or "gpt-4.1", "gpt-5-nano" if supported
                    messages=[
                        {"role": "system", "content": "You are an agricultural expert helping farmers."},
                        {"role": "user", "content": query}
                    ]
                    )
                    response_text = response.choices[0].message.content

                except RateLimitError:
                        response_text = "Our system is currently overloaded. Please try again after some time."


                # Basic escalation logic
            if "മാപ്പ്" in response_text or "sorry" in response_text.lower():
                    confidence = 0.3
                    escalated = True

            # Fallback if response_text is still empty
            if not response_text:
                response_text = "क्षमा करें, इस फसल और मौसम के लिए कोई सलाह उपलब्ध नहीं है। कृपया कृषि अधिकारी से संपर्क करें।"


            # Save to database
            saved_query = FarmerQuery.objects.create(
                query_text=query,
                response=response_text,
                confidence=confidence,
                escalated=escalated,
                image=image,
                diagnosis=diagnosis,
                crop=crop,
                season=season,
                region=region
            )
            
            print("Final response:", response_text)

            return JsonResponse({
                "response": response_text,
                "confidence": confidence,
                "escalated": escalated,
                "diagnosis": diagnosis
            })

        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({
            "error": "Exception occurred",
            "details": str(e)
            }, status=500)

        



    return JsonResponse({"error": "Invalid request method"}, status=405)

@api_view(['POST'])
def submit_feedback(request, pk):
    try:
        query = FarmerQuery.objects.get(pk=pk)
        query.feedback = request.data.get('feedback')
        query.save()
        return Response({"message": "Feedback saved"})
    except FarmerQuery.DoesNotExist:
        return Response({"error": "Query not found"}, status=404)

@api_view(['GET'])
def farmer_history(request, phone):
    try:
        farmer = FarmerProfile.objects.get(phone=phone)
        queries = FarmerQuery.objects.filter(farmer=farmer).order_by('-timestamp')
        data = [
            {
                "query_text": q.query_text,
                "response": q.response,
                "diagnosis": q.diagnosis,
                "timestamp": q.timestamp,
                "confidence": q.confidence,
                "escalated": q.escalated,
                "resolved": q.resolved,
                "crop": q.crop,
                "season": q.season,
                "region": q.region
            }
            for q in queries
        ]
        return Response({"farmer": farmer.name, "history": data})
    except FarmerProfile.DoesNotExist:
        return Response({"error": "Farmer not found"}, status=404)
