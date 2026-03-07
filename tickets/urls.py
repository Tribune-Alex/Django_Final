from django.urls import path
from .views import (
    index,
    booking,
    check_ticket,
    payment_success,
    wanted_trains,
    payment_page,
    CityListView,
    TrainListView,
    TrainDetailView,
    TicketCreateView,
)

urlpatterns = [
    path('', index, name='index'),
    path('booking/', booking, name='booking'),
    path('check_ticket/', check_ticket, name='check_ticket'),
    path('payment_success/', payment_success, name='payment_success'),
    path('wanted-trains/', wanted_trains, name='wanted_trains'),
    path('payment/', payment_page, name='payment_page')
]