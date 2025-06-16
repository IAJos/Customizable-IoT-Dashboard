from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('sensors/create/', views.create_sensor, name='create_sensor'),
    path('chart-data/', views.chart_data, name='chart_data'),
    path('sensors/', views.list_sensor, name='list_sensor'),
    path('sensors/search/', views.search_sensor, name='search_sensor'),
    path('sensors/<int:sensor_id>/update/', views.update_sensor, name='update_sensor'),
    path('sensors/<int:sensor_id>/delete/', views.delete_sensor, name='delete_sensor'),
]
