from django.urls import path
from .views import (
    index,
    booking,
    check_ticket,
    payment_success,
    wanted_trains,
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

    # DRF API
    path('cities/', CityListView.as_view(), name='cities'),
    path('departures/', TrainListView.as_view(), name='departures'),
    path('trains/<int:pk>/', TrainDetailView.as_view(), name='train-detail'),
    path('tickets/', TicketCreateView.as_view(), name='tickets'),
]