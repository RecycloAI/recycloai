from django.urls import path
from .views import classify, stats,classify_page, stats_view

urlpatterns = [
    path('classify/', classify, name='classify'),
    path('stats/', stats, name='stats'),
    path('stats_page/', stats_view, name='stats_page'),
    path('classify_page/', classify_page, name='classify_page'),

]