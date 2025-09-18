import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../lib/types';

interface CartState {
  userCarts: Record<string, {
    items: CartItem[];
    coupon?: string;
    shippingCost: number;
  }>;
}

const initialState: CartState = {
  userCarts: {},
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ productId: string; qty?: number; userId?: string }>) => {
      const { productId, qty = 1, userId = 'guest' } = action.payload;
      
      if (!state.userCarts[userId]) {
        state.userCarts[userId] = { items: [], shippingCost: 0 };
      }
      
      const userCart = state.userCarts[userId];
      const existingItem = userCart.items.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.qty += qty;
      } else {
        userCart.items.push({ productId, qty });
      }
      
      // Save to localStorage
      localStorage.setItem(`cart_${userId}`, JSON.stringify(userCart));
    },
    
    removeFromCart: (state, action: PayloadAction<{ productId: string; userId?: string }>) => {
      const { productId, userId = 'guest' } = action.payload;
      
      if (state.userCarts[userId]) {
        state.userCarts[userId].items = state.userCarts[userId].items.filter(item => item.productId !== productId);
        localStorage.setItem(`cart_${userId}`, JSON.stringify(state.userCarts[userId]));
      }
    },
    
    updateQuantity: (state, action: PayloadAction<{ productId: string; qty: number; userId?: string }>) => {
      const { productId, qty, userId = 'guest' } = action.payload;
      
      if (state.userCarts[userId]) {
        const userCart = state.userCarts[userId];
        const item = userCart.items.find(item => item.productId === productId);
        
        if (item) {
          if (qty <= 0) {
            userCart.items = userCart.items.filter(item => item.productId !== productId);
          } else {
            item.qty = qty;
          }
        }
        
        localStorage.setItem(`cart_${userId}`, JSON.stringify(userCart));
      }
    },
    
    clearCart: (state, action: PayloadAction<{ userId?: string }>) => {
      const { userId = 'guest' } = action.payload;
      
      if (state.userCarts[userId]) {
        state.userCarts[userId] = { items: [], shippingCost: 0 };
        localStorage.setItem(`cart_${userId}`, JSON.stringify(state.userCarts[userId]));
      }
    },
    
    setCoupon: (state, action: PayloadAction<{ coupon: string; userId?: string }>) => {
      const { coupon, userId = 'guest' } = action.payload;
      
      if (!state.userCarts[userId]) {
        state.userCarts[userId] = { items: [], shippingCost: 0 };
      }
      
      state.userCarts[userId].coupon = coupon;
      localStorage.setItem(`cart_${userId}`, JSON.stringify(state.userCarts[userId]));
    },
    
    setShippingCost: (state, action: PayloadAction<{ shippingCost: number; userId?: string }>) => {
      const { shippingCost, userId = 'guest' } = action.payload;
      
      if (!state.userCarts[userId]) {
        state.userCarts[userId] = { items: [], shippingCost: 0 };
      }
      
      state.userCarts[userId].shippingCost = shippingCost;
      localStorage.setItem(`cart_${userId}`, JSON.stringify(state.userCarts[userId]));
    },
    
    loadUserCart: (state, action: PayloadAction<{ userId: string }>) => {
      const { userId } = action.payload;
      const savedCart = localStorage.getItem(`cart_${userId}`);
      
      if (savedCart) {
        try {
          state.userCarts[userId] = JSON.parse(savedCart);
        } catch (error) {
          console.error('Failed to load cart from localStorage:', error);
          state.userCarts[userId] = { items: [], shippingCost: 0 };
        }
      } else {
        state.userCarts[userId] = { items: [], shippingCost: 0 };
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCoupon,
  setShippingCost,
  loadUserCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (userId: string = 'guest') => (state: { cart: CartState }) => {
  return state.cart?.userCarts?.[userId]?.items || [];
};

export const selectCartTotal = (userId: string = 'guest') => (state: { cart: CartState; products: { items: Product[] } }) => {
  const items = state.cart?.userCarts?.[userId]?.items || [];
  const { items: products } = state.products;
  
  return items.reduce((total, cartItem) => {
    const product = products.find(p => p.id === cartItem.productId);
    return total + (product ? product.price * cartItem.qty : 0);
  }, 0);
};

export const selectCartItemCount = (userId: string = 'guest') => (state: { cart: CartState }) => {
  const items = state.cart?.userCarts?.[userId]?.items || [];
  return items.reduce((total, item) => total + item.qty, 0);
};

export default cartSlice.reducer;
