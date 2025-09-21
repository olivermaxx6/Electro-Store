import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Grid, List, ArrowRight } from 'lucide-react';
import { getProducts } from '../../lib/productsApi';
import ProductCard from '../components/products/ProductCard';
import LoadingScreen from '../components/common/LoadingScreen';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  description?: string;
}

interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  rating: number;
  review_count: number;
  view_count: number;
  category: number; // This is the category ID from the API
  category_data?: {
    id: number;
    name: string;
    slug: string;
  };
  images: Array<{
    id: number;
    image: string;
  }>;
  created_at: string;
}

interface Product {
  id: string;
  slug: string;
  title: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  ratingCount: number;
  isNew: boolean;
  discountPct: number;
  description: string;
  images: string[];
  inStock: boolean;
  sku: string;
  specs: Record<string, any>;
  viewCount: number;
  image?: string;
}

const AllSubcategories: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get category ID from URL params
  const categoryId = searchParams.get('category');
  const categoryName = searchParams.get('name');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch ALL categories from public backend
        let allCategories: any[] = [];
        let nextUrl = 'http://127.0.0.1:8001/api/public/categories/';
        
        while (nextUrl) {
          const categoriesResponse = await fetch(nextUrl);
          if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            allCategories = [...allCategories, ...(categoriesData.results || [])];
            nextUrl = categoriesData.next || null;
          } else {
            console.error('Categories API request failed with status:', categoriesResponse.status);
            throw new Error(`Failed to load categories: ${categoriesResponse.status} ${categoriesResponse.statusText}`);
          }
        }
        
        setCategories(allCategories);
        
        // Fetch all products from backend
        const productsData = await getProducts();
        setProducts(productsData);
        
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get the parent category
  const parentCategory = categories.find(cat => cat.id === parseInt(categoryId || '0'));

  // Get all subcategories for this parent category
  const getSubcategories = () => {
    if (!categoryId) return [];
    return categories.filter(cat => cat.parent === parseInt(categoryId));
  };

  // Get products for a specific subcategory
  const getProductsBySubcategory = (subcategoryId: number) => {
    return products.filter(product => product.category === subcategoryId);
  };

  // Convert backend product to ProductCard format
  const convertToProductCard = (backendProduct: BackendProduct): Product => {
    return {
      id: backendProduct.id.toString(),
      slug: backendProduct.name.toLowerCase().replace(/\s+/g, '-'),
      title: backendProduct.name,
      category: backendProduct.category_data?.name || 'Uncategorized',
      brand: 'Unknown',
      price: backendProduct.price,
      oldPrice: undefined,
      rating: backendProduct.rating,
      ratingCount: backendProduct.review_count,
      isNew: false,
      discountPct: 0,
      description: backendProduct.description,
      images: backendProduct.images.map(img => img.image),
      inStock: true,
      sku: `SKU-${backendProduct.id}`,
      specs: {},
      viewCount: backendProduct.view_count,
      image: backendProduct.images.length > 0 ? backendProduct.images[0].image : undefined,
    };
  };

  const subcategories = getSubcategories();

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading subcategories..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No category selected
  if (!categoryId || !parentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No category selected</p>
          <button 
            onClick={() => navigate('/categories')}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/categories')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Categories
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {categoryName || parentCategory.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                All subcategories and products in {categoryName || parentCategory.name}
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subcategories List */}
        <div className="space-y-12">
          {subcategories.map((subcategory) => {
            const subcategoryProducts = getProductsBySubcategory(subcategory.id);
            
            return (
              <div key={subcategory.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                {/* Subcategory Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {subcategory.name}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {subcategoryProducts.length} products available
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>

                {/* Products Grid/List */}
                <div className="p-6">
                  {subcategoryProducts.length > 0 ? (
                    <div className={`grid gap-6 ${
                      viewMode === 'grid' 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                        : 'grid-cols-1'
                    }`}>
                      {subcategoryProducts.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={convertToProductCard(product)}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">
                        No products available in this subcategory
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* No subcategories message */}
        {subcategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No subcategories found for {categoryName || parentCategory.name}
            </p>
            <button 
              onClick={() => navigate('/categories')}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Back to Categories
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllSubcategories;
