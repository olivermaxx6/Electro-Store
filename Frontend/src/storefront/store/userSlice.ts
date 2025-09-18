import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { User, Order } from '../lib/types';
import { loadUserCart } from './cartSlice';
import { loadUserWishlist } from './wishlistSlice';

interface UserState {
  currentUser: User | null;
  orders: Order[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  orders: [],
  isLoading: false,
  error: null,
};

// Thunks for loading user-specific data
export const signInWithData = createAsyncThunk(
  'user/signInWithData',
  async (userData: { email: string; name: string; username?: string; profilePicture?: string }, { dispatch }) => {
    const userId = userData.email;
    
    // Load user-specific cart and wishlist
    dispatch(loadUserCart({ userId }));
    dispatch(loadUserWishlist({ userId }));
    
    return userData;
  }
);

export const signUpWithData = createAsyncThunk(
  'user/signUpWithData',
  async (userData: { email: string; name: string; username: string; password: string }, { dispatch }) => {
    const userId = userData.email;
    
    // Load user-specific cart and wishlist (will be empty for new users)
    dispatch(loadUserCart({ userId }));
    dispatch(loadUserWishlist({ userId }));
    
    return userData;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    signIn: (state, action: PayloadAction<{ email: string; name: string; username?: string; profilePicture?: string }>) => {
      const { email, name, username, profilePicture } = action.payload;
      const userId = email; // Use email as unique identifier
      
      state.currentUser = {
        id: userId,
        email,
        name,
        username,
        profilePicture,
        isAuthenticated: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      state.isLoading = false;
      state.error = null;
    },
    
    signUp: (state, action: PayloadAction<{ email: string; name: string; username: string; password: string }>) => {
      const { email, name, username } = action.payload;
      const userId = email; // Use email as unique identifier
      
      state.currentUser = {
        id: userId,
        email,
        name,
        username,
        isAuthenticated: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      state.isLoading = false;
      state.error = null;
    },
    
    signOut: (state) => {
      state.currentUser = null;
      state.error = null;
    },
    
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
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
  extraReducers: (builder) => {
    builder
      .addCase(signInWithData.fulfilled, (state, action) => {
        const { email, name, username, profilePicture } = action.payload;
        const userId = email;
        
        state.currentUser = {
          id: userId,
          email,
          name,
          username,
          profilePicture,
          isAuthenticated: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signUpWithData.fulfilled, (state, action) => {
        const { email, name, username } = action.payload;
        const userId = email;
        
        state.currentUser = {
          id: userId,
          email,
          name,
          username,
          isAuthenticated: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const {
  signIn,
  signUp,
  signOut,
  updateProfile,
  setLoading,
  setError,
  addOrder,
  updateOrderStatus,
} = userSlice.actions;

// Selectors
export const selectCurrentUser = (state: { user: UserState }) => state.user.currentUser;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.currentUser?.isAuthenticated ?? false;
export const selectUserOrders = (state: { user: UserState }) => state.user.orders;
export const selectUserLoading = (state: { user: UserState }) => state.user.isLoading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

export default userSlice.reducer;
