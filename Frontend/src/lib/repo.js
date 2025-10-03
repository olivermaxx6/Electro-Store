// Repository pattern for data access

// Mock data repositories for development
const productRepo = {
  async findAll(params = {}) {
    // Mock implementation - in real app, this would call API
    return [];
  },
  
  async findById(id) {
    // Mock implementation
    return null;
  },
  
  async search(query) {
    // Mock implementation
    return [];
  }
};

const categoryRepo = {
  async findAll() {
    // Mock implementation
    return [];
  },
  
  async findById(id) {
    // Mock implementation
    return null;
  }
};

const brandRepo = {
  async findAll() {
    // Mock implementation
    return [];
  },
  
  async findById(id) {
    // Mock implementation
    return null;
  }
};

const contentRepo = {
  async getContactInfo() {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/public/store-settings/?t=${Date.now()}&r=${Math.random()}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch store settings: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform the store settings data to match the expected contact info format
      const fullAddress = [data.street_address, data.city, data.country]
        .filter(Boolean)
        .join(', ');
      
      return {
        phone: data.phone || '',
        email: data.email || '',
        address: fullAddress,
        city: data.city || '',
        country: data.country || '',
        businessHours: {
          mondayFriday: data.monday_friday_hours || 'Monday - Friday: 9:00 AM - 6:00 PM',
          saturday: data.saturday_hours || 'Saturday: 10:00 AM - 4:00 PM',
          sunday: data.sunday_hours || 'Sunday: Closed'
        }
      };
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Return default values on error
      return {
        phone: '',
        email: '',
        address: '',
        city: '',
        country: '',
        businessHours: {
          mondayFriday: 'Monday - Friday: 9:00 AM - 6:00 PM',
          saturday: 'Saturday: 10:00 AM - 4:00 PM',
          sunday: 'Sunday: Closed'
        }
      };
    }
  }
};

export {
  productRepo,
  categoryRepo,
  brandRepo,
  contentRepo
};
