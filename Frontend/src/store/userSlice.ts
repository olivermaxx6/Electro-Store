import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, Order } from '../types';

interface UserState {
  currentUser: User | null;
  orders: Order[];
}

const initialState: UserState = {
  currentUser: null,
  orders: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<{ email: string; name: string }>) => {
      const { email, name } = action.payload;
      state.currentUser = {
        id: '1',
        email,
        name,
        isAuthenticated: true,
      };
    },
    
    signOut: (state) => {
      state.currentUser = null;
    },
    
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const { orderId, status } = action.payload;
      const order = state.orders.find(order => order.id === orderId);
      if (order) {
        order.status = status;
      }
    },
  },
});

export const {
  signIn,
  signOut,
  addOrder,
  updateOrderStatus,
} = userSlice.actions;

// Selectors
export const selectCurrentUser = (state: { user: UserState }) => state.user.currentUser;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.currentUser?.isAuthenticated ?? false;
export const selectUserOrders = (state: { user: UserState }) => state.user.orders;

export default userSlice.reducer;
