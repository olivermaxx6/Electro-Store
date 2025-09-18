import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Grid, List } from 'lucide-react';
import { setProducts, setCategories, setSortBy, selectProducts, selectCategories } from '../store/productsSlice';
import { productRepo } from '../lib/repo';
import { formatCurrencySymbol } from '../lib/format';
import { Currency } from '../lib/types';
import { useStoreSettings } from '../hooks/useStoreSettings';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ProductCard from '../components/products/ProductCard';
import Placeholder from '../components/common/Placeholder';
import DualRangeSlider from '../components/filters/DualRangeSlider';

const Category: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const { settings } = useStoreSettings();
  
  // Debug: Log categories from Redux store
  console.log('Categories from Redux store:', categories);
  
  // Temporary: Use local state for categories to test
  const [localCategories, setLocalCategories] = useState<any[]>([]);
  const [dynamicBrands, setDynamicBrands] = useState<string[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  
  const sortBy = searchParams.get('sort') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1');
  const viewMode = searchParams.get('view') || 'grid';
  
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading categories from backend API...');
        // Load categories from backend API
        const response = await fetch('http://localhost:8001/api/public/categories/?top=true');
        console.log('API Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response data:', data);
          const categoriesData = data.results || data;
          console.log('Categories loaded from API:', categoriesData);
          dispatch(setCategories(categoriesData));
          setLocalCategories(categoriesData);
        } else {
          console.error('API request failed with status:', response.status);
        }
        
        // Load brands from backend API
        try {
          const brandsResponse = await fetch('http://127.0.0.1:8001/api/public/brands/');
          if (brandsResponse.ok) {
            const brandsData = await brandsResponse.json();
            const brands = brandsData.results || brandsData;
            setDynamicBrands(brands.map((brand: any) => brand.name));
          }
        } catch (brandsError) {
          console.error('Failed to load brands:', brandsError);
        } finally {
          setBrandsLoading(false);
        }
        
        if (slug === 'deals') {
          // Load discounted products for deals page
          const allProducts = await productRepo.getAll();
          const discountedProducts = allProducts.filter(p => p.discount_rate && p.discount_rate > 0);
          dispatch(setProducts(discountedProducts));
        } else if (slug) {
          // Load products for specific category
          const categoryProducts = await productRepo.getByCategory(slug);
          dispatch(setProducts(categoryProducts));
        } else {
          // Load all products for shop page (when slug is undefined)
          const allProducts = await productRepo.getAll();
          dispatch(setProducts(allProducts));
        }
      } catch (error) {
        console.error('Failed to load category data:', error);
      }
    };
    
    loadData();
  }, [slug, dispatch]);
  
  const currentCategory = categories.find(c => c.slug === slug);
  
  const handleSortChange = (newSort: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', newSort);
    setSearchParams(newSearchParams);
    dispatch(setSortBy(newSort as any));
  };
  
  const handleViewChange = (newView: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', newView);
    setSearchParams(newSearchParams);
  };
  
  // Filter products based on filters
  let filteredProducts = [...products];
  
  // Apply price range filter
  filteredProducts = filteredProducts.filter(product => 
    product.price >= priceRange[0] && product.price <= priceRange[1]
  );
  
  // Apply discount filter
  if (onlyDiscounted) {
    filteredProducts = filteredProducts.filter(product => 
      product.discount_rate && product.discount_rate > 0
    );
  }
  
  // Sort products based on current sort option
  const sortedProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popularity':
      default:
        return (b.ratingCount || 0) - (a.ratingCount || 0);
    }
  });
  
  const pageSize = 12;
  const startIndex = (page - 1) * pageSize;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {slug === 'deals' 
              ? 'Hot Deals' 
              : slug === undefined 
                ? 'Shop' 
                : currentCategory?.name || 'Category'
            }
          </h1>
          <p className="text-gray-600">
            {slug === 'deals' 
              ? 'Discover amazing deals and discounts on our best products'
              : slug === undefined
                ? 'Browse our collection of products'
                : `Browse our collection of ${currentCategory?.name?.toLowerCase() || 'products'}`
            }
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
                <div className="space-y-2">
                  {localCategories.length > 0 ? (
                    localCategories.map((category) => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      Loading categories...
                    </div>
                  )}
                </div>
                {/* Debug info */}
                <div className="mt-2 text-xs text-gray-400">
                  Categories loaded: {localCategories.length} (Redux: {categories.length})
                </div>
              </div>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Price Range</h4>
                <DualRangeSlider
                  min={0}
                  max={5000}
                  step={10}
                  value={priceRange}
                  onChange={setPriceRange}
                  formatValue={(val) => `${formatCurrencySymbol(settings?.currency as Currency || 'USD')}${val}`}
                />
                <button
                  onClick={() => setPriceRange([0, 5000])}
                  className="w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 underline mt-2"
                >
                  Reset Price Range
                </button>
              </div>
              
              {/* Brand Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Brand</h4>
                <div className="space-y-2">
                  {brandsLoading ? (
                    <div className="text-sm text-gray-500">Loading brands...</div>
                  ) : dynamicBrands.length > 0 ? (
                    dynamicBrands.map((brand) => (
                      <label key={brand} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-gray-700">{brand}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">No brands available</div>
                  )}
                </div>
                {/* Debug info */}
                <div className="mt-2 text-xs text-gray-400">
                  Brands loaded: {dynamicBrands.length}
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {rating}+ Stars
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Discount Filter */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={onlyDiscounted}
                    onChange={(e) => setOnlyDiscounted(e.target.checked)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">Only discounted</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, sortedProducts.length)} of {sortedProducts.length} products
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="popularity">Sort by Popularity</option>
                    <option value="newest">Sort by Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleViewChange('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewChange('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Placeholder size="lg" className="mx-auto mb-4">
                  <div className="text-gray-400">No products found</div>
                </Placeholder>
                <p className="text-gray-600">No products match your current filters.</p>
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('page', (page - 1).toString());
                      setSearchParams(newSearchParams);
                    }}
                    disabled={page === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => {
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.set('page', pageNum.toString());
                        setSearchParams(newSearchParams);
                      }}
                      className={`px-3 py-2 text-sm border rounded-md ${
                        pageNum === page
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => {
                      const newSearchParams = new URLSearchParams(searchParams);
                      newSearchParams.set('page', (page + 1).toString());
                      setSearchParams(newSearchParams);
                    }}
                    disabled={page === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;