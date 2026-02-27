from rest_framework import serializers
from tickets.models import City, Train, Vagon, Seat, Ticket

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name']


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'is_occupied', 'price']


class VagonSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Vagon
        fields = ['id', 'number', 'seats']


class TrainSerializer(serializers.ModelSerializer):
    vagons = VagonSerializer(many=True, read_only=True)
    source = CitySerializer(read_only=True)
    destination = CitySerializer(read_only=True)

    class Meta:
        model = Train
        fields = ['id', 'number', 'name', 'source', 'destination', 'departure', 'arrival', 'vagons']


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'