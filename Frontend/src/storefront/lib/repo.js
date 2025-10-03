// Repository pattern for data access

// Mock data repositories for development
const productRepo = {
  async findAll(params = {}) {
    try {
      console.log('📦 ProductRepo: Fetching all products...');
      const response = await fetch('http://127.0.0.1:8001/api/public/products/');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const products = data.results || data;
      console.log('📦 ProductRepo: Loaded products:', products.length);
      return Array.isArray(products) ? products : [];
    } catch (error) {
      console.error('❌ ProductRepo: Failed to fetch products:', error);
      return [];
    }
  },
  
  async findById(id) {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/public/products/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ ProductRepo: Failed to fetch product:', error);
      return null;
    }
  },
  
  async search(query) {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/public/products/?search=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data.results || data;
    } catch (error) {
      console.error('❌ ProductRepo: Failed to search products:', error);
      return [];
    }
  }
};

const categoryRepo = {
  async findAll() {
    try {
      console.log('📂 CategoryRepo: Fetching all categories...');
      
      // First try to get top categories
      let response = await fetch('http://127.0.0.1:8001/api/public/categories/?top=true');
      if (response.ok) {
        const data = await response.json();
        const topCategories = data.results || data;
        if (topCategories.length > 0) {
          console.log('📂 CategoryRepo: Loaded top categories:', topCategories.length);
          return Array.isArray(topCategories) ? topCategories : [];
        }
      }
      
      // Fallback to all categories
      response = await fetch('http://127.0.0.1:8001/api/public/categories/');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      let allCategories = data.results || data;
      
      // If paginated, fetch all pages
      if (data.next) {
        let nextUrl = data.next;
        while (nextUrl) {
          const nextResponse = await fetch(nextUrl);
          if (nextResponse.ok) {
            const nextData = await nextResponse.json();
            allCategories = [...allCategories, ...(nextData.results || [])];
            nextUrl = nextData.next;
          } else {
            break;
          }
        }
      }
      
      console.log('📂 CategoryRepo: Loaded all categories:', allCategories.length);
      console.log('📂 CategoryRepo: Sample category:', allCategories[0]);
      
      // Filter for parent categories (no parent)
      const parentCategories = allCategories.filter(cat => 
        !cat.parent && !cat.parent_id && !cat.parentId
      );
      
      console.log('📂 CategoryRepo: Parent categories found:', parentCategories.length);
      return parentCategories.length > 0 ? parentCategories : allCategories.slice(0, 10);
      
    } catch (error) {
      console.error('❌ CategoryRepo: Failed to fetch categories:', error);
      return [];
    }
  },
  
  async findById(id) {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/public/categories/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ CategoryRepo: Failed to fetch category:', error);
      return null;
    }
  }
};

const brandRepo = {
  async findAll() {
    try {
      console.log('🏷️ BrandRepo: Fetching all brands...');
      const response = await fetch('http://127.0.0.1:8001/api/public/brands/');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const brands = data.results || data;
      console.log('🏷️ BrandRepo: Loaded brands:', brands.length);
      return Array.isArray(brands) ? brands : [];
    } catch (error) {
      console.error('❌ BrandRepo: Failed to fetch brands:', error);
      return [];
    }
  },
  
  async findById(id) {
    try {
      const response = await fetch(`http://127.0.0.1:8001/api/public/brands/${id}/`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('❌ BrandRepo: Failed to fetch brand:', error);
      return null;
    }
  }
};

const contentRepo = {
  async getContactInfo() {
    try {
      console.log('contentRepo - Fetching contact info from API...');
      const response = await fetch('http://127.0.0.1:8001/api/public/store-settings/', {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch store settings: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('contentRepo - Store settings data:', data);
      
      // Transform the store settings data to match the expected contact info format
      return {
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
    } catch (error) {
      console.error('contentRepo - Error fetching contact info:', error);
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
};

export {
  productRepo,
  categoryRepo,
  brandRepo,
  contentRepo
};
