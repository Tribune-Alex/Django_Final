from rest_framework import generics, permissions
from .models import City, Train, Ticket
from api.serializers import CitySerializer, TrainSerializer, TicketSerializer
from django.shortcuts import render
from datetime import datetime
import uuid

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




class CityListView(generics.ListAPIView):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [permissions.AllowAny]


class TrainListView(generics.ListAPIView):
    
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
    
    queryset = Train.objects.all()
    serializer_class = TrainSerializer
    permission_classes = [permissions.AllowAny]


class TicketCreateView(generics.CreateAPIView):
    serializer_class = TicketSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        data = request.data.copy()

        
        data['ticket_number'] = str(uuid.uuid4()).replace('-', '')[:12].upper()

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)

        
        trip = serializer.validated_data['trip']
        seat = serializer.validated_data['seat']
        if Ticket.objects.filter(trip=trip, seat=seat).exists():
            return Response(
                {"error": "This seat is already taken."},
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_create(serializer)
        return Response(
            {
                "message": "Ticket is booked!",
                "ticket": serializer.data
            },
            status=status.HTTP_201_CREATED
        )