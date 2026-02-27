# admin.py
from django.contrib import admin
from .models import City, Train, Vagon, Seat, Ticket

admin.site.register(City)
admin.site.register(Train)
admin.site.register(Vagon)
admin.site.register(Seat)
admin.site.register(Ticket)