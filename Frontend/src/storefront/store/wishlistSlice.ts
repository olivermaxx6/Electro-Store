import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WishlistItem } from '../lib/types';

interface WishlistState {
  userWishlists: Record<string, WishlistItem[]>;
}

const initialState: WishlistState = {
  userWishlists: {},
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<{ productId: string; userId?: string }>) => {
      const { productId, userId = 'guest' } = action.payload;
      
      if (!state.userWishlists[userId]) {
        state.userWishlists[userId] = [];
      }
      
      const userWishlist = state.userWishlists[userId];
      const existingItem = userWishlist.find(item => item.productId === productId);
      
      if (!existingItem) {
        userWishlist.push({
          productId,
          addedAt: new Date().toISOString(),
        });
        
        // Save to localStorage
        localStorage.setItem(`wishlist_${userId}`, JSON.stringify(userWishlist));
      }
    },
    
    removeFromWishlist: (state, action: PayloadAction<{ productId: string; userId?: string }>) => {
      const { productId, userId = 'guest' } = action.payload;
      
      if (state.userWishlists[userId]) {
        state.userWishlists[userId] = state.userWishlists[userId].filter(item => item.productId !== productId);
        localStorage.setItem(`wishlist_${userId}`, JSON.stringify(state.userWishlists[userId]));
      }
    },
    
    clearWishlist: (state, action: PayloadAction<{ userId?: string }>) => {
      const { userId = 'guest' } = action.payload;
      
      if (state.userWishlists[userId]) {
        state.userWishlists[userId] = [];
        localStorage.setItem(`wishlist_${userId}`, JSON.stringify(state.userWishlists[userId]));
      }
    },
    
    loadUserWishlist: (state, action: PayloadAction<{ userId: string }>) => {
      const { userId } = action.payload;
      const savedWishlist = localStorage.getItem(`wishlist_${userId}`);
      
      if (savedWishlist) {
        try {
          state.userWishlists[userId] = JSON.parse(savedWishlist);
        } catch (error) {
          console.error('Failed to load wishlist from localStorage:', error);
          state.userWishlists[userId] = [];
        }
      } else {
        state.userWishlists[userId] = [];
      }
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  loadUserWishlist,
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (userId: string = 'guest') => (state: { wishlist: WishlistState }) => {
  return state.wishlist?.userWishlists?.[userId] || [];
};

export const selectWishlistCount = (userId: string = 'guest') => (state: { wishlist: WishlistState }) => {
  return state.wishlist?.userWishlists?.[userId]?.length || 0;
};

export const selectIsInWishlist = (productId: string, userId: string = 'guest') => (state: { wishlist: WishlistState }) => {
  const items = state.wishlist?.userWishlists?.[userId] || [];
  return items.some(item => item.productId === productId);
};

export default wishlistSlice.reducer;
