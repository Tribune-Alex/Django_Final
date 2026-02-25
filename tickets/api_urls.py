from django.urls import path
from .views import TrainListView, TrainDetailView, TicketCreateView

urlpatterns = [
    path('departures/', TrainListView.as_view(), name='train_list'),
    path('trains/<int:pk>/', TrainDetailView.as_view(), name='train_detail'),
    path('tickets/', TicketCreateView.as_view(), name='ticket_create'),
]