// TypeScript declarations for servicesApi.js

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: ServiceCategory | null;
  duration: string;
  is_active: boolean;
  image: string | null;
  images?: Array<{ id: number; image: string; created_at: string }>;
  reviews_count: number;
  rating: number;
  review_count: number;
  view_count: number;
  overview: string;
  included_features: string[];
  process_steps: Array<{ title: string; description: string; duration?: string }>;
  key_features: string[];
  contact_info: { phone?: string; email?: string };
  availability: string;
  created_at: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  ordering: number;
  is_active: boolean;
  image: string | null;
  parent: number | null;
  parent_name: string | null;
  children: ServiceCategory[];
  depth: number;
  services_count: number;
  created_at: string;
}

export interface ServiceReview {
  id: number;
  service: number;
  user: number | null;
  rating: number;
  title: string;
  comment: string;
  is_verified: boolean;
  created_at: string;
}

export interface ApiResponse<T> {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
}

export declare function getServices(params?: Record<string, any>): Promise<ApiResponse<Service> | Service[]>;
export declare function getService(id: number): Promise<Service>;
export declare function getServiceCategories(): Promise<ApiResponse<ServiceCategory> | ServiceCategory[]>;
export declare function getServiceReviews(serviceId: number, params?: Record<string, any>): Promise<ApiResponse<ServiceReview> | ServiceReview[]>;
export declare function createServiceReview(serviceId: number, reviewData: Partial<ServiceReview>): Promise<ServiceReview>;
export declare function checkUserServiceReview(serviceId: number): Promise<{ hasReviewed: boolean; review?: ServiceReview }>;
export declare function calculateServiceStats(reviews: ServiceReview[]): { averageRating: number; reviewCount: number };
export declare function submitServiceQuery(serviceId: number, queryData: Record<string, any>): Promise<any>;
export declare function incrementServiceView(serviceId: string): Promise<{ view_count: number }>;

export { Service as ServiceType, ServiceCategory as ServiceCategoryType, ServiceReview as ServiceReviewType };
