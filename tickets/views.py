from rest_framework import generics, permissions
from .models import Train, Ticket
from .serializers import TrainSerializer, TicketSerializer
from django.shortcuts import render
from datetime import datetime



def index(request):
    return render(request, 'index.html')

def booking(request):
    return render(request, 'booking.html')

def check_ticket(request):
    return render(request, 'checkTicket.html')

def payment_success(request):
    return render(request, 'paymentSucces.html')

def wanted_trains(request):
    return render(request, 'wantedTrains.html')

class TrainListView(generics.ListAPIView):
    serializer_class = TrainSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
     queryset = Train.objects.all()
     source = self.request.query_params.get('source')
     destination = self.request.query_params.get('destination')
     date = self.request.query_params.get('date')

     if source:
        queryset = queryset.filter(source=source)

     if destination:
        queryset = queryset.filter(destination=destination)

     if date:
        try:
            parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
            queryset = queryset.filter(departure__date=parsed_date)
        except ValueError:
            return Train.objects.none()

     return queryset

class TrainDetailView(generics.RetrieveAPIView):
    queryset = Train.objects.all()
    serializer_class = TrainSerializer
    permission_classes = [permissions.AllowAny]

class TicketCreateView(generics.CreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.AllowAny]

