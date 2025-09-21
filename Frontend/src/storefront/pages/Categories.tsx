import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Grid, List, Eye } from 'lucide-react';
import { Product } from '../../lib/types';
import ProductCard from '../components/products/ProductCard';
import LoadingScreen from '../components/common/LoadingScreen';
import { getProducts } from '../../lib/productsApi';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  created_at: string;
}

interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  discount_rate?: number;
  stock: number;
  brand: number | null;
  brand_data?: {
    id: number;
    name: string;
  };
  category: number;
  category_data?: {
    id: number;
    name: string;
    slug: string;
  };
  rating: number;
  review_count: number;
  view_count: number;
  images: Array<{
    id: number;
    image: string;
    is_main?: boolean;
    created_at: string;
  }>;
  isNew?: boolean;
  is_top_selling?: boolean;
  created_at: string;
}

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch ALL categories from public backend (both parent and children)
        // Handle pagination to get all categories
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
        
        console.log('Loaded categories:', allCategories.length);
        console.log('Sample categories:', allCategories.slice(0, 3));
        setCategories(allCategories);
        
        // Fetch all products from backend
        const productsData = await getProducts();
        console.log('Loaded products:', productsData.length);
        console.log('Sample products:', productsData.slice(0, 3));
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

  // Get all child categories for a parent category
  const getChildCategories = (parentId: number): Category[] => {
    return categories.filter(cat => cat.parent === parentId);
  };

  // Group products by category (parent + all its children)
  const getProductsByCategory = (categoryId: number) => {
    const categoryIds = [categoryId];
    
    // Include all child categories
    const children = getChildCategories(categoryId);
    categoryIds.push(...children.map(child => child.id));

    const filteredProducts = products.filter(product => 
      categoryIds.includes(product.category || 0)
    );
    
    console.log(`Category ${categoryId}: checking ${categoryIds.length} category IDs, found ${filteredProducts.length} products`);
    return filteredProducts;
  };

  // Get top-level categories (parent = null) that have products
  const getTopLevelCategoriesWithProducts = () => {
    return categories.filter(category => {
      // Only show top-level categories (parent is null)
      if (category.parent !== null) return false;
      
      // Check if this category or its children have products
      const hasProducts = getProductsByCategory(category.id).length > 0;
      console.log(`Category ${category.name}: ${hasProducts ? 'HAS' : 'NO'} products (${getProductsByCategory(category.id).length})`);
      return hasProducts;
    });
  };

  // Convert backend product to ProductCard format
  const convertToProductCard = (backendProduct: BackendProduct): Product => {
    // Find main image or use first image
    const mainImage = backendProduct.images.find(img => img.is_main) || backendProduct.images[0];
    
    // Calculate old price if discount exists
    const oldPrice = backendProduct.discount_rate && backendProduct.discount_rate > 0 
      ? backendProduct.price / (1 - backendProduct.discount_rate / 100)
      : undefined;
    
    return {
      id: backendProduct.id.toString(),
      slug: backendProduct.name.toLowerCase().replace(/\s+/g, '-'),
      title: backendProduct.name,
      category: backendProduct.category_data?.name || 'Uncategorized',
      brand: backendProduct.brand_data?.name || 'Unknown',
      price: backendProduct.price,
      oldPrice: oldPrice,
      rating: backendProduct.rating,
      ratingCount: backendProduct.review_count,
      isNew: backendProduct.isNew || false,
      discountPct: backendProduct.discount_rate || 0,
      discount_rate: backendProduct.discount_rate || 0,
      is_top_selling: backendProduct.is_top_selling || false,
      description: backendProduct.description,
      images: backendProduct.images.map(img => img.image),
      stock: backendProduct.stock || 0,
      inStock: (backendProduct.stock || 0) > 0,
      sku: `SKU-${backendProduct.id}`,
      specs: {},
      viewCount: backendProduct.view_count,
      image: mainImage ? mainImage.image : undefined,
    };
  };

  const categoriesWithProducts = getTopLevelCategoriesWithProducts();
  console.log('Categories with products:', categoriesWithProducts.length);
  console.log('All categories count:', categories.length);
  console.log('Products count:', products.length);

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading categories..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ChevronRight className="w-12 h-12 text-red-600 dark:text-blue-400 rotate-90" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Categories
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link to="/" className="hover:text-red-600 dark:hover:text-blue-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span>Categories</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Product <span className="text-red-600 dark:text-blue-400">Categories</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Explore our wide range of products organized by category
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-red-600 dark:bg-blue-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-blue-400'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-red-600 dark:bg-blue-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-blue-400'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="space-y-12">
          {(categoriesWithProducts.length > 0 ? categoriesWithProducts : categories.filter(cat => cat.parent === null)).map((category) => {
            const categoryProducts = getProductsByCategory(category.id);
            
            return (
              <div key={category.id} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                {/* Category Header */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {category.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{categoryProducts.length} products</span>
                        {getChildCategories(category.id).length > 0 && (
                          <span>{getChildCategories(category.id).length} subcategories</span>
                        )}
                      </div>
                    </div>
                    
                    {/* View All Button */}
                    <button
                      onClick={() => navigate(`/allsubcategories?category=${category.id}&name=${encodeURIComponent(category.name)}`)}
                      className="px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View All
                    </button>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="p-6">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categoryProducts.slice(0, 8).map((backendProduct) => {
                        const product = convertToProductCard(backendProduct);
                        return <ProductCard key={product.id} product={product} />;
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoryProducts.slice(0, 6).map((backendProduct) => {
                        const product = convertToProductCard(backendProduct);
                        return (
                          <div key={product.id} className="flex items-center gap-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition-shadow">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                              {product.image ? (
                                <img 
                                  src={product.image.startsWith('http') ? product.image : `http://localhost:8001${product.image}`}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                  No Image
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <Link 
                                to={`/product/${product.id}`}
                                className="block group"
                              >
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                  {product.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                  {product.description}
                                </p>
                              </Link>
                            </div>
                            
                            <div className="text-right flex-shrink-0">
                              <div className="text-lg font-bold text-gray-900 dark:text-white">
                                ${product.price}
                              </div>
                              {product.oldPrice && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                  ${product.oldPrice}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Show More Button */}
                  {categoryProducts.length > (viewMode === 'grid' ? 8 : 6) && (
                    <div className="text-center mt-6">
                      <Link
                        to={`/category/${category.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 border border-red-600 dark:border-blue-600 text-red-600 dark:text-blue-400 rounded-lg hover:bg-red-50 dark:hover:bg-blue-900/20 transition-colors font-medium"
                      >
                        View All {categoryProducts.length} Products
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {categoriesWithProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Grid className="w-12 h-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Categories Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find any categories with products at the moment.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
