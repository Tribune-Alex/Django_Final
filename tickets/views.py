from rest_framework import generics, permissions
from .models import City, Train, Ticket
from api.serializers import CitySerializer, TrainSerializer, TicketSerializer
from django.shortcuts import render
from datetime import datetime

# -------------------------
# Обычные Django Views
# -------------------------

def index(request):
    """Главная страница"""
    return render(request, 'index.html')

def booking(request):
    """Страница бронирования билета"""
    return render(request, 'booking.html')

def check_ticket(request):
    """Страница проверки билета"""
    return render(request, 'checkTicket.html')

def payment_success(request):
    """Страница успешной оплаты"""
    return render(request, 'paymentSucces.html')

def wanted_trains(request):
    """Страница со списком поездов по фильтрам"""
    return render(request, 'wantedTrains.html')


# -------------------------
# DRF API Views
# -------------------------

class CityListView(generics.ListAPIView):
    """Возвращает список всех городов"""
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]


class TrainListView(generics.ListAPIView):
    """Возвращает список поездов по фильтрам: source, destination, date"""
    serializer_class = TrainSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Train.objects.all()
        source = self.request.query_params.get('source')
        destination = self.request.query_params.get('destination')
        date = self.request.query_params.get('date')

        if source:
            queryset = queryset.filter(source_id=source)
        if destination:
            queryset = queryset.filter(destination_id=destination)
        if date:
            try:
                parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
                queryset = queryset.filter(departure__date=parsed_date)
            except ValueError:
                return Train.objects.none()
        return queryset


class TrainDetailView(generics.RetrieveAPIView):
    """Детальная информация о поезде с вагонами и местами"""
    queryset = Train.objects.all()
    serializer_class = TrainSerializer
    permission_classes = [permissions.AllowAny]


class TicketCreateView(generics.CreateAPIView):
    """Создание билета (только для аутентифицированных пользователей)"""
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]