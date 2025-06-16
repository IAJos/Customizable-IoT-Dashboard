import json

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from core.forms import SensorForm
from rest_framework.response import Response

sensors = [
        {'id': 1, 'title': 'Température intérieur', 'topic': 'mqtt/AHT11/temperature',
         'description': 'Valeur de température du capteur du salon',
         'icon': 'temperature-three-quarters', 'color': '#007bff'},

        {'id': 2, 'title': 'Humidité extérieur', 'topic': 'mqtt/AHT11/humidity',
         'description': 'Valeur d\'humidité du capteur jardin',
         'icon': 'droplet', 'color': '#28a745'},

        {'id': 3, 'title': 'Qualité de l\'air', 'topic': 'mqtt/airquality/pm2.5',
         'description': 'Mesure PM2.5 dans le salon',
         'icon': 'smog', 'color': '#6c757d'},

        {'id': 4, 'title': 'Luminosité', 'topic': 'mqtt/light/level',
         'description': 'Niveau de luminosité dans la chambre',
         'icon': 'lightbulb', 'color': '#ffc107'},

        {'id': 5, 'title': 'Présence', 'topic': 'mqtt/motion/detection',
         'description': 'Détection de mouvement dans le couloir',
         'icon': 'person-walking', 'color': '#dc3545'}
    ]
def home(request):
    #sensors = Sensor.objects.all()
    return render(request, 'core/home.html', {'sensors': sensors})

def list_sensor(request):
    return JsonResponse(sensors, safe=False)

def create_sensor(request):
    status = 0
    if request.method == 'POST':
        data = json.loads(request.body)
        new_id = max([sensor['id'] for sensor in sensors], default=0) + 1
        sensor = {'id': new_id, 'title': data.get('title', ''), 'topic': data.get('topic', ''), 'icon': data.get('icon', ''), 'color': data.get('color', ''), 'description': data.get('description', '')}
        sensors.append(sensor)
        status = 200
    else:
        form = SensorForm()
        status = 400
    return JsonResponse({
        'status': status
    })

def search_sensor(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            query = data.get('search', '').lower()
            results = [s for s in sensors if query in s['title'].lower()]
            return JsonResponse(results, safe=False)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=405)

def update_sensor(request, sensor_id):
    if request.method == 'PUT':
        data = json.loads(request.body)
        for sensor in sensors:
            if sensor['id'] == sensor_id:
                sensor['title'] = data.get('title', sensor['title'])
                sensor['topic'] = data.get('topic', sensor['topic'])
                sensor['icon'] = data.get('icon', sensor['icon'])
                sensor['color'] = data.get('color', sensor['color'])
                sensor['description'] = data.get('description', sensor['description'])
                return JsonResponse({'success': True, 'sensor': sensor})
        return JsonResponse({'error': 'Sensor not found'}, status=404)

def delete_sensor(request, sensor_id):
    if request.method == 'DELETE':
        global sensors
        sensors = [sensor for sensor in sensors if sensor['id'] != sensor_id]
        return JsonResponse({'success': True})

def chart_data(request):
    labels = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet']
    data = [10, 20, 30, 20, 35,20, 40]
    return JsonResponse({
        'labels': labels,
        'data': data
    })
