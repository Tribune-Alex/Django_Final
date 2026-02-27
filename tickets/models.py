from django.db import models
from django.contrib.auth.models import User


class City(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Cities"

    def __str__(self):
        return self.name


class Train(models.Model):
    number = models.CharField(max_length=10)
    name = models.CharField(max_length=100)

    source = models.ForeignKey(
        City,
        related_name="departures",
        on_delete=models.CASCADE
    )

    destination = models.ForeignKey(
        City,
        related_name="arrivals",
        on_delete=models.CASCADE
    )

    departure = models.DateTimeField()
    arrival = models.DateTimeField()

    def __str__(self):
        return f"{self.name} ({self.number})"


class Vagon(models.Model):
    train = models.ForeignKey(
        Train,
        related_name='vagons',
        on_delete=models.CASCADE
    )
    number = models.CharField(max_length=10)

    def __str__(self):
        return f"Vagon {self.number} of {self.train}"


class Seat(models.Model):
    vagon = models.ForeignKey(
        Vagon,
        related_name='seats',
        on_delete=models.CASCADE
    )
    seat_number = models.CharField(max_length=5)
    is_occupied = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=1200)

    def __str__(self):
        return f"Seat {self.seat_number} in {self.vagon}"


class Ticket(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    train = models.ForeignKey(Train, on_delete=models.CASCADE)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)

    price = models.DecimalField(max_digits=8, decimal_places=2)
    booked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ticket {self.seat} by {self.user}"