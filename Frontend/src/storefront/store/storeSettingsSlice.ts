import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StoreSettings {
  store_name: string;
  store_logo: string;
  currency: string;
  tax_rate: number;
  shipping_rate: number;
  standard_shipping_rate: number;
  express_shipping_rate: number;
  street_address: string;
  city: string;
  postcode: string;
  country: string;
  phone: string;
  email: string;
  monday_friday_hours: string;
  saturday_hours: string;
  sunday_hours: string;
  favicon: string;
}

interface StoreSettingsState {
  storeSettings: StoreSettings | null;
  loading: boolean;
  error: string | null;
}

const initialState: StoreSettingsState = {
  storeSettings: null,
  loading: false,
  error: null,
};

const storeSettingsSlice = createSlice({
  name: 'storeSettings',
  initialState,
  reducers: {
    setStoreSettings: (state, action: PayloadAction<StoreSettings>) => {
      state.storeSettings = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setStoreSettings, setLoading, setError, clearError } = storeSettingsSlice.actions;
export default storeSettingsSlice.reducer;
