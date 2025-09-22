"""
Stripe Webhook Integration Tests

This module tests the complete webhook handling flow for Stripe events,
including payment_intent.succeeded, payment_intent.payment_failed, and other events.
"""

import json
import hmac
import hashlib
import time
import stripe
from django.test import TestCase, TransactionTestCase
from django.conf import settings
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock

from adminpanel.models import Order, OrderItem, Product
from adminpanel.views_stripe import stripe_webhook


class StripeWebhookTests(TestCase):
    """Test Stripe webhook handling"""
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        stripe.api_key = settings.STRIPE_SECRET_KEY
    
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Test Product",
            description="Test product for webhook testing",
            price=29.99,
            stock=10,
            is_active=True
        )
    
    def generate_stripe_signature(self, payload, secret):
        """Generate valid Stripe webhook signature for testing"""
        timestamp = str(int(time.time()))
        payload_with_timestamp = f"{timestamp}.{payload}"
        signature = hmac.new(
            secret.encode(),
            payload_with_timestamp.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"t={timestamp},v1={signature}"
    
    def test_payment_intent_succeeded_webhook(self):
        """Test successful payment webhook"""
        # Create a test order first
        order = Order.objects.create(
            customer_email="test@example.com",
            customer_phone="+44123456789",
            subtotal=29.99,
            shipping_cost=5.99,
            tax_amount=0.0,
            total_price=35.98,
            currency="GBP",
            payment_method="credit_card",
            payment_id="pi_test_webhook_success",
            status="pending"
        )
        
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            unit_price=29.99
        )
        
        # Create webhook payload
        webhook_payload = {
            "id": f"evt_test_{int(time.time())}",
            "object": "event",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_webhook_success",
                    "object": "payment_intent",
                    "amount": 3598,  # £35.98 in pence
                    "currency": "gbp",
                    "status": "succeeded",
                    "metadata": {
                        "order_id": str(order.id)
                    }
                }
            }
        }
        
        payload_json = json.dumps(webhook_payload)
        
        # Generate signature (using a test secret)
        test_secret = "whsec_test_webhook_secret"
        signature = self.generate_stripe_signature(payload_json, test_secret)
        
        # Mock the webhook secret check
        with patch.object(settings, 'STRIPE_WEBHOOK_SECRET', test_secret):
            response = self.client.post(
                '/api/public/stripe/webhook/',
                data=payload_json,
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE=signature
            )
        
        # Verify webhook was processed
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data['status'], 'success')
        
        # Verify order status was updated
        order.refresh_from_db()
        self.assertEqual(order.status, 'paid')
        
        print("✅ Payment succeeded webhook processed correctly")
    
    def test_payment_intent_failed_webhook(self):
        """Test failed payment webhook"""
        # Create a test order
        order = Order.objects.create(
            customer_email="test@example.com",
            customer_phone="+44123456789",
            subtotal=29.99,
            shipping_cost=5.99,
            tax_amount=0.0,
            total_price=35.98,
            currency="GBP",
            payment_method="credit_card",
            payment_id="pi_test_webhook_failed",
            status="pending"
        )
        
        # Create webhook payload for failed payment
        webhook_payload = {
            "id": f"evt_test_{int(time.time())}",
            "object": "event",
            "type": "payment_intent.payment_failed",
            "data": {
                "object": {
                    "id": "pi_test_webhook_failed",
                    "object": "payment_intent",
                    "amount": 3598,
                    "currency": "gbp",
                    "status": "requires_payment_method",
                    "last_payment_error": {
                        "type": "card_error",
                        "code": "card_declined",
                        "message": "Your card was declined."
                    },
                    "metadata": {
                        "order_id": str(order.id)
                    }
                }
            }
        }
        
        payload_json = json.dumps(webhook_payload)
        test_secret = "whsec_test_webhook_secret"
        signature = self.generate_stripe_signature(payload_json, test_secret)
        
        with patch.object(settings, 'STRIPE_WEBHOOK_SECRET', test_secret):
            response = self.client.post(
                '/api/public/stripe/webhook/',
                data=payload_json,
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE=signature
            )
        
        self.assertEqual(response.status_code, 200)
        
        # Verify order status was updated
        order.refresh_from_db()
        self.assertEqual(order.status, 'payment_failed')
        
        print("✅ Payment failed webhook processed correctly")
    
    def test_invalid_webhook_signature(self):
        """Test webhook with invalid signature"""
        webhook_payload = {
            "id": "evt_test_invalid",
            "object": "event",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_invalid",
                    "status": "succeeded"
                }
            }
        }
        
        payload_json = json.dumps(webhook_payload)
        
        # Use invalid signature
        response = self.client.post(
            '/api/public/stripe/webhook/',
            data=payload_json,
            content_type='application/json',
            HTTP_STRIPE_SIGNATURE="invalid_signature"
        )
        
        # Should return 400 for invalid signature
        self.assertEqual(response.status_code, 400)
        response_data = response.json()
        self.assertIn('error', response_data)
        
        print("✅ Invalid signature properly rejected")
    
    def test_unknown_webhook_event(self):
        """Test handling of unknown webhook event types"""
        webhook_payload = {
            "id": f"evt_test_{int(time.time())}",
            "object": "event",
            "type": "unknown.event.type",
            "data": {
                "object": {
                    "id": "obj_test_unknown"
                }
            }
        }
        
        payload_json = json.dumps(webhook_payload)
        test_secret = "whsec_test_webhook_secret"
        signature = self.generate_stripe_signature(payload_json, test_secret)
        
        with patch.object(settings, 'STRIPE_WEBHOOK_SECRET', test_secret):
            response = self.client.post(
                '/api/public/stripe/webhook/',
                data=payload_json,
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE=signature
            )
        
        # Should still return 200 for unknown events
        self.assertEqual(response.status_code, 200)
        response_data = response.json()
        self.assertEqual(response_data['status'], 'success')
        
        print("✅ Unknown webhook event handled gracefully")
    
    def test_webhook_with_missing_order(self):
        """Test webhook processing when order doesn't exist"""
        webhook_payload = {
            "id": f"evt_test_{int(time.time())}",
            "object": "event",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_nonexistent_order",
                    "object": "payment_intent",
                    "amount": 3598,
                    "currency": "gbp",
                    "status": "succeeded",
                    "metadata": {
                        "order_id": "999999"  # Non-existent order ID
                    }
                }
            }
        }
        
        payload_json = json.dumps(webhook_payload)
        test_secret = "whsec_test_webhook_secret"
        signature = self.generate_stripe_signature(payload_json, test_secret)
        
        with patch.object(settings, 'STRIPE_WEBHOOK_SECRET', test_secret):
            response = self.client.post(
                '/api/public/stripe/webhook/',
                data=payload_json,
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE=signature
            )
        
        # Should still return 200 but log the error
        self.assertEqual(response.status_code, 200)
        
        print("✅ Webhook with missing order handled gracefully")
    
    @patch('adminpanel.views_stripe.logger')
    def test_webhook_error_handling(self, mock_logger):
        """Test webhook error handling and logging"""
        # Create webhook payload that will cause an error
        webhook_payload = {
            "id": f"evt_test_{int(time.time())}",
            "object": "event",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_test_error_handling",
                    "object": "payment_intent",
                    "amount": 3598,
                    "currency": "gbp",
                    "status": "succeeded",
                    "metadata": {
                        "order_id": "invalid_uuid"  # This will cause an error
                    }
                }
            }
        }
        
        payload_json = json.dumps(webhook_payload)
        test_secret = "whsec_test_webhook_secret"
        signature = self.generate_stripe_signature(payload_json, test_secret)
        
        with patch.object(settings, 'STRIPE_WEBHOOK_SECRET', test_secret):
            response = self.client.post(
                '/api/public/stripe/webhook/',
                data=payload_json,
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE=signature
            )
        
        # Should return 200 even if there's an error processing the event
        self.assertEqual(response.status_code, 200)
        
        # Verify error was logged
        mock_logger.error.assert_called()
        
        print("✅ Webhook error handling and logging verified")


class StripeWebhookIntegrationTests(TransactionTestCase):
    """Integration tests for complete webhook flow"""
    
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        stripe.api_key = settings.STRIPE_SECRET_KEY
    
    def setUp(self):
        self.client = APIClient()
        self.product = Product.objects.create(
            name="Integration Test Product",
            description="Product for integration testing",
            price=19.99,
            stock=5,
            is_active=True
        )
    
    def test_complete_webhook_flow(self):
        """Test complete webhook processing flow"""
        # Step 1: Create order
        order = Order.objects.create(
            customer_email="integration@example.com",
            customer_phone="+44123456789",
            subtotal=19.99,
            shipping_cost=4.99,
            tax_amount=0.0,
            total_price=24.98,
            currency="GBP",
            payment_method="credit_card",
            payment_id="pi_integration_test",
            status="pending"
        )
        
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            unit_price=19.99
        )
        
        # Step 2: Simulate payment success webhook
        webhook_payload = {
            "id": f"evt_integration_{int(time.time())}",
            "object": "event",
            "type": "payment_intent.succeeded",
            "data": {
                "object": {
                    "id": "pi_integration_test",
                    "object": "payment_intent",
                    "amount": 2498,  # £24.98 in pence
                    "currency": "gbp",
                    "status": "succeeded",
                    "metadata": {
                        "order_id": str(order.id),
                        "customer_email": "integration@example.com"
                    }
                }
            }
        }
        
        payload_json = json.dumps(webhook_payload)
        test_secret = "whsec_integration_test"
        signature = self.generate_stripe_signature(payload_json, test_secret)
        
        with patch.object(settings, 'STRIPE_WEBHOOK_SECRET', test_secret):
            response = self.client.post(
                '/api/public/stripe/webhook/',
                data=payload_json,
                content_type='application/json',
                HTTP_STRIPE_SIGNATURE=signature
            )
        
        # Step 3: Verify webhook processing
        self.assertEqual(response.status_code, 200)
        
        # Step 4: Verify order was updated
        order.refresh_from_db()
        self.assertEqual(order.status, 'paid')
        
        # Step 5: Verify order items are still intact
        order_items = OrderItem.objects.filter(order=order)
        self.assertEqual(order_items.count(), 1)
        self.assertEqual(order_items.first().product, self.product)
        
        print("✅ Complete webhook integration flow successful")
    
    def generate_stripe_signature(self, payload, secret):
        """Generate valid Stripe webhook signature for testing"""
        timestamp = str(int(time.time()))
        payload_with_timestamp = f"{timestamp}.{payload}"
        signature = hmac.new(
            secret.encode(),
            payload_with_timestamp.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"t={timestamp},v1={signature}"


if __name__ == '__main__':
    import django
    from django.conf import settings
    from django.test.utils import get_runner
    
    import os
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(['test_stripe_webhook'])
