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
      
      console.log('ADD TO WISHLIST:', { 
        productId, 
        productIdType: typeof productId, 
        userId 
      });
      
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
        console.log('Added to wishlist:', { productId, addedAt: new Date().toISOString() });
        
        // Note: Redux persist will handle localStorage saving
      } else {
        console.log('Item already in wishlist:', productId);
      }
      
      console.log('Wishlist after add:', userWishlist);
    },
    
    removeFromWishlist: (state, action: PayloadAction<{ productId: string; userId?: string }>) => {
      const { productId, userId = 'guest' } = action.payload;
      
      if (state.userWishlists[userId]) {
        state.userWishlists[userId] = state.userWishlists[userId].filter(item => item.productId !== productId);
        // Note: Redux persist will handle localStorage saving
      }
    },
    
    clearWishlist: (state, action: PayloadAction<{ userId?: string }>) => {
      const { userId = 'guest' } = action.payload;
      
      if (state.userWishlists[userId]) {
        state.userWishlists[userId] = [];
        // Note: Redux persist will handle localStorage saving
      }
    },
    
    // Note: loadUserWishlist removed - Redux persist handles rehydration automatically
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
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
