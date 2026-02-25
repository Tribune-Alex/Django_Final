from django.db import models
from django.contrib.auth.models import User

class Train(models.Model):
    number = models.CharField(max_length=10)
    name = models.CharField(max_length=100)
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    departure = models.DateTimeField()
    arrival = models.DateTimeField()

    def __str__(self):
        return f"{self.name} ({self.number})"

class Vagon(models.Model):
    train = models.ForeignKey(Train, related_name='wagons', on_delete=models.CASCADE)
    number = models.CharField(max_length=10)

class Seat(models.Model):
    vagon = models.ForeignKey(Vagon, related_name='seats', on_delete=models.CASCADE)
    seat_number = models.CharField(max_length=5)
    is_occupied = models.BooleanField(default=False)

class Ticket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    train = models.ForeignKey(Train, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    booked_at = models.DateTimeField(auto_now_add=True)
