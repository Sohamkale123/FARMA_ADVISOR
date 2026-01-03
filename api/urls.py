from django.urls import path
from .views import handle_query
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import dashboard_stats
from .views import farmer_history
from .views import officer_stats
from .views import submit_feedback


urlpatterns = [
    path('query/', handle_query),
    path('stats/', dashboard_stats),
    path('history/<str:phone>/', farmer_history),
    path('officer_stats/', officer_stats),
    path('feedback/<int:pk>/', submit_feedback)

]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
