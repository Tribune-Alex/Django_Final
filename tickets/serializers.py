from rest_framework import serializers
from .models import Train, Vagon, Seat, Ticket

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ('id', 'seat_number', 'is_occupied')

class VagonSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Vagon
        fields = ('id', 'number', 'seats')

class TrainSerializer(serializers.ModelSerializer):
    wagons = VagonSerializer(many=True, read_only=True)
    popularity = serializers.SerializerMethodField()

    class Meta:
        model = Train
        fields = ('id', 'number', 'name', 'source', 'destination', 'departure', 'arrival', 'wagons', 'popularity')

    def get_popularity(self, obj):
        total = 0
        booked = 0
        for vagon in obj.wagons.all():
            for seat in vagon.seats.all():
                total += 1
                if seat.is_occupied:
                    booked += 1
        percent = round((booked / total) * 100) if total > 0 else 0
        return {"total": total, "booked": booked, "percent": percent}

class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ('id', 'user', 'train', 'seat', 'price', 'booked_at')

    def validate(self, data):
        if data['seat'].is_occupied:
            raise serializers.ValidationError("This seat is already booked.")
        return data

    def create(self, validated_data):
        seat = validated_data['seat']
        seat.is_occupied = True
        seat.save()
        return super().create(validated_data)