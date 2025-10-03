export interface Service {
  id: number;
  name: string;
  description: string;
  price: number | string;
  images?: Array<{ id: number; image: string; created_at: string }>;
  rating: number | string;
  review_count: number;
  view_count?: number;
  overview?: string;
  included_features?: string[];
  process_steps?: Array<{ title?: string; name?: string; description?: string; details?: string; duration?: string; timeframe?: string; step?: string | number }>;
  key_features?: string[];
  contact_info?: { phone?: string; email?: string };
  availability?: string;
  category?: { id: number; name: string; parent?: number | null; parent_name?: string | null } | null;
}

export interface ServiceReview {
  id: number;
  service: number;
  user?: number | null;
  rating: number;
  title?: string;
  comment: string;
  is_verified?: boolean;
  created_at: string;
}

export declare function getServices(params?: Record<string, any>): Promise<any>;
export declare function getService(id: string | number): Promise<Service>;
export declare function getServiceCategories(): Promise<any>;
export declare function getServiceReviews(serviceId: string | number, params?: Record<string, any>): Promise<ServiceReview[]>;
export declare function createServiceReview(serviceId: string | number, reviewData: Partial<ServiceReview>): Promise<ServiceReview>;
export declare function checkUserServiceReview(serviceId: string | number): Promise<any>;
export declare function calculateServiceStats(serviceId: string | number): Promise<any>;
export declare function submitServiceQuery(serviceId: string | number, queryData: Record<string, any>): Promise<any>;
export declare function incrementServiceView(serviceId: string | number): Promise<any>;

declare const _default: any;
export default _default;

