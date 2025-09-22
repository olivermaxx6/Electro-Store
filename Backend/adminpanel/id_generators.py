import random
import string
from django.db import models


def generate_tracking_id():
    """
    Generate a tracking ID in the format: sppix_ + 16 digits
    Example: sppix_1234567890123456
    """
    # Generate 16 random digits
    digits = ''.join(random.choices(string.digits, k=16))
    return f"sppix_{digits}"


def generate_payment_id():
    """
    Generate a payment ID in the format: sppix_py_ + 16 digits
    Example: sppix_py_1234567890123456
    """
    # Generate 16 random digits
    digits = ''.join(random.choices(string.digits, k=16))
    return f"sppix_py_{digits}"


def generate_unique_tracking_id():
    """
    Generate a unique tracking ID that doesn't already exist in the database
    """
    from .models import Order
    
    while True:
        tracking_id = generate_tracking_id()
        if not Order.objects.filter(tracking_id=tracking_id).exists():
            return tracking_id


def generate_unique_payment_id():
    """
    Generate a unique payment ID that doesn't already exist in the database
    """
    from .models import Order
    
    while True:
        payment_id = generate_payment_id()
        if not Order.objects.filter(payment_id=payment_id).exists():
            return payment_id
