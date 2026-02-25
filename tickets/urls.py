from django.urls import path
from . import views


urlpatterns = [
    path('', views.index, name='index'),
    path('booking/', views.booking, name='booking'),
    path('check-ticket/', views.check_ticket, name='check_ticket'),
    path('payment-success/', views.payment_success, name='payment_success'),
    path('wanted-trains/', views.wanted_trains, name='wanted_trains'),
    path('api/departures/', views.TrainListView.as_view(), name='train_list'),
    path('api/trains/<int:pk>/', views.TrainDetailView.as_view(), name='train_detail'),
    path('api/tickets/', views.TicketCreateView.as_view(), name='ticket_create'),
]