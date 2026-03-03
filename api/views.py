from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from tickets.models import City, Train, Trip, Seat, Ticket
from .serializers import CitySerializer, TrainSerializer, TicketSerializer
from django.utils.dateparse import parse_date
from django.utils.timezone import make_aware
import datetime


@api_view(['GET'])
def city_list(request):
    cities = City.objects.all()
    serializer = CitySerializer(cities, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def train_detail(request, pk):
    try:
        train = Train.objects.get(pk=pk)
    except Train.DoesNotExist:
        return Response({"error": "Train not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = TrainSerializer(train)
    return Response(serializer.data)



@api_view(['GET'])
def train_list(request):
    trains = Train.objects.all()
    serializer = TrainSerializer(trains, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def departures(request):
    source_id = request.GET.get('source')
    destination_id = request.GET.get('destination')
    date_str = request.GET.get('date')

    if not source_id or not destination_id or not date_str:
        return Response({"error": "Missing parameters"}, status=status.HTTP_400_BAD_REQUEST)

    selected_date = parse_date(date_str)
    if not selected_date:
        return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

    start_datetime = make_aware(datetime.datetime.combine(selected_date, datetime.time.min))
    end_datetime = make_aware(datetime.datetime.combine(selected_date, datetime.time.max))

    trips = Trip.objects.filter(
        source_id=source_id,
        destination_id=destination_id,
        departure__range=(start_datetime, end_datetime)
    )

    if not trips.exists():
        return Response([], status=status.HTTP_200_OK)

    trains = [trip.train for trip in trips]
    serializer = TrainSerializer(trains, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(['POST'])
def create_tickets(request):
    tickets_data = request.data.get("tickets")
    selected_date_str = request.data.get("date")  

    if not tickets_data or not selected_date_str:
        return Response({"error": "No tickets or date provided"}, status=status.HTTP_400_BAD_REQUEST)

    selected_date = parse_date(selected_date_str)
    created_tickets = []

    for t_data in tickets_data:
        try:
            train = Train.objects.get(id=t_data["train"])
            seat = Seat.objects.get(id=t_data["seat"])

            trip, created = Trip.objects.get_or_create(
                train=train,
                departure=selected_date,
                defaults={
                    "source": train.source,
                    "destination": train.destination,
                }
            )

            if Ticket.objects.filter(trip=trip, seat=seat).exists():
                continue  # Место уже занято, пропускаем

            ticket = Ticket.objects.create(
                trip=trip,
                seat=seat,
                ticket_number=f"{seat.id}-{trip.id}",
                price=t_data.get("price", seat.price)
            )
            created_tickets.append(ticket)

        except Train.DoesNotExist:
            continue
        except Seat.DoesNotExist:
            continue

    serializer = TicketSerializer(created_tickets, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)



@api_view(['DELETE'])
def cancel_ticket(request, ticket_number):
    try:
        ticket = Ticket.objects.get(ticket_number=ticket_number)
        ticket.delete()
        return Response({"success": "Ticket canceled"}, status=status.HTTP_200_OK)
    except Ticket.DoesNotExist:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)