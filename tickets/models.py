from django.db import models

class City(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name_plural = "Cities"

    def __str__(self):
        return self.name


class Train(models.Model):
    number = models.CharField(max_length=10)
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} ({self.number})"


class Trip(models.Model):
    train = models.ForeignKey(Train, related_name='trips', on_delete=models.CASCADE)
    departure = models.DateTimeField(null=True, blank=True)   
    arrival = models.DateTimeField(null=True, blank=True)     
    source = models.ForeignKey(City, related_name='trip_departures', on_delete=models.CASCADE)
    destination = models.ForeignKey(City, related_name='trip_arrivals', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.train} {self.departure} {self.source} → {self.destination}"


class Vagon(models.Model):
    train = models.ForeignKey(Train, related_name='vagons', on_delete=models.CASCADE)
    number = models.CharField(max_length=10)

    def __str__(self):
        return f"Vagon {self.number} of {self.train}"


class Seat(models.Model):
    vagon = models.ForeignKey(Vagon, related_name='seats', on_delete=models.CASCADE)
    seat_number = models.CharField(max_length=5)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=1200)
    
    

    def __str__(self):
        return f"Seat {self.seat_number} in {self.vagon}"


class Ticket(models.Model):
    trip = models.ForeignKey(Trip, related_name='tickets', on_delete=models.CASCADE,null=True, blank=True)
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE)
    ticket_number = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    booked_at = models.DateTimeField(auto_now_add=True)

    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100,null=True, blank=True)
    personal_id = models.CharField(max_length=50,null=True, blank=True)

    class Meta:
        unique_together = ('trip', 'seat')  

    def __str__(self):
        return f"Ticket {self.ticket_number} for {self.trip} - {self.first_name} {self.last_name}"