from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect
# from .views import me, logout_view

from django.conf import settings
from django.conf.urls.static import static
def home(request):
    return redirect('announcements/')

urlpatterns = [
    path('', home),  # root URL
    path('admin/', admin.site.urls),
    path("api/announcements/", include("announcements.urls")),  # <-- announcements endpoints
    
    path('api/accounts/', include('accounts.urls')),  # <-- login endpoint
    path('api/', include('enrollment.urls')),  # <-- enrollment endpoints
    path('api/finance/', include('finance.urls')),  # <-- finance endpoints
    path('api/grades/', include('grades.urls')),  # <-- grades endpoints
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)