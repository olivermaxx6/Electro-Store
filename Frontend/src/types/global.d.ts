declare module '../../lib/servicesApi' {
  export const getService: any;
  export const getServiceReviews: any;
  export const createServiceReview: any;
  export const calculateServiceStats: any;
  export const submitServiceQuery: any;
  export const incrementServiceView: any;
  export type Service = any;
  export type ServiceReview = any;
  const _default: any;
  export default _default;
}

declare module '../lib/format' {
  export function formatPrice(amount: number, currency?: string): string;
}

