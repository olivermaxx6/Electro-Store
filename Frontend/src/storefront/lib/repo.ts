// Content repository for fetching website content and contact information

interface ContactInfo {
  phone: string;
  email: string;
  city: string;
  country: string;
  address: string;
  businessHours: {
    mondayFriday: string;
    saturday: string;
    sunday: string;
  };
}

interface WebsiteContent {
  banner1_text: string;
  banner2_text: string;
  // Add other content fields as needed
}

class ContentRepository {
  private baseUrl = 'http://127.0.0.1:8001/api';

  async getContactInfo(): Promise<ContactInfo> {
    try {
      const url = `${this.baseUrl}/public/store-settings/?t=${Date.now()}&r=${Math.random()}`;
      console.log('contentRepo - Fetching from:', url);
      console.log('contentRepo - Full URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('contentRepo - Response status:', response.status);
      console.log('contentRepo - Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('contentRepo - Response not OK:', response.status, response.statusText);
        throw new Error('Failed to fetch contact info');
      }
      
      const responseText = await response.text();
      console.log('contentRepo - Raw response text:', responseText);
      
      const data = JSON.parse(responseText);
      console.log('contentRepo - Parsed data:', data);
      
      // Map the store settings to contact info format
      const mappedData = {
        phone: data.phone || '',
        email: data.email || '',
        city: data.city || '',
        country: data.country || '',
        address: data.street_address || '',
        businessHours: {
          mondayFriday: data.monday_friday_hours || 'Monday - Friday: 9:00 AM - 6:00 PM',
          saturday: data.saturday_hours || 'Saturday: 10:00 AM - 4:00 PM',
          sunday: data.sunday_hours || 'Sunday: Closed'
        }
      };
      console.log('contentRepo - Mapped data:', mappedData);
      console.log('contentRepo - Phone value:', mappedData.phone, 'Raw phone:', data.phone);
      console.log('contentRepo - Email value:', mappedData.email, 'Raw email:', data.email);
      console.log('contentRepo - City value:', mappedData.city, 'Raw city:', data.city);
      console.log('contentRepo - Country value:', mappedData.country, 'Raw country:', data.country);
      console.log('contentRepo - Phone empty check:', !mappedData.phone);
      console.log('contentRepo - Email empty check:', !mappedData.email);
      console.log('contentRepo - Phone length:', mappedData.phone?.length);
      console.log('contentRepo - Email length:', mappedData.email?.length);
      console.log('contentRepo - Phone truthy check:', !!mappedData.phone);
      console.log('contentRepo - Email truthy check:', !!mappedData.email);
      return mappedData;
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Return default values on error
      return {
        phone: '',
        email: '',
        city: '',
        country: '',
        address: '',
        businessHours: {
          mondayFriday: 'Monday - Friday: 9:00 AM - 6:00 PM',
          saturday: 'Saturday: 10:00 AM - 4:00 PM',
          sunday: 'Sunday: Closed'
        }
      };
    }
  }

  async getWebsiteContent(): Promise<WebsiteContent> {
    try {
      const response = await fetch(`${this.baseUrl}/admin/website-content/`);
      if (!response.ok) {
        throw new Error('Failed to fetch website content');
      }
      const data = await response.json();
      
      return {
        banner1_text: data.banner1_text || '',
        banner2_text: data.banner2_text || '',
      };
    } catch (error) {
      console.error('Error fetching website content:', error);
      // Return default values on error
      return {
        banner1_text: '',
        banner2_text: '',
      };
    }
  }
}

export const contentRepo = new ContentRepository();
