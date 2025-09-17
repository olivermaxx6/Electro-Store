import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  coupon?: string;
  shippingCost: number;
}

const initialState: CartState = {
  items: [],
  shippingCost: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ productId: string; qty?: number }>) => {
      const { productId, qty = 1 } = action.payload;
      const existingItem = state.items.find(item => item.productId === productId);
      
      if (existingItem) {
        existingItem.qty += qty;
      } else {
        state.items.push({ productId, qty });
      }
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.productId !== action.payload);
    },
    
    updateQuantity: (state, action: PayloadAction<{ productId: string; qty: number }>) => {
      const { productId, qty } = action.payload;
      const item = state.items.find(item => item.productId === productId);
      
      if (item) {
        if (qty <= 0) {
          state.items = state.items.filter(item => item.productId !== productId);
        } else {
          item.qty = qty;
        }
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.coupon = undefined;
    },
    
    setCoupon: (state, action: PayloadAction<string>) => {
      state.coupon = action.payload;
    },
    
    setShippingCost: (state, action: PayloadAction<number>) => {
      state.shippingCost = action.payload;
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
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartTotal = (state: { cart: CartState; products: { items: Product[] } }) => {
  const { items } = state.cart;
  const { items: products } = state.products;
  
  return items.reduce((total, cartItem) => {
    const product = products.find(p => p.id === cartItem.productId);
    return total + (product ? product.price * cartItem.qty : 0);
  }, 0);
};

export const selectCartItemCount = (state: { cart: CartState }) => {
  return state.cart.items.reduce((total, item) => total + item.qty, 0);
};

export default cartSlice.reducer;
