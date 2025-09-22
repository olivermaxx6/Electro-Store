import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { selectCartItems, selectCartTotal, clearCart } from '../store/cartSlice';
import { selectProducts, setProducts } from '../store/productsSlice';
import { selectCurrentUser } from '../store/userSlice';
import { addToast } from '../store/uiSlice';
import { formatCurrency } from '../lib/format';
import { Currency } from '../lib/types';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { productRepo } from '../lib/repo';
import { getStripe } from '../../lib/stripe';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import TitleUpdater from '../components/common/TitleUpdater';
import { CreditCard, Save, Trash2, Zap } from 'lucide-react';

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
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Redux state
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || 'guest';
  const cartItems = useSelector(selectCartItems(userId));
  const products = useSelector(selectProducts);
  const cartTotal = useSelector(selectCartTotal(userId));
  const { settings, loading: settingsLoading } = useStoreSettings();

  // Handle cancelled payment redirect
  useEffect(() => {
    const cancelled = searchParams.get('cancelled');
    if (cancelled === 'true') {
      // Show a message and redirect to shop
      dispatch(addToast({
        message: 'Payment was cancelled. You can continue shopping.',
        type: 'info'
      }));
      
      // Redirect to shop after a short delay
      setTimeout(() => {
        navigate('/shop', { replace: true });
      }, 2000);
    }
  }, [searchParams, dispatch, navigate]);

  // Load products if they're not already loaded
  useEffect(() => {
    const loadProductsIfNeeded = async () => {
      if (products.length === 0) {
        try {
          setIsLoadingProducts(true);
          console.log('Loading products for checkout...');
          const productsData = await productRepo.getAll();
          console.log('Products loaded:', productsData);
          dispatch(setProducts(productsData));
        } catch (error) {
          console.error('Failed to load products for checkout:', error);
        } finally {
          setIsLoadingProducts(false);
        }
      } else {
        console.log('Products already loaded:', products);
      }
    };

    loadProductsIfNeeded();
  }, [dispatch, products.length]);

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
  const [privacyConsent, setPrivacyConsent] = useState<boolean>(false);
  const [autoFillEnabled, setAutoFillEnabled] = useState<boolean>(true);

  // Auto-fill payment information from localStorage
  useEffect(() => {
    const loadSavedPaymentInfo = () => {
      if (!autoFillEnabled) return;
      
      try {
        const savedPaymentInfo = localStorage.getItem('savedPaymentInfo');
        const savedAddressInfo = localStorage.getItem('savedAddressInfo');
        
        if (savedPaymentInfo) {
          const parsedPayment = JSON.parse(savedPaymentInfo);
          // Only auto-fill if the current payment form is empty
          if (!payment.cardNumber && !payment.cardholderName && !payment.expiryDate) {
            setPayment({
              cardNumber: parsedPayment.cardNumber || '',
              cardholderName: parsedPayment.cardholderName || '',
              expiryDate: parsedPayment.expiryDate || '',
              cvv: '' // Never save CVV for security reasons
            });
            // Show success message
            dispatch(addToast({ 
              message: 'Payment information auto-filled from saved data', 
              type: 'success' 
            }));
          }
        }
        
        if (savedAddressInfo && currentUser) {
          const parsedAddress = JSON.parse(savedAddressInfo);
          // Only auto-fill if the current address form is empty
          if (!address.firstName && !address.lastName && !address.email) {
            setAddress(prev => ({
              ...prev,
              firstName: parsedAddress.firstName || currentUser?.name?.split(' ')[0] || '',
              lastName: parsedAddress.lastName || currentUser?.name?.split(' ').slice(1).join(' ') || '',
              email: parsedAddress.email || currentUser?.email || '',
              phone: parsedAddress.phone || '',
              address1: parsedAddress.address1 || '',
              address2: parsedAddress.address2 || '',
              city: parsedAddress.city || '',
              state: parsedAddress.state || '',
              postcode: parsedAddress.postcode || ''
            }));
            // Show success message
            dispatch(addToast({ 
              message: 'Address information auto-filled from saved data', 
              type: 'success' 
            }));
          }
        }
      } catch (error) {
        console.error('Failed to load saved payment/address info:', error);
        dispatch(addToast({ 
          message: 'Failed to load saved information', 
          type: 'error' 
        }));
      }
    };

    loadSavedPaymentInfo();
  }, [autoFillEnabled, currentUser, dispatch]);

  // Debug cart items and products
  useEffect(() => {
    console.log('🛒 Checkout Debug:', {
      cartItems: cartItems,
      productsCount: products.length,
      cartTotal: cartTotal,
      isLoadingProducts: isLoadingProducts,
      currentStep: currentStep,
      address: address,
      payment: payment,
      selectedShipping: selectedShipping,
      privacyConsent: privacyConsent,
      autoFillEnabled: autoFillEnabled
    });
  }, [cartItems, products, cartTotal, isLoadingProducts, currentStep, address, payment, selectedShipping, privacyConsent, autoFillEnabled]);
  // Dynamic shipping options based on admin settings
  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: '5-7 business days',
      cost: settings && !settingsLoading ? parseFloat((settings as any)?.standard_shipping_rate?.toString() || '0') || 0 : 0,
      days: '5-7 business days'
    },
    {
      id: 'express',
      name: 'Express Shipping',
      description: '2-3 business days',
      cost: settings && !settingsLoading ? parseFloat((settings as any)?.express_shipping_rate?.toString() || '0') || 0 : 0,
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
    
    // Auto-save address information
    if (autoFillEnabled) {
      const addressToSave = { ...address, [field]: value };
      try {
        localStorage.setItem('savedAddressInfo', JSON.stringify(addressToSave));
      } catch (error) {
        console.error('Failed to save address info:', error);
      }
    }
  };
  
  const handlePaymentChange = (field: keyof PaymentForm, value: string) => {
    setPayment(prev => ({ ...prev, [field]: value }));
    
    // Auto-save payment information (except CVV for security)
    if (field !== 'cvv' && autoFillEnabled) {
      const paymentToSave = { ...payment, [field]: value };
      try {
        localStorage.setItem('savedPaymentInfo', JSON.stringify(paymentToSave));
      } catch (error) {
        console.error('Failed to save payment info:', error);
      }
    }
  };

  const clearSavedInfo = () => {
    try {
      localStorage.removeItem('savedPaymentInfo');
      localStorage.removeItem('savedAddressInfo');
      setPayment({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
      });
      setAddress({
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
      dispatch(addToast({ message: 'Saved payment information cleared', type: 'success' }));
    } catch (error) {
      console.error('Failed to clear saved info:', error);
      dispatch(addToast({ message: 'Failed to clear saved information', type: 'error' }));
    }
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
    if (!address.firstName?.trim()) missingFields.push('firstName');
    if (!address.lastName?.trim()) missingFields.push('lastName');
    if (!address.email?.trim()) missingFields.push('email');
    if (!address.phone?.trim()) missingFields.push('phone');
    if (!address.address1?.trim()) missingFields.push('address1');
    if (!address.city?.trim()) missingFields.push('city');
    if (!address.state?.trim()) missingFields.push('state');
    if (!address.postcode?.trim()) missingFields.push('postcode');
    
    // Shipping validation
    if (!selectedShipping) missingFields.push('shipping');
    
    // Payment validation
    if (!payment.cardNumber?.trim()) missingFields.push('cardNumber');
    if (!payment.expiryDate?.trim()) missingFields.push('expiryDate');
    if (!payment.cvv?.trim()) missingFields.push('cvv');
    if (!payment.cardholderName?.trim()) missingFields.push('cardholderName');
    
    // Privacy consent validation
    if (!privacyConsent) missingFields.push('privacyConsent');
    
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
  
  
  const handlePlaceOrder = async () => {
    console.log('🚀 Starting Stripe Checkout process...');
    console.log('📋 Current form data:', { address, selectedShipping, privacyConsent });
    
    // Validate required fields (excluding payment fields since Stripe handles those)
    const validation = validateAllFields();
    console.log('✅ Validation result:', validation);
    
    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.missingFields);
      // Set validation errors for red border styling
      setValidationErrors(validation.missingFields);
      
      // Show alert with missing fields
      const fieldLabels: Record<string, string> = {
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        phone: 'Phone',
        address1: 'Address',
        city: 'City',
        state: 'State',
        postcode: 'Post Code',
        shipping: 'Shipping Option',
        privacyConsent: 'Privacy Policy Consent'
      };
      
      const missingFieldLabels = validation.missingFields
        .filter(field => !['cardNumber', 'expiryDate', 'cvv', 'cardholderName'].includes(field))
        .map(field => fieldLabels[field] || field);
      
      if (missingFieldLabels.length > 0) {
        dispatch(addToast({
          message: `Please complete the following required fields: ${missingFieldLabels.join(', ')}`,
          type: 'error'
        }));
        return;
      }
    }
    
    // Clear validation errors if validation passes
    setValidationErrors([]);
    
    setProcessingPayment(true);
    console.log('💳 Starting Stripe Checkout process...');
    
    try {
      // Calculate final total
      const finalTotal = cartTotal + shippingCost + taxAmount;
      console.log('💰 Final total calculated:', finalTotal);
      
      // Prepare order data for local storage (before checkout)
      const orderData = {
        id: Date.now(), // Temporary ID
        tracking_id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        payment_id: '', // Will be updated after Stripe checkout
        customer_email: address.email,
        customer_phone: address.phone,
        shipping_address: address,
        subtotal: cartTotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total_price: finalTotal,
        status: 'pending',
        payment_status: 'pending',
        payment_method: 'Credit/Debit Card via Stripe',
        shipping_name: selectedShippingOption?.name || 'Standard Shipping',
        created_at: new Date().toISOString(),
        items: cartItems.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            id: item.productId,
            product: {
              id: item.productId,
              title: product?.title || `Product ID: ${item.productId}`,
              price: product?.price || 0
            },
            quantity: item.qty,
            unit_price: product?.price || 0
          };
        })
      };
      
      // Store order data in localStorage for immediate display
      console.log('💾 Storing order data locally:', orderData);
      localStorage.setItem('pendingOrder', JSON.stringify(orderData));
      localStorage.setItem('orderCheckoutTimestamp', Date.now().toString());
      
      // Prepare checkout session data
      const checkoutData = {
        cart_items: cartItems.map(item => ({
          product_id: item.productId,
          quantity: item.qty,
          unit_price: products.find(p => p.id === item.productId)?.price || 0
        })),
        subtotal: cartTotal,
        shipping_cost: shippingCost,
        tax_amount: taxAmount,
        total_price: finalTotal,
        customer_email: address.email,
        customer_phone: address.phone,
        shipping_address: address,
        shipping_name: selectedShippingOption?.name || 'Standard Shipping',
        user_id: userId
      };
      
      console.log('📤 Creating Stripe Checkout session...');
      
      // Create Stripe Checkout session
      const response = await fetch('http://127.0.0.1:8001/api/public/create-checkout-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(checkoutData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Checkout session creation failed:', errorText);
        throw new Error(`Failed to create checkout session: ${response.status}`);
      }

      const checkoutResult = await response.json();
      console.log('✅ Checkout session created:', checkoutResult);

      // Update the stored order data with the Stripe session ID
      if (checkoutResult.checkout_session_id) {
        const updatedOrderData = {
          ...orderData,
          payment_id: checkoutResult.checkout_session_id,
          tracking_id: checkoutResult.checkout_session_id // Use Stripe session ID as tracking ID
        };
        localStorage.setItem('pendingOrder', JSON.stringify(updatedOrderData));
        console.log('💾 Updated order data with Stripe session ID:', updatedOrderData);
      }

      // Clear cart after successful checkout session creation
      dispatch(clearCart({ userId }));
      
      // Redirect to Stripe Checkout
      if (checkoutResult.checkout_url) {
        console.log('🔄 Redirecting to Stripe Checkout...');
        window.location.href = checkoutResult.checkout_url;
      } else {
        throw new Error('No checkout URL received from server');
      }
      
    } catch (error) {
      console.error('❌ Stripe Checkout error:', error);
      // Clear stored order data on error
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem('orderCheckoutTimestamp');
      
      dispatch(addToast({
        message: error instanceof Error ? error.message : 'Failed to start checkout. Please try again.',
        type: 'error'
      }));
      setProcessingPayment(false);
    }
  };
  
  // Show loading state if we have cart items but products are still loading
  if (cartItems.length > 0 && isLoadingProducts && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <TitleUpdater pageTitle="Checkout" />
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs className="mb-6" />
          
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <div className="text-gray-400 dark:text-slate-500 text-4xl">⏳</div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Loading checkout...</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              Please wait while we load your cart items.
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                        className={getInputClassName('firstName', "px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                      />
                      <input
                        type="text"
                        placeholder="Last Name *"
                        value={address.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        className={getInputClassName('lastName', "px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={address.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      className={getInputClassName('email', "w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={address.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className={getInputClassName('phone', "w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1 *"
                      value={address.address1}
                      onChange={(e) => handleAddressChange('address1', e.target.value)}
                      className={getInputClassName('address1', "w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
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
                        className={getInputClassName('city', "px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                      />
                      <input
                        type="text"
                        placeholder="State *"
                        value={address.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className={getInputClassName('state', "px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
                      />
                      <input
                        type="text"
                        placeholder="Post Code *"
                        value={address.postcode}
                        onChange={(e) => handleAddressChange('postcode', e.target.value)}
                        className={getInputClassName('postcode', "px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-red-500 dark:focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400")}
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
                            {formatCurrency(option.cost, settings?.currency as Currency || 'USD')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {/* Stripe Checkout Info */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                            Secure Payment with Stripe
                          </h3>
                          <p className="text-green-700 dark:text-green-300 mb-4">
                            You'll be redirected to Stripe's secure checkout page to complete your payment. 
                            Stripe supports all major credit cards, Apple Pay, Google Pay, and more.
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>SSL Encrypted</span>
                            </div>
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>PCI Compliant</span>
                            </div>
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>3D Secure</span>
                            </div>
                            <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Multiple Payment Methods</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Summary */}
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-4">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payment Method</h3>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Credit/Debit Card</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Visa, Mastercard, American Express, Discover
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Note:</strong> You'll be redirected to Stripe Checkout for secure payment processing. 
                          Your card details are never stored on our servers.
                        </p>
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
                        Credit/Debit Card via Stripe Checkout
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Secure payment processing with Stripe
                      </p>
                    </div>
                    
                    {/* Privacy Policy Consent */}
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-md p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="privacyConsent"
                          checked={privacyConsent}
                          onChange={(e) => setPrivacyConsent(e.target.checked)}
                          className={`mt-1 h-4 w-4 text-red-600 dark:text-blue-600 focus:ring-red-500 dark:focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded ${
                            validationErrors.includes('privacyConsent') ? 'border-red-500' : ''
                          }`}
                        />
                        <label htmlFor="privacyConsent" className="text-sm text-gray-600 dark:text-gray-300">
                          I agree to the{' '}
                          <a 
                            href="/privacy" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-red-600 dark:text-blue-400 hover:underline"
                          >
                            Privacy Policy
                          </a>
                          {' '}and consent to the processing of my personal information as described therein.
                        </label>
                      </div>
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
                    onClick={() => {
                      console.log('🔘 Place Order button clicked!');
                      handlePlaceOrder();
                    }}
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
                {cartItems.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No items in cart
                  </div>
                ) : (
                  cartItems.map((item) => {
                  // Try multiple ways to find the product
                  let product = products.find(p => p.id === item.productId);
                  
                  // If not found, try string comparison
                  if (!product) {
                    product = products.find(p => String(p.id) === String(item.productId));
                  }
                  
                  // If still not found, try with toString()
                  if (!product) {
                    product = products.find(p => p.id.toString() === item.productId.toString());
                  }
                  
                  const itemTotal = (product?.price || 0) * item.qty;
                  
                  // Enhanced debug logging
                  console.log('Checkout Item Debug:', {
                    cartItem: item,
                    productId: item.productId,
                    allProducts: products.map(p => ({ id: p.id, title: p.title, price: p.price })),
                    foundProduct: product,
                    productPrice: product?.price,
                    quantity: item.qty,
                    itemTotal: itemTotal
                  });
                  
                  return (
                    <div key={item.productId} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {product?.title || `Product ID: ${item.productId}`}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300">Qty: {item.qty}</p>
                        {!product && (
                          <p className="text-xs text-red-500 dark:text-red-400">
                            Product not found in database
                          </p>
                        )}
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        {formatCurrency(itemTotal, settings?.currency as Currency || 'USD')}
                      </div>
                    </div>
                  );
                  })
                )}
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