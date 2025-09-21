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
        state.userCarts[userId] = { items: [], shippingCost: 0, coupon: undefined };
      }
      
      const userCart = state.userCarts[userId];
      const existingItem = userCart.items.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.qty += qty;
      } else {
        userCart.items.push({ productId, qty });
      }
    },
    
    removeFromCart: (state, action: PayloadAction<{ productId: string; userId?: string }>) => {
      const { productId, userId = 'guest' } = action.payload;
      
      if (state.userCarts[userId]) {
        state.userCarts[userId].items = state.userCarts[userId].items.filter(item => item.productId !== productId);
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
      }
    },
    
    clearCart: (state, action: PayloadAction<{ userId?: string }>) => {
      const { userId = 'guest' } = action.payload;
      
      if (state.userCarts[userId]) {
        state.userCarts[userId] = { items: [], shippingCost: 0 };
      }
    },
    
    setCoupon: (state, action: PayloadAction<{ coupon: string; userId?: string }>) => {
      const { coupon, userId = 'guest' } = action.payload;
      
      if (!state.userCarts[userId]) {
        state.userCarts[userId] = { items: [], shippingCost: 0, coupon: undefined };
      }
      
      state.userCarts[userId].coupon = coupon;
    },
    
    setShippingCost: (state, action: PayloadAction<{ shippingCost: number; userId?: string }>) => {
      const { shippingCost, userId = 'guest' } = action.payload;
      
      if (!state.userCarts[userId]) {
        state.userCarts[userId] = { items: [], shippingCost: 0, coupon: undefined };
      }
      
      state.userCarts[userId].shippingCost = shippingCost;
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
} = cartSlice.actions;

// Selectors
export const selectCartItems = (userId: string = 'guest') => (state: { cart: CartState }) => {
  const items = state.cart?.userCarts?.[userId]?.items || [];
  return items;
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

export const selectCartShippingCost = (userId: string = 'guest') => (state: { cart: CartState }) => {
  return state.cart?.userCarts?.[userId]?.shippingCost || 0;
};

export default cartSlice.reducer;
