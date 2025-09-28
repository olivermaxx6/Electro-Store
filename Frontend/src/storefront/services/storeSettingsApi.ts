import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001/api/public';

export interface StoreSettings {
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

export const getStoreSettings = async (): Promise<StoreSettings> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/store-settings/?t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching store settings:', error);
    throw error;
  }
};
