// Type definitions and interfaces for the application

// User types
export const User = {
  id: null,
  email: '',
  first_name: '',
  last_name: '',
  is_staff: false,
  is_active: true,
  date_joined: null,
  last_login: null
};

// Product types
export const Product = {
  id: null,
  name: '',
  description: '',
  price: 0,
  sale_price: null,
  stock: 0,
  category: null,
  brand: '',
  images: [],
  specifications: {},
  features: [],
  reviews_count: 0,
  rating: 0,
  is_featured: false,
  is_active: true,
  created_at: null,
  updated_at: null
};

// Category types
export const Category = {
  id: null,
  name: '',
  description: '',
  image: null,
  parent: null,
  is_active: true,
  products_count: 0,
  created_at: null
};

// Order types
export const Order = {
  id: null,
  user: null,
  order_number: '',
  status: 'pending',
  total_amount: 0,
  shipping_address: {},
  billing_address: {},
  items: [],
  payment_status: 'pending',
  payment_method: '',
  tracking_number: '',
  notes: '',
  created_at: null,
  updated_at: null
};

// Cart item types
export const CartItem = {
  id: null,
  product: null,
  quantity: 1,
  price: 0,
  total: 0
};

// Wishlist item types
export const WishlistItem = {
  id: null,
  product: null,
  user: null,
  created_at: null
};

// Review types
export const Review = {
  id: null,
  product: null,
  user: null,
  rating: 0,
  title: '',
  comment: '',
  is_verified: false,
  created_at: null
};

// Service types
export const Service = {
  id: null,
  name: '',
  description: '',
  price: 0,
  category: null,
  duration: '',
  is_active: true,
  image: null,
  reviews_count: 0,
  rating: 0,
  created_at: null
};

// Service Review types
export const ServiceReview = {
  id: null,
  service: null,
  user: null,
  rating: 0,
  title: '',
  comment: '',
  is_verified: false,
  created_at: null
};

// Currency types
export const Currency = {
  code: 'GBP',
  symbol: '£',
  name: 'British Pound'
};

// UI State types
export const UIState = {
  loading: false,
  error: null,
  theme: 'light',
  sidebarOpen: false,
  cartOpen: false,
  searchOpen: false
};

// Toast types
export const Toast = {
  id: null,
  type: 'info', // 'success', 'error', 'warning', 'info'
  title: '',
  message: '',
  duration: 5000,
  action: null
};

// Filter state types
export const FilterState = {
  category: null,
  brand: null,
  minPrice: 0,
  maxPrice: 1000,
  rating: 0,
  inStock: false,
  onSale: false,
  search: ''
};

// Sort option types
export const SortOption = {
  value: 'name',
  label: 'Name',
  direction: 'asc'
};

// API Response types
export const ApiResponse = {
  data: null,
  count: 0,
  next: null,
  previous: null,
  results: []
};

// Store Settings types
export const StoreSettings = {
  store_name: '',
  currency: 'GBP',
  tax_rate: 0,
  shipping_rate: 0,
  standard_shipping_rate: 0,
  express_shipping_rate: 0,
  street_address: '',
  city: '',
  postcode: '',
  country: '',
  phone: '',
  email: '',
  monday_friday_hours: '',
  saturday_hours: '',
  sunday_hours: '',
  store_logo: null,
  about_us_picture: null,
  favicon: null
};

// Website Content types
export const WebsiteContent = {
  about_us: '',
  privacy_policy: '',
  terms_of_service: '',
  shipping_info: '',
  return_policy: '',
  contact_info: '',
  footer_text: '',
  header_banner: '',
  maintenance_mode: false
};

// Chat Message types
export const ChatMessage = {
  id: null,
  room: null,
  user: null,
  message: '',
  message_type: 'text', // 'text', 'image', 'file'
  is_admin: false,
  timestamp: null,
  read: false
};

// Chat Room types
export const ChatRoom = {
  id: null,
  name: '',
  participants: [],
  last_message: null,
  unread_count: 0,
  created_at: null,
  updated_at: null
};

export default {
  User,
  Product,
  Category,
  Order,
  CartItem,
  WishlistItem,
  Review,
  Service,
  ServiceReview,
  Currency,
  UIState,
  Toast,
  FilterState,
  SortOption,
  ApiResponse,
  StoreSettings,
  WebsiteContent,
  ChatMessage,
  ChatRoom
};
