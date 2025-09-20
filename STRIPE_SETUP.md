# Stripe Payment Integration Setup

This guide will help you integrate Stripe payments into your e-commerce platform.

## 📋 Prerequisites

- Stripe account (create at [stripe.com](https://stripe.com))
- Python 3.8+ (for backend)
- Node.js 16+ (for frontend)
- Django REST Framework
- React with TypeScript

## 🔧 Backend Setup (Django)

### 1. Install Stripe Python SDK

```bash
cd Backend
pip install stripe
```

### 2. Add Stripe to Requirements

Add to `requirements.txt`:
```
stripe==7.8.0
```

### 3. Environment Variables

Create/update `.env` file in Backend directory:
```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Django Settings
SECRET_KEY=your_django_secret_key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 4. Django Settings Configuration

Update `Backend/core/settings.py`:

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET')

# Add to INSTALLED_APPS
INSTALLED_APPS = [
    # ... existing apps
    'adminpanel',
    'accounts',
]

# CORS settings for frontend
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Storefront
    "http://localhost:5174",  # Admin panel
]

CORS_ALLOW_CREDENTIALS = True
```

### 5. Create Stripe Payment Models

Create `Backend/adminpanel/models.py` additions:

```python
from django.db import models
import uuid

class Payment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='payments')
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='usd')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment {self.id} - {self.status}"
```

### 6. Create Stripe Views

Create `Backend/adminpanel/views_stripe.py`:

```python
import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.utils.decorators import method_decorator
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import json
import logging

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

@api_view(['POST'])
@permission_classes([AllowAny])
def create_payment_intent(request):
    """Create a Stripe Payment Intent"""
    try:
        data = request.data
        amount = int(float(data.get('amount', 0)) * 100)  # Convert to cents
        currency = data.get('currency', 'usd')
        
        # Create Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={
                'order_id': data.get('order_id'),
                'user_id': data.get('user_id', 'guest'),
            }
        )
        
        return Response({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
        })
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Payment intent creation error: {str(e)}")
        return Response(
            {'error': 'Payment processing failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@csrf_exempt
@require_POST
def stripe_webhook(request):
    """Handle Stripe webhooks"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.error("Invalid payload")
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature")
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        handle_payment_succeeded(payment_intent)
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        handle_payment_failed(payment_intent)
    
    return JsonResponse({'status': 'success'})

def handle_payment_succeeded(payment_intent):
    """Handle successful payment"""
    try:
        payment_id = payment_intent['id']
        order_id = payment_intent['metadata'].get('order_id')
        
        # Update order status
        from .models import Order, Payment
        order = Order.objects.get(id=order_id)
        order.status = 'paid'
        order.save()
        
        # Create payment record
        Payment.objects.create(
            order=order,
            stripe_payment_intent_id=payment_id,
            amount=payment_intent['amount'] / 100,
            status='completed'
        )
        
        logger.info(f"Payment succeeded for order {order_id}")
        
    except Exception as e:
        logger.error(f"Error handling payment success: {str(e)}")

def handle_payment_failed(payment_intent):
    """Handle failed payment"""
    try:
        payment_id = payment_intent['id']
        order_id = payment_intent['metadata'].get('order_id')
        
        # Update order status
        from .models import Order, Payment
        order = Order.objects.get(id=order_id)
        order.status = 'payment_failed'
        order.save()
        
        # Create payment record
        Payment.objects.create(
            order=order,
            stripe_payment_intent_id=payment_id,
            amount=payment_intent['amount'] / 100,
            status='failed'
        )
        
        logger.info(f"Payment failed for order {order_id}")
        
    except Exception as e:
        logger.error(f"Error handling payment failure: {str(e)}")
```

### 7. Add Stripe URLs

Update `Backend/adminpanel/urls_public.py`:

```python
from django.urls import path
from .views_stripe import create_payment_intent, stripe_webhook

urlpatterns = [
    # ... existing patterns
    path('stripe/create-payment-intent/', create_payment_intent, name='create-payment-intent'),
    path('stripe/webhook/', stripe_webhook, name='stripe-webhook'),
]
```

### 8. Database Migration

```bash
cd Backend
python manage.py makemigrations
python manage.py migrate
```

## 🎨 Frontend Setup (React)

### 1. Install Stripe React SDK

```bash
cd Frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Create Stripe Configuration

Create `Frontend/src/storefront/lib/stripe.ts`:

```typescript
import { loadStripe } from '@stripe/stripe-js';

// Replace with your publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
};
```

### 3. Create Payment Component

Create `Frontend/src/storefront/components/payment/StripePayment.tsx`:

```typescript
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_your_publishable_key_here');

const PaymentForm: React.FC<{
  amount: number;
  orderId: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}> = ({ amount, orderId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment intent
      const response = await fetch('http://127.0.0.1:8001/api/public/stripe/create-payment-intent/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'usd',
          order_id: orderId,
        }),
      });

      const { client_secret } = await response.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      }
    } catch (error) {
      onError('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

const StripePayment: React.FC<{
  amount: number;
  orderId: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePayment;
```

### 4. Update Checkout Page

Update `Frontend/src/storefront/pages/Checkout.tsx`:

```typescript
import StripePayment from '../components/payment/StripePayment';

// Add to your checkout component
const handlePaymentSuccess = (paymentIntent: any) => {
  // Redirect to success page
  navigate(`/order-confirmation/${orderId}`);
};

const handlePaymentError = (error: string) => {
  // Show error message
  console.error('Payment error:', error);
};

// In your JSX
<StripePayment
  amount={totalAmount}
  orderId={orderId}
  onSuccess={handlePaymentSuccess}
  onError={handlePaymentError}
/>
```

## 🔧 Stripe Dashboard Configuration

### 1. Webhook Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set URL: `http://127.0.0.1:8001/api/public/stripe/webhook/`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook secret to your `.env` file

### 2. Test Cards

Use these test card numbers:

```
Success: 4242 4242 4242 4242
Declined: 4000 0000 0000 0002
Requires authentication: 4000 0025 0000 3155
```

## 🚀 Testing

### 1. Start Backend Server

```bash
cd Backend
python manage.py runserver 8001
```

### 2. Start Frontend Server

```bash
cd Frontend
npm run dev
```

### 3. Test Payment Flow

1. Add items to cart
2. Go to checkout
3. Fill in payment details
4. Use test card: `4242 4242 4242 4242`
5. Complete payment

## 🔒 Security Considerations

1. **Never expose secret keys** in frontend code
2. **Use HTTPS** in production
3. **Validate webhook signatures**
4. **Implement proper error handling**
5. **Log all payment events**

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Components](https://stripe.com/docs/stripe-js/react)
- [Webhook Security](https://stripe.com/docs/webhooks/signatures)
- [Testing Guide](https://stripe.com/docs/testing)

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is configured in Django settings
2. **Webhook Failures**: Check webhook URL and secret
3. **Payment Failures**: Verify test card numbers and amounts
4. **Key Errors**: Ensure all environment variables are set correctly

### Debug Commands

```bash
# Check Stripe CLI (if installed)
stripe listen --forward-to localhost:8001/api/public/stripe/webhook/

# Test webhook locally
stripe trigger payment_intent.succeeded
```

---

**Note**: This setup is for development. For production, ensure you:
- Use live keys instead of test keys
- Set up proper SSL certificates
- Configure production webhook endpoints
- Implement proper error monitoring
