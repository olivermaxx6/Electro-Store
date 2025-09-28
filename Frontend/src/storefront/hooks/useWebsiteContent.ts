import { useState, useEffect } from 'react';

interface WebsiteContent {
  id: number;
  banner1_image: string | null;
  banner1_text: string;
  banner1_link: string;
  banner2_image: string | null;
  banner2_text: string;
  banner2_link: string;
  banner3_image: string | null;
  banner3_text: string;
  banner3_link: string;
  logo: string | null;
  
  // Deal Product 1
  deal1_title: string;
  deal1_subtitle: string;
  deal1_discount: string;
  deal1_description: string;
  deal1_image: string | null;
  deal1_end_date: string;

  phone: string;
  email: string;
  street_address: string;
  city: string;
  postcode: string;
  country: string;
  
  // Home Page Content
  home_hero_subtitle: string;
  home_services_description: string;
  home_categories_description: string;
  
  // Services Page Content - Updated with title field
  services_page_title: string;
  services_page_description: string;
}

interface UseWebsiteContentReturn {
  content: WebsiteContent | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useWebsiteContent = (): UseWebsiteContentReturn => {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8001/api/public/website-content/1/');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setContent(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
      setError(errorMessage);
      console.error('Failed to fetch website content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return {
    content,
    loading,
    error,
    refetch: fetchContent,
  };
};
