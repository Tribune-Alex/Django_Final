from rest_framework.decorators import api_view
from rest_framework.response import Response
from api.serializers import TrainSerializer,CitySerializer,VagonSerializer,SeatSerializer,TicketSerializer
from tickets.models import Train,City,Vagon,Seat,Ticket

# @api_view(['GET'])
# def train_json(request):
#     train=Train.objects.values()
#     return Response({'train':train})


# @api_view(['GET'])
# def city_json(request):
#     city=City.objects.values()
#     return Response({'city':city})

# @api_view(['GET'])
# def vagon_json(request):
#     vagon=Vagon.objects.values()
#     return Response({'vagon':vagon})

# @api_view(['GET'])
# def seat_json(request):
#     seat=Seat.objects.values()
#     return Response({'seat':seat})

@api_view(['GET'])
def train(request):
    train =Train.objects.all()
    serializer = TrainSerializer(train, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def city(request):
    city =City.objects.all()
    serializer = CitySerializer(city, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def vagon(request):
    vagon =Vagon.objects.all()
    serializer = VagonSerializer(vagon, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def seat(request):
    seat =Seat.objects.all()
    serializer = SeatSerializer(seat, many=True)
    return Response(serializer.data)

@api_view(['GET','POST'])
def ticket(request):
    ticket =Ticket.objects.all()
    serializer = TicketSerializer(ticket, many=True)
    return Response(serializer.data)
