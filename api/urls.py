from django.urls import path
from .views import city_list, train_list, create_tickets, cancel_ticket,departures,train_detail,get_ticket

app_name='api'

urlpatterns = [
    path('city/', city_list, name='city_list'),
    path('trains/', train_list, name='train_list'),
    path('trains/<int:pk>/', train_detail, name='train_detail'),
    path('tickets/', create_tickets, name='create_tickets'),  # POST
    path('tickets/<str:ticket_number>/', get_ticket, name='get_ticket'),  # GET
    path('tickets/<str:ticket_number>/cancel/', cancel_ticket, name='cancel_ticket'),  # DELETE
    path('departures/', departures, name='departures'),
]


