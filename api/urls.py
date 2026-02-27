from django.urls import path
from api.views import train,city,vagon,seat,ticket

app_name='api'

urlpatterns=[
    path('train/', train, name='train'),
    path('city/', city, name='city'),
    path('vagon/', vagon, name='vagon'),
    path('seat/', seat, name='seat'),
    path('ticket/', ticket, name='ticket'),
]