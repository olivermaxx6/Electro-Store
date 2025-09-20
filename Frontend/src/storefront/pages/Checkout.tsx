import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCartItems, selectCartTotal } from '../store/cartSlice';
import { selectProducts } from '../store/productsSlice';
import { addToast } from '../store/uiSlice';
import { formatCurrency } from '../lib/format';
import { Currency } from '../lib/types';
import { useStoreSettings } from '../hooks/useStoreSettings';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import TitleUpdater from '../components/common/TitleUpdater';

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  cost: number;
  days: string;
}

interface AddressForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
}

interface PaymentForm {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

const Checkout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // Redux state
  const cartItems = useSelector(selectCartItems('guest'));
  const products = useSelector(selectProducts);
  const cartTotal = useSelector(selectCartTotal('guest'));
  const { settings } = useStoreSettings();
  
  // Form state
  const [address, setAddress] = useState<AddressForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postcode: ''
  });
  
  const [payment, setPayment] = useState<PaymentForm>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  
  const [selectedShipping, setSelectedShipping] = useState<string>('standard');
  // Dynamic shipping options based on admin settings
  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      cost: parseFloat((settings as any)?.standard_shipping_rate?.toString() || '0') || 0,
      days: '5-7 business days'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      cost: parseFloat((settings as any)?.express_shipping_rate?.toString() || '0') || 0,
      days: '2-3 business days'
    }
  ];
  
  const steps = [
    { id: 1, title: 'Address', description: 'Shipping information' },
    { id: 2, title: 'Shipping', description: 'Delivery options' },
    { id: 3, title: 'Payment', description: 'Payment method' },
    { id: 4, title: 'Review', description: 'Order summary' },
  ];
  
  // Note: Shipping rates and tax rates are now loaded dynamically via useStoreSettings hook
  // No need for separate API call since settings are already available
  
  const selectedShippingOption = shippingOptions.find(option => option.id === selectedShipping);
  const shippingCost = selectedShippingOption?.cost || 0;
  const taxRate = parseFloat(settings?.tax_rate?.toString() || '0') || 0;
  const taxAmount = (cartTotal * taxRate) / 100;
  const finalTotal = cartTotal + shippingCost + taxAmount;
  
  const handleAddressChange = (field: keyof AddressForm, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };
  
  const handlePaymentChange = (field: keyof PaymentForm, value: string) => {
    setPayment(prev => ({ ...prev, [field]: value }));
  };

  const hasValidationError = (fieldName: string): boolean => {
    return validationErrors.includes(fieldName);
  };

  const getInputClassName = (fieldName: string, baseClassName: string): string => {
    const hasError = hasValidationError(fieldName);
    return hasError 
      ? `${baseClassName} border-red-500 focus:ring-red-500 focus:border-red-500` 
      : baseClassName;
  };
  
  // Note: validateStep removed - all steps now proceed without validation
  // Validation is only done on Place Order button click

  const validateAllFields = (): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];
    
    // Address validation
    if (!address.firstName?.trim()) missingFields.push('First Name');
    if (!address.lastName?.trim()) missingFields.push('Last Name');
    if (!address.email?.trim()) missingFields.push('Email');
    if (!address.phone?.trim()) missingFields.push('Phone');
    if (!address.address1?.trim()) missingFields.push('Address');
    if (!address.city?.trim()) missingFields.push('City');
    if (!address.state?.trim()) missingFields.push('State');
    if (!address.postcode?.trim()) missingFields.push('Post Code');
    
    // Shipping validation
    if (!selectedShipping) missingFields.push('Shipping Option');
    
    // Payment validation
    if (!payment.cardNumber?.trim()) missingFields.push('Card Number');
    if (!payment.expiryDate?.trim()) missingFields.push('Expiry Date');
    if (!payment.cvv?.trim()) missingFields.push('CVV');
    if (!payment.cardholderName?.trim()) missingFields.push('Cardholder Name');
    
    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };
  
  const handleNext = () => {
    // Allow proceeding to next step without validation
    setCurrentStep(prev => prev + 1);
  };
  
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };
  
  const formatExpiryDate = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
  };
  
  const generatePaymentId = () => {
    return 'pay_' + Math.random().toString(36).substr(2, 9);
  };
  
  const handlePlaceOrder = async () => {
    // Validate all fields before placing order
    const validation = validateAllFields();
    
    if (!validation.isValid) {
      // Set validation errors for red border styling
      setValidationErrors(validation.missingFields);
      
      // Show alert with missing fields
      dispatch(addToast({
        message: `Please complete the following required fields: ${validation.missingFields.join(', ')}`,
        type: 'error'
      }));
      
      return;
    }
    
    // Clear validation errors if validation passes
    setValidationErrors([]);
    
    setProcessingPayment(true);
    
    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const paymentId = generatePaymentId();
      
      // Prepare order data
      const orderData = {
        cart_items: cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.qty,
          unit_price: products.find(p => p.id === item.productId)?.price || 0
        })),
        subtotal: cartTotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total_price: finalTotal,
        payment_id: paymentId,
        payment_method: 'credit_card',
        customer_email: address.email,
        customer_phone: address.phone,
        shipping_address: address,
        shipping_name: selectedShippingOption?.name || 'Standard Shipping'
      };
      
      // Create order
      const response = await fetch('http://127.0.0.1:8001/api/public/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      if (response.ok) {
        const result = await response.json();
        
        dispatch(addToast({
          message: 'Order placed successfully!',
          type: 'success'
        }));
        
        // Redirect to order confirmation or home
        navigate(`/order-confirmation/${result.tracking_id}`);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      dispatch(addToast({
        message: 'Failed to place order. Please try again.',
        type: 'error'
      }));
    } finally {
      setProcessingPayment(false);
    }
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <TitleUpdater pageTitle="Checkout" />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-6" />
          
          <div className="text-center py-16">
            <Placeholder size="lg" className="mx-auto mb-6">
              <div className="text-gray-400 dark:text-gray-500">Empty Cart</div>
            </Placeholder>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Add some items to your cart before proceeding to checkout.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle="Checkout" />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">Checkout</h1>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-red-600 dark:bg-blue-600 border-red-600 dark:border-blue-600 text-white'
                    : 'border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400'
                }`}>
                  {step.id}
                </div>
                <div className="ml-3 hidden sm:block">
                  <div className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-red-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 hidden sm:block ${
                    currentStep > step.id ? 'bg-red-600 dark:bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {currentStep === 1 && 'Shipping Address'}
                {currentStep === 2 && 'Shipping Options'}
                {currentStep === 3 && 'Payment Method'}
                {currentStep === 4 && 'Order Review'}
              </h2>
              
              <div className="space-y-6">
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First Name *"
                        value={address.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        className={getInputClassName('First Name', "px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                      />
                      <input
                        type="text"
                        placeholder="Last Name *"
                        value={address.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        className={getInputClassName('Last Name', "px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={address.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      className={getInputClassName('Email', "w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={address.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1 *"
                      value={address.address1}
                      onChange={(e) => handleAddressChange('address1', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={address.address2}
                      onChange={(e) => handleAddressChange('address2', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="City *"
                        value={address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Post Code *"
                        value={address.postcode}
                        onChange={(e) => handleAddressChange('postcode', e.target.value)}
                        className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="space-y-4">
                    {shippingOptions.map((option) => (
                      <div 
                        key={option.id}
                        className={`border rounded-md p-4 cursor-pointer transition-colors ${
                          selectedShipping === option.id
                            ? 'border-red-500 dark:border-blue-500 bg-red-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                        }`}
                        onClick={() => setSelectedShipping(option.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              name="shipping"
                              value={option.id}
                              checked={selectedShipping === option.id}
                              onChange={() => setSelectedShipping(option.id)}
                              className="mr-3 text-red-600 dark:text-blue-600"
                            />
                            <div>
                              <h3 className="font-medium text-gray-900 dark:text-white">{option.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{option.days}</p>
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(shippingCost, settings?.currency as Currency || 'USD')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-slate-600 rounded-md p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-4">Credit Card</h3>
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Card Number"
                          value={payment.cardNumber}
                          onChange={(e) => handlePaymentChange('cardNumber', formatCardNumber(e.target.value))}
                          className={getInputClassName('Card Number', "w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                        />
                        <input
                          type="text"
                          placeholder="Cardholder Name"
                          value={payment.cardholderName}
                          onChange={(e) => handlePaymentChange('cardholderName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={payment.expiryDate}
                            onChange={(e) => handlePaymentChange('expiryDate', formatExpiryDate(e.target.value))}
                            className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            value={payment.cvv}
                            onChange={(e) => handlePaymentChange('cvv', e.target.value.replace(/\D/g, ''))}
                            className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {/* Address Summary */}
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Shipping Address</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {address.firstName} {address.lastName}<br />
                        {address.address1}<br />
                        {address.address2 && <>{address.address2}<br /></>}
                        {address.city}, {address.state} {address.postcode}<br />
                        {address.email}<br />
                        {address.phone}
                      </p>
                    </div>
                    
                    {/* Shipping & Tax Summary */}
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Shipping & Tax</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Shipping: {formatCurrency(shippingCost, settings?.currency as Currency || 'USD')} | 
                        Tax Rate: {settings?.tax_rate || 0}%
                      </p>
                    </div>
                    
                    {/* Payment Summary */}
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">Payment Method</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Credit Card ending in {payment.cardNumber.slice(-4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between mt-8 space-y-3 sm:space-y-0">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                <div className="flex-1" />
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-red-600 dark:bg-blue-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={processingPayment}
                    className="px-6 py-3 bg-red-600 dark:bg-blue-600 text-white rounded-md hover:bg-red-700 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingPayment ? 'Processing...' : 'Place Order'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-6 sticky top-8">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cartItems.map((item) => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{product?.title}</p>
                        <p className="text-gray-600 dark:text-gray-300">Qty: {item.qty}</p>
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        {formatCurrency((product?.price || 0) * item.qty, settings?.currency as Currency || 'USD')}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Subtotal</span>
                  <span className="font-medium text-sm sm:text-base">{formatCurrency(cartTotal, settings?.currency as Currency || 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Shipping</span>
                  <span className="font-medium text-sm sm:text-base">{formatCurrency(shippingCost, settings?.currency as Currency || 'USD')}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Tax ({taxRate}%)</span>
                    <span className="font-medium text-sm sm:text-base">{formatCurrency(taxAmount, settings?.currency as Currency || 'USD')}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-slate-600 pt-3">
                  <div className="flex justify-between">
                    <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-base sm:text-lg font-semibold text-red-600 dark:text-blue-400">
                      {formatCurrency(finalTotal, settings?.currency as Currency || 'USD')}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Security Badge */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span>🔒</span>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;