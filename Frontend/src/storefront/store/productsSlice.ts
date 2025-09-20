import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, Category, FilterState, SortOption } from '../lib/types';

interface ProductsState {
  items: Product[];
  categories: Category[];
  brands: string[];
  loading: boolean;
  error: string | null;
  filters: FilterState;
  sortBy: SortOption;
  searchQuery: string;
}

const initialState: ProductsState = {
  items: [],
  categories: [],
  brands: [],
  loading: false,
  error: null,
  filters: {},
  sortBy: 'popularity',
  searchQuery: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    
    setBrands: (state, action: PayloadAction<string[]>) => {
      state.brands = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    setFilters: (state, action: PayloadAction<FilterState>) => {
      state.filters = action.payload;
    },
    
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.sortBy = 'popularity';
      state.searchQuery = '';
    },
  },
});

export const {
  setProducts,
  setCategories,
  setBrands,
  setLoading,
  setError,
  setFilters,
  setSortBy,
  setSearchQuery,
  clearFilters,
} = productsSlice.actions;

// Selectors
export const selectProducts = (state: { products: ProductsState }) => state.products.items;
export const selectCategories = (state: { products: ProductsState }) => state.products.categories;
export const selectBrands = (state: { products: ProductsState }) => state.products.brands;
export const selectLoading = (state: { products: ProductsState }) => state.products.loading;
export const selectError = (state: { products: ProductsState }) => state.products.error;
export const selectFilters = (state: { products: ProductsState }) => state.products.filters;
export const selectSortBy = (state: { products: ProductsState }) => state.products.sortBy;
export const selectSearchQuery = (state: { products: ProductsState }) => state.products.searchQuery;

export const selectFilteredProducts = (state: { products: ProductsState }) => {
  const { items, filters, sortBy, searchQuery } = state.products;
  let filtered = [...items];
  
  // Apply search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(product =>
      product.title.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }
  
  // Apply category filter
  if (filters.category) {
    filtered = filtered.filter(product => product.category === filters.category);
  }
  
  // Apply brand filter
  if (filters.brand && filters.brand.length > 0) {
    filtered = filtered.filter(product => 
      product.brand && filters.brand!.includes(product.brand)
    );
  }
  
  // Apply rating filter
  if (filters.rating) {
    filtered = filtered.filter(product => 
      product.rating && product.rating >= filters.rating!
    );
  }
  
  // Apply price range filter
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter(product => 
      product.price >= min && product.price <= max
    );
  }
  
  // Apply discount filter
  if (filters.onlyDiscounted) {
    filtered = filtered.filter(product => 
      product.discount_rate && product.discount_rate > 0
    );
  }

  // Apply new arrivals filter
  if (filters.onlyNewArrivals) {
    filtered = filtered.filter(product => 
      product.isNew === true
    );
  }

  // Apply top selling filter
  if (filters.onlyTopSelling) {
    filtered = filtered.filter(product => 
      product.is_top_selling === true
    );
  }
  
  // Apply sorting
  switch (sortBy) {
    case 'newest':
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'popularity':
    default:
      filtered.sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0));
      break;
  }
  
  return filtered;
};

export default productsSlice.reducer;
