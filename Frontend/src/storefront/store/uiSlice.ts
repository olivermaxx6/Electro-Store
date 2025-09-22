import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UIState, Currency, Toast } from '../lib/types';

const initialState: UIState = {
  currency: 'GBP',
  theme: 'dark',
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<Currency>) => {
      state.currency = action.payload;
    },
    
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const toast: Toast = {
        ...action.payload,
        id: Date.now().toString(),
      };
      state.toasts.push(toast);
    },
    
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
    },
    
    clearToasts: (state) => {
      state.toasts = [];
    },
  },
});

export const {
  setCurrency,
  setTheme,
  addToast,
  removeToast,
  clearToasts,
} = uiSlice.actions;

// Selectors
export const selectCurrency = (state: { ui: UIState }) => state.ui.currency;
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;

export default uiSlice.reducer;
