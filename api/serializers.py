from rest_framework import serializers
from tickets.models import City, Train, Vagon, Seat, Ticket, Trip

class CitySerializer(serializers.ModelSerializer):
    class Meta:
        model = City
        fields = ['id', 'name']

class SeatSerializer(serializers.ModelSerializer):
    isOccupied = serializers.SerializerMethodField()

    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'price', 'isOccupied']

    def get_isOccupied(self, obj):
        trip_id = self.context.get("trip_id")
        if not trip_id:
            return False
        return Ticket.objects.filter(trip_id=trip_id, seat=obj).exists()

class VagonSerializer(serializers.ModelSerializer):
    seats = serializers.SerializerMethodField()

    class Meta:
        model = Vagon
        fields = ['id', 'number', 'seats']

    def get_seats(self, obj):
        seats = obj.seats.all()
        serializer = SeatSerializer(seats, many=True, context=self.context)
        return serializer.data

class TripSerializer(serializers.ModelSerializer):
    source_name = serializers.CharField(source='source.name', read_only=True)
    destination_name = serializers.CharField(source='destination.name', read_only=True)
    class Meta:
        model = Trip
        fields = ['id', 'departure', 'source_name', 'destination_name']

class TrainSerializer(serializers.ModelSerializer):
    vagons = VagonSerializer(many=True, read_only=True)
    trips = TripSerializer(many=True, read_only=True)

    class Meta:
        model = Train
        fields = ['id', 'number', 'name', 'vagons', 'trips']

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = '__all__'