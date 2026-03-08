from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from tickets.models import City, Train, Trip, Seat, Ticket
from .serializers import CitySerializer, TrainSerializer, TicketSerializer,TripSerializer,VagonSerializer
from django.utils.dateparse import parse_date
from django.utils.timezone import make_aware
from datetime import datetime, time
import uuid
import logging

logger = logging.getLogger(__name__)


@api_view(['GET'])
def city_list(request):
    cities = City.objects.all()
    serializer = CitySerializer(cities, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def train_detail(request, pk):
    train = Train.objects.get(pk=pk)
    trip_id = request.GET.get("trip") 
    serializer = TrainSerializer(train, context={"trip_id": trip_id})
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

    start_datetime = make_aware(datetime.combine(selected_date, time.min))
    end_datetime = make_aware(datetime.combine(selected_date, time.max))

    trips = Trip.objects.filter(
        source_id=source_id,
        destination_id=destination_id,
        departure__range=(start_datetime, end_datetime)
    ).select_related('train').prefetch_related('train__vagons', 'train__vagons__seats')

    trains_data = []
    added_train_ids = set()

    for trip in trips:
        train = trip.train

        
        if train.id in added_train_ids:
            for td in trains_data:
                if td['id'] == train.id:
                    td['trips'].append(TripSerializer(trip).data)
                    break
        else:
            
            train_data = {
                'id': train.id,
                'number': train.number,
                'name': train.name,
                'vagons': VagonSerializer(
                    train.vagons.all(),
                    many=True,
                    context={'trip_id': trip.id}
                ).data,
                'trips': [TripSerializer(trip).data],
            }
            trains_data.append(train_data)
            added_train_ids.add(train.id)

    return Response(trains_data, status=status.HTTP_200_OK)



@api_view(['POST'])
def create_tickets(request):

    tickets_data = request.data.get("tickets")

    if not tickets_data:
        return Response({"error": "No tickets provided"}, status=400)

    created_tickets = []

    for t_data in tickets_data:
        try:
            trip = Trip.objects.get(id=t_data["trip"])
            seat = Seat.objects.get(id=t_data["seat"])

            if Ticket.objects.filter(trip=trip, seat=seat).exists():
                continue

            ticket = Ticket.objects.create(
                trip=trip,
                seat=seat,
                ticket_number=str(uuid.uuid4())[:8],
                price=t_data.get("price", seat.price),
                first_name=t_data.get("first_name"),
                last_name=t_data.get("last_name"),
                personal_id=t_data.get("personal_id")
            )

            seat.isOccupied = True
            seat.save()

            created_tickets.append(ticket)

        except Trip.DoesNotExist:
            return Response({"error": "Trip not found"}, status=404)

        except Seat.DoesNotExist:
            return Response({"error": "Seat not found"}, status=404)

        except Exception as e:
            print(e)

    serializer = TicketSerializer(created_tickets, many=True)
    return Response(serializer.data, status=201)

@api_view(['GET'])
def get_ticket(request, ticket_number):
   
    try:
        ticket = Ticket.objects.get(ticket_number=ticket_number)
    except Ticket.DoesNotExist:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)

    trip = ticket.trip
    train = trip.train if trip else None

    ticket_data = {
        "id": ticket.ticket_number,
        "date": ticket.trip.departure.strftime("%Y-%m-%d") if trip else "",
        "ticketPrice": float(ticket.price),
        "train": {
            "source": trip.source.name if trip else "",
            "destination": trip.destination.name if trip else "",
            "departure": trip.departure.strftime("%H:%M") if trip else "",
            "arrival": trip.arrival.strftime("%H:%M") if trip else ""
        } if trip else {},
        "persons": [
            {
                "name": ticket.first_name,
                "surname": ticket.last_name,
                "idNumber": ticket.personal_id,
                "seat": {
                    "number": ticket.seat.seat_number,
                    "vagonId": ticket.seat.vagon.id
                }
            }
        ]
    }

    return Response(ticket_data, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def cancel_ticket(request, ticket_number):
    try:
        ticket = Ticket.objects.get(ticket_number=ticket_number)
        ticket.seat.isOccupied = False
        ticket.seat.save()
        
        ticket.delete()
        return Response({"success": "Ticket canceled"}, status=status.HTTP_200_OK)
    except Ticket.DoesNotExist:
        return Response({"error": "Ticket not found"}, status=status.HTTP_404_NOT_FOUND)