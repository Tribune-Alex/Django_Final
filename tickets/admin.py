from django.contrib import admin
from .models import Train, Ticket,Vagon,Seat

# Register your models here.
class SeatInline(admin.TabularInline):
    model = Seat
    extra = 0
    fields = ('seat_number', 'is_occupied')


class VagonInline(admin.TabularInline):
    model = Vagon
    extra = 0
    fields = ('number',)


@admin.register(Train)
class TrainAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'source', 'destination', 'departure', 'arrival')
    search_fields = ('name', 'number', 'source', 'destination')
    list_filter = ('source', 'destination', 'departure')
    inlines = [VagonInline]


@admin.register(Vagon)
class VagonAdmin(admin.ModelAdmin):
    list_display = ('number', 'train')
    search_fields = ('number', 'train__name', 'train__number')
    inlines = [SeatInline]


@admin.register(Seat)
class SeatAdmin(admin.ModelAdmin):
    list_display = ('seat_number', 'vagon', 'is_occupied')
    list_filter = ('is_occupied', 'vagon__train')
    search_fields = ('seat_number', 'vagon__number', 'vagon__train__name')


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('user', 'train', 'seat', 'price', 'booked_at')
    list_filter = ('train', 'booked_at')
    search_fields = ('user__username', 'train__name', 'seat__seat_number')
    readonly_fields = ('booked_at',)
