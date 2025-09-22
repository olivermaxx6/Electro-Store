# Complete E-commerce Checkout Data Flow Analysis

## Overview
This document explains the complete data flow from the checkout page through Stripe payment processing to order confirmation and admin management.

## 1. Frontend Checkout Page (`Checkout.tsx`)

### Initial State
- User adds items to cart (Redux store)
- User navigates to `/checkout`
- Cart items, user info, and products are loaded from Redux store

### Checkout Process
1. **Address Collection** (Step 1)
   - User fills shipping address form
   - Data stored in local state: `address` (firstName, lastName, email, phone, address1, address2, city, state, postcode)
   - Auto-save to localStorage if enabled

2. **Shipping Selection** (Step 2)
   - User selects shipping option (Standard/Express)
   - Shipping cost calculated from store settings
   - Data stored in local state: `selectedShipping`

3. **Payment Method** (Step 3)
   - User sees "Secure Payment with Stripe" option
   - No direct card input (handled by Stripe)

4. **Order Review** (Step 4)
   - Final totals calculated (subtotal + shipping + tax)
   - User reviews order details

### Payment Processing Flow

```javascript
// When user clicks "Complete Order"
const handlePayment = async () => {
  // 1. Calculate final total
  const finalTotal = cartTotal + shippingCost + taxAmount;
  
  // 2. Prepare order data for localStorage
  const orderData = {
    id: Date.now(), // Temporary ID
    tracking_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    payment_id: '', // Will be updated after Stripe
    customer_email: address.email,
    customer_phone: address.phone,
    shipping_address: address,
    subtotal: cartTotal,
    shipping_cost: shippingCost,
    tax_amount: taxAmount,
    total_price: finalTotal,
    payment_method: 'card',
    shipping_name: selectedShippingOption.name,
    created_at: new Date().toISOString(),
    items: cartItems.map(item => ({
      product_id: item.productId,
      quantity: item.qty,
      unit_price: products.find(p => p.id === item.productId)?.price || 0
    }))
  };
  
  // 3. Store in localStorage for immediate display
  localStorage.setItem('pendingOrder', JSON.stringify(orderData));
  localStorage.setItem('orderCheckoutTimestamp', Date.now().toString());
  
  // 4. Create Stripe checkout session
  const response = await fetch('http://127.0.0.1:8001/api/public/create-checkout-session/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cart_items: cartItems.map(item => ({
        product_id: item.productId,
        quantity: item.qty,
        unit_price: products.find(p => p.id === item.productId)?.price || 0
      })),
      customer_email: address.email,
      shipping_address: address,
      shipping_name: selectedShippingOption.name,
      subtotal: cartTotal,
      shipping_cost: shippingCost,
      tax_amount: taxAmount,
      total_price: finalTotal,
      user_id: currentUser?.id || 'guest'
    })
  });
  
  // 5. Update localStorage with Stripe session ID
  const checkoutResult = await response.json();
  const updatedOrderData = {
    ...orderData,
    payment_id: checkoutResult.checkout_session_id,
    tracking_id: checkoutResult.checkout_session_id // Use Stripe session ID as tracking ID
  };
  localStorage.setItem('pendingOrder', JSON.stringify(updatedOrderData));
  
  // 6. Clear cart and redirect to Stripe
  dispatch(clearCart({ userId }));
  window.location.href = checkoutResult.checkout_url;
};
```

## 2. Backend Stripe Integration

### Checkout Session Creation (`StripeCheckoutViewSet`)

```python
def create(self, request):
    # 1. Extract checkout data
    cart_items = request.data.get('cart_items', [])
    customer_email = request.data.get('customer_email', '')
    shipping_address = request.data.get('shipping_address', {})
    total_price = request.data.get('total_price', 0)
    
    # 2. Prepare Stripe line items
    line_items = []
    for item in cart_items:
        product = Product.objects.get(id=item['product_id'])
        line_items.append({
            'price_data': {
                'currency': 'gbp',
                'product_data': {
                    'name': product.name,
                    'description': product.description[:500],
                },
                'unit_amount': int(float(item['unit_price']) * 100), # Convert to pence
            },
            'quantity': item['quantity'],
        })
    
    # 3. Create Stripe checkout session
    checkout_session = stripe.checkout.Session.create(
        payment_method_types=['card'],
        line_items=line_items,
        mode='payment',
        customer_email=customer_email,
        shipping_address_collection={
            'allowed_countries': ['GB', 'US', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'],
        },
        shipping_options=[{
            'shipping_rate_data': {
                'type': 'fixed_amount',
                'fixed_amount': {
                    'amount': int(float(shipping_cost) * 100),
                    'currency': 'gbp',
                },
                'display_name': shipping_name,
            },
        }],
        success_url='http://127.0.0.1:5173/order-confirmation/{CHECKOUT_SESSION_ID}',
        cancel_url='http://127.0.0.1:5173/checkout?cancelled=true',
        metadata={
            'user_id': request.data.get('user_id', 'guest'),
            'order_type': 'checkout',
            'subtotal': str(subtotal),
            'shipping_cost': str(shipping_cost),
            'tax_amount': str(tax_amount),
            'total_price': str(total_price),
        }
    )
    
    return Response({
        'checkout_session_id': checkout_session.id,
        'checkout_url': checkout_session.url,
        'message': 'Checkout session created successfully'
    })
```

## 3. Stripe Payment Processing

### User Experience on Stripe
1. User is redirected to Stripe's secure checkout page
2. User enters payment details (card number, expiry, CVV)
3. Stripe processes the payment
4. On success: Redirect to `order-confirmation/{CHECKOUT_SESSION_ID}`
5. On cancel: Redirect to `checkout?cancelled=true`

## 4. Stripe Webhook Processing

### Webhook Handler (`stripe_webhook`)

```python
def stripe_webhook(request):
    # 1. Verify webhook signature
    event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    
    # 2. Handle different event types
    event_type = event['type']
    
    if event_type == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_session_completed(session)
    elif event_type == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        handle_payment_succeeded(payment_intent)
    # ... other event types

def handle_checkout_session_completed(session):
    # 1. Extract session data
    session_id = session['id']
    payment_intent_id = session['payment_intent']
    amount_total = session['amount_total'] / 100
    customer_email = session.get('customer_email', '')
    
    # 2. Extract shipping information
    shipping_address = {}
    if 'shipping_details' in session and session['shipping_details']:
        shipping_details = session['shipping_details']
        addr = shipping_details['address']
        shipping_address = {
            'firstName': shipping_details.get('name', '').split(' ')[0],
            'lastName': ' '.join(shipping_details.get('name', '').split(' ')[1:]),
            'address1': addr.get('line1', ''),
            'address2': addr.get('line2', ''),
            'city': addr.get('city', ''),
            'state': addr.get('state', ''),
            'postcode': addr.get('postal_code', ''),
            'country': addr.get('country', '')
        }
    
    # 3. Check if order already exists or create new one
    try:
        order = Order.objects.get(tracking_id=session_id)
        # Update existing order with real data
        order.payment_id = payment_intent_id
        order.customer_email = customer_email
        order.shipping_address = shipping_address
        order.total_price = amount_total
        order.payment_status = 'paid'
        order.save()
    except Order.DoesNotExist:
        # Create new order
        order = Order.objects.create(
            user=None, # Guest order
            tracking_id=session_id,
            payment_id=payment_intent_id,
            customer_email=customer_email,
            shipping_address=shipping_address,
            total_price=amount_total,
            payment_method='card',
            status='pending',
            payment_status='paid'
        )
    
    # 4. Create order items from Stripe line items
    line_items = stripe.checkout.Session.list_line_items(session_id)
    for item in line_items.data:
        product_name = item['description']
        products = Product.objects.filter(name__icontains=product_name.split(' - ')[0])
        if products.exists():
            product = products.first()
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item['quantity'],
                unit_price=item['price']['unit_amount'] / 100
            )
    
    # 5. Create payment record
    Payment.objects.create(
        order=order,
        stripe_payment_intent_id=payment_intent_id,
        amount=amount_total,
        currency=currency,
        status='completed'
    )
    
    # 6. Send notification to admin panel
    send_order_notification_to_admin(order)
```

## 5. Order Confirmation Page (`OrderConfirmation.tsx`)

### Data Loading Process

```javascript
const OrderConfirmation = () => {
  const { trackingId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrder = async () => {
      // 1. Try to fetch from database first
      try {
        const orderData = await fetchUpdatedOrderFromBackend(trackingId);
        if (orderData) {
          setOrder(orderData);
          return;
        }
      } catch (error) {
        console.log('Database fetch failed:', error);
      }
      
      // 2. Fallback to localStorage for immediate display
      const storedOrder = localStorage.getItem('pendingOrder');
      const checkoutTimestamp = localStorage.getItem('orderCheckoutTimestamp');
      
      if (storedOrder && checkoutTimestamp) {
        const orderAge = Date.now() - parseInt(checkoutTimestamp);
        const maxAge = 30 * 60 * 1000; // 30 minutes
        
        if (orderAge < maxAge) {
          const tempOrder = JSON.parse(storedOrder);
          tempOrder.id = 0; // Placeholder ID
          setOrder(tempOrder);
          
          // Clean up localStorage
          localStorage.removeItem('pendingOrder');
          localStorage.removeItem('orderCheckoutTimestamp');
          
          // Try to fetch real data in background
          setTimeout(async () => {
            try {
              const realOrder = await fetchUpdatedOrderFromBackend(trackingId, tempOrder);
              if (realOrder) {
                setOrder(realOrder);
              }
            } catch (error) {
              console.log('Background fetch failed');
            }
          }, 2000);
        }
      }
    };
    
    if (trackingId) {
      fetchOrder();
    }
  }, [trackingId]);
};
```

### Order Data Endpoints

1. **Track Order Endpoint**: `/api/public/track-order/{tracking_id}/`
   - Returns order details by tracking ID
   - Includes order items, customer info, shipping details

2. **Checkout Session Endpoint**: `/api/public/checkout-session/{session_id}/`
   - Returns order data associated with Stripe session
   - Used for Stripe checkout session IDs

## 6. Admin Orders Management

### Admin Orders Page (`OrdersPage.jsx`)

```javascript
const OrdersPage = () => {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  
  const load = async () => {
    const { data } = await listOrders({ page, status: status || undefined });
    setRows(data.results || data);
  };
  
  const update = async (id, newStatus) => {
    await updateOrder(id, { status: newStatus });
    await load(); // Reload orders
  };
  
  const deleteOrder = async (id) => {
    await deleteOrder(id);
    await load(); // Reload orders
  };
};
```

### Admin API Endpoints

1. **List Orders**: `/api/orders/` (Admin only)
   - Returns paginated list of orders
   - Supports filtering by status
   - Includes order items and customer details

2. **Update Order**: `/api/orders/{id}/` (PATCH)
   - Allows admin to update order status
   - Updates: pending → processing → shipped → delivered

3. **Delete Order**: `/api/orders/{id}/` (DELETE)
   - Allows admin to delete orders
   - Cascades to delete order items

## 7. Real-time Notifications

### WebSocket Integration
- Admin panel receives real-time notifications when new orders are created
- Uses Django Channels for WebSocket communication
- Order notifications sent via `send_order_notification_to_admin()`

## 8. Data Flow Summary

```
1. Frontend Checkout
   ↓ (Store order data in localStorage)
   ↓ (Create Stripe checkout session)
   ↓ (Redirect to Stripe)

2. Stripe Payment Processing
   ↓ (User completes payment)
   ↓ (Stripe webhook triggered)

3. Backend Webhook Processing
   ↓ (Create/update order in database)
   ↓ (Create order items)
   ↓ (Create payment record)
   ↓ (Send admin notification)

4. Order Confirmation Page
   ↓ (Fetch order from database)
   ↓ (Display order details)
   ↓ (Fallback to localStorage if needed)

5. Admin Management
   ↓ (View orders in admin panel)
   ↓ (Update order status)
   ↓ (Manage order fulfillment)
```

## 9. Key Data Structures

### Order Model
```python
class Order(models.Model):
    user = models.ForeignKey(User, null=True, blank=True)
    tracking_id = models.CharField(max_length=255, unique=True)
    payment_id = models.CharField(max_length=255)
    customer_email = models.EmailField()
    customer_phone = models.CharField(max_length=20, blank=True)
    shipping_address = models.JSONField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=ORDER_STATUS_CHOICES)
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES)
    payment_method = models.CharField(max_length=50)
    shipping_name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
```

### OrderItem Model
```python
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
```

### Payment Model
```python
class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    stripe_payment_intent_id = models.CharField(max_length=255, unique=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='GBP')
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
```

This comprehensive flow ensures secure payment processing, proper order management, and real-time updates across the entire system.
