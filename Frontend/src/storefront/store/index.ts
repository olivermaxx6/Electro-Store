import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import cartSlice from './cartSlice';
import wishlistSlice from './wishlistSlice';
import userSlice from './userSlice';
import uiSlice from './uiSlice';
import productsSlice from './productsSlice';

const persistConfig = {
  key: 'storefront',
  storage,
  whitelist: ['cart', 'wishlist', 'user', 'ui'],
};

const rootReducer = combineReducers({
  cart: cartSlice,
  wishlist: wishlistSlice,
  user: userSlice,
  ui: uiSlice,
  products: productsSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
