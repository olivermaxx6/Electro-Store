import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChevronDown, Grid, List, Search as SearchIcon, Filter, ShoppingBag, RefreshCw } from 'lucide-react';
import { setProducts, setCategories, setSortBy, selectProducts, selectCategories } from '../store/productsSlice';
import { formatCurrencySymbol } from '../lib/format';
import { Currency } from '../lib/types';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { getProducts } from '../../lib/productsApi';
import { Product } from '../lib/types';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ProductCard from '../components/products/ProductCard';
import Placeholder from '../components/common/Placeholder';
import DualRangeSlider from '../components/filters/DualRangeSlider';
import TitleUpdater from '../components/common/TitleUpdater';
import EmptyState from '../components/common/EmptyState';

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
  const [dynamicBrands, setDynamicBrands] = useState<{name: string, slug: string}[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyNewArrivals, setOnlyNewArrivals] = useState(false);
  const [onlyTopSelling, setOnlyTopSelling] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  
  const sortBy = searchParams.get('sort') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1');
  const viewMode = searchParams.get('view') || 'grid';
  
  // Initialize discounted filter from URL parameter
  useEffect(() => {
    const discountedParam = searchParams.get('discounted');
    if (discountedParam === 'true') {
      setOnlyDiscounted(true);
    }
    
    const newArrivalsParam = searchParams.get('new-arrivals');
    if (newArrivalsParam === 'true') {
      setOnlyNewArrivals(true);
    }
    
    const topSellingParam = searchParams.get('top-selling');
    if (topSellingParam === 'true') {
      setOnlyTopSelling(true);
    }
  }, [searchParams]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading categories from backend API...');
        // Load ALL categories from backend API (including subcategories)
        // Handle pagination to get all categories
        let allCategories: any[] = [];
        let nextUrl = 'http://127.0.0.1:8001/api/public/categories/';
        
        while (nextUrl) {
          const response = await fetch(nextUrl);
          console.log('API Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('API Response data page:', data);
            allCategories = [...allCategories, ...(data.results || [])];
            nextUrl = data.next || null;
          } else {
            console.error('API request failed with status:', response.status);
            break;
          }
        }
        
        console.log('All categories loaded from API:', allCategories);
        dispatch(setCategories(allCategories));
        setLocalCategories(allCategories);
        
        // Load brands from backend API
        try {
          const brandsResponse = await fetch('http://127.0.0.1:8001/api/public/brands/');
          if (brandsResponse.ok) {
            const brandsData = await brandsResponse.json();
            const brands = brandsData.results || brandsData;
            // Store both name and slug for brands
            setDynamicBrands(brands.map((brand: any) => ({ name: brand.name, slug: brand.slug })));
          }
        } catch (brandsError) {
          console.error('Failed to load brands:', brandsError);
        } finally {
          setBrandsLoading(false);
        }
        
        // Load products from API
        const apiProducts = await getProducts();
        console.log('Loaded products from API:', apiProducts.length);
        console.log('Sample API products:', apiProducts.slice(0, 3));
        
        // Transform API products to match expected format
        const transformedProducts = apiProducts.map((backendProduct: any) => {
          // Find main image or use first image
          const mainImage = backendProduct.images.find((img: any) => img.is_main) || backendProduct.images[0];
          
          // Calculate old price if discount exists
          const oldPrice = backendProduct.discount_rate && backendProduct.discount_rate > 0 
            ? backendProduct.price / (1 - backendProduct.discount_rate / 100)
            : undefined;
          
          return {
            id: backendProduct.id.toString(),
            slug: backendProduct.name.toLowerCase().replace(/\s+/g, '-'),
            title: backendProduct.name,
            category: backendProduct.category_data?.name || 'Uncategorized',
            categorySlug: backendProduct.category_data?.slug || 'uncategorized',
            brand: backendProduct.brand_data?.name || 'Unknown',
            brandSlug: backendProduct.brand_data?.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown',
            price: backendProduct.price,
            oldPrice: oldPrice,
            rating: backendProduct.rating,
            ratingCount: backendProduct.review_count,
            isNew: backendProduct.isNew || false,
            discountPct: backendProduct.discount_rate || 0,
            discount_rate: backendProduct.discount_rate || 0,
            is_top_selling: backendProduct.is_top_selling || false,
            description: backendProduct.description,
            images: backendProduct.images.map((img: any) => img.image),
            stock: backendProduct.stock || 0,
            inStock: (backendProduct.stock || 0) > 0,
            sku: `SKU-${backendProduct.id}`,
            specs: backendProduct.technical_specs || {},
            viewCount: backendProduct.view_count,
            image: mainImage ? mainImage.image : undefined,
          };
        });
        
        console.log('Transformed products:', transformedProducts.length);
        console.log('Sample transformed products:', transformedProducts.slice(0, 3));
        
        if (slug === 'deals') {
          // Filter for discounted products
          const discountedProducts = transformedProducts.filter((p: Product) => p.discount_rate && p.discount_rate > 0);
          dispatch(setProducts(discountedProducts));
        } else if (slug) {
          // Filter for specific category
          const categoryProducts = transformedProducts.filter((p: Product) => p.categorySlug === slug);
          dispatch(setProducts(categoryProducts));
        } else {
          // Load all products for shop page
          dispatch(setProducts(transformedProducts));
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

  const handleCategoryToggle = (categorySlug: string) => {
    console.log('Category toggle clicked:', categorySlug);
    setSelectedCategories(prev => {
      const newSelection = prev.includes(categorySlug) 
        ? prev.filter(c => c !== categorySlug)
        : [...prev, categorySlug];
      console.log('New category selection:', newSelection);
      return newSelection;
    });
  };

  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleRatingToggle = (rating: number) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedRatings([]);
    setOnlyDiscounted(false);
    setOnlyNewArrivals(false);
    setOnlyTopSelling(false);
    setPriceRange([0, 5000]);
    
    // Clear URL parameters
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('discounted');
    newSearchParams.delete('new-arrivals');
    newSearchParams.delete('top-selling');
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
      product.discountPct && product.discountPct > 0
    );
  }

  // Apply new arrivals filter
  if (onlyNewArrivals) {
    filteredProducts = filteredProducts.filter(product => 
      product.isNew === true
    );
  }

  // Apply top selling filter
  if (onlyTopSelling) {
    filteredProducts = filteredProducts.filter(product => 
      product.is_top_selling === true
    );
  }

  // Apply category filter (including subcategories)
  if (selectedCategories.length > 0) {
    console.log('Applying category filter:', selectedCategories);
    console.log('Available categories:', localCategories.map(cat => ({ name: cat.name, slug: cat.slug, parent: cat.parent })));
    console.log('Products before filtering:', filteredProducts.map(p => ({ title: p.title, categorySlug: p.categorySlug })));
    
    filteredProducts = filteredProducts.filter(product => {
      const productCategorySlug = product.categorySlug || '';
      console.log(`Checking product: ${product.title}, categorySlug: ${productCategorySlug}`);
      
      // Check if product's category matches any selected category
      if (selectedCategories.includes(productCategorySlug)) {
        console.log(`Direct match found for ${product.title}`);
        return true;
      }
      
      // Check if product's category is a subcategory of any selected top-level category
      const productCategory = localCategories.find(cat => cat.slug === productCategorySlug);
      if (productCategory && productCategory.parent) {
        // Find parent category by ID (parent is the ID, not slug)
        const parentCategory = localCategories.find(cat => cat.id === productCategory.parent);
        if (parentCategory && selectedCategories.includes(parentCategory.slug)) {
          console.log(`Hierarchical match found for ${product.title} (parent: ${parentCategory.name})`);
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`After category filter: ${filteredProducts.length} products`);
    console.log('Filtered products:', filteredProducts.map(p => ({ title: p.title, categorySlug: p.categorySlug })));
  }

  // Apply brand filter
  if (selectedBrands.length > 0) {
    filteredProducts = filteredProducts.filter(product => 
      selectedBrands.includes(product.brandSlug || '')
    );
  }

  // Apply rating filter
  if (selectedRatings.length > 0) {
    filteredProducts = filteredProducts.filter(product => {
      const productRating = Math.floor(product.rating || 0);
      return selectedRatings.some(rating => productRating >= rating);
    });
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle={currentCategory?.name || slug || 'Shop'} />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            {slug === 'deals' 
              ? 'Hot Deals' 
              : slug === undefined 
                ? 'Shop' 
                : currentCategory?.name || 'Category'
            }
          </h1>
          <p className="text-gray-600 dark:text-slate-300">
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
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-700 dark:to-slate-600 px-6 py-4 rounded-t-xl border-b border-gray-200 dark:border-slate-600">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Filters</h3>
                  </div>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
              
              {/* Category Filter */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Category</span>
                </h4>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {localCategories.length > 0 ? (
                    (() => {
                      // Group categories by parent
                      const topLevelCategories = localCategories.filter(cat => !cat.parent);
                      const subcategories = localCategories.filter(cat => cat.parent);
                      
                      return topLevelCategories.map((parentCategory) => (
                        <div key={parentCategory.id} className="space-y-1">
                          {/* Parent Category */}
                          <label className="flex items-center group cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(parentCategory.slug)}
                              onChange={() => handleCategoryToggle(parentCategory.slug)}
                              className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                            />
                            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                              {parentCategory.name}
                            </span>
                          </label>
                          
                          {/* Subcategories */}
                          {subcategories
                            .filter(subcat => subcat.parent === parentCategory.id)
                            .map((subcategory) => (
                              <label key={subcategory.id} className="flex items-center ml-6 group cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={selectedCategories.includes(subcategory.slug)}
                                  onChange={() => handleCategoryToggle(subcategory.slug)}
                                  className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                                />
                                <span className="ml-3 text-sm text-gray-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                  {subcategory.name}
                                </span>
                              </label>
                            ))}
                        </div>
                      ));
                    })()
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      Loading categories...
                    </div>
                  )}
                </div>
                {/* Debug info */}
                <div className="mt-2 text-xs text-gray-400 dark:text-slate-500">
                  Categories loaded: {localCategories.length} (Redux: {categories.length})
                </div>
              </div>
              
              {/* Price Range */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Price Range</span>
                </h4>
                <div className="space-y-4">
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
                    className="w-full text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Price Range</span>
                  </button>
                </div>
              </div>
              
              {/* Brand Filter */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Brand</span>
                </h4>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {brandsLoading ? (
                    <div className="text-sm text-gray-500 dark:text-slate-400 flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                      <span>Loading brands...</span>
                    </div>
                  ) : dynamicBrands.length > 0 ? (
                    dynamicBrands.map((brand) => (
                      <label key={brand.slug} className="flex items-center group cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.slug)}
                          onChange={() => handleBrandToggle(brand.slug)}
                          className="rounded border-gray-300 dark:border-slate-600 text-purple-600 focus:ring-purple-500 focus:ring-2 transition-all duration-200"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-slate-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">{brand.name}</span>
                      </label>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-slate-400">No brands available</div>
                  )}
                </div>
                {/* Debug info */}
                <div className="mt-3 text-xs text-gray-400 dark:text-slate-500 bg-white dark:bg-slate-600 rounded px-2 py-1">
                  Brands loaded: {dynamicBrands.length}
                </div>
              </div>
              
              {/* Rating Filter */}
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Rating</span>
                </h4>
                <div className="space-y-3">
                  {[4, 3, 2, 1].map((rating) => (
                    <label key={rating} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(rating)}
                        onChange={() => handleRatingToggle(rating)}
                        className="rounded border-gray-300 dark:border-slate-600 text-yellow-600 focus:ring-yellow-500 focus:ring-2 transition-all duration-200"
                      />
                      <div className="ml-3 flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-3 h-3 ${
                                i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
                              }`}
                            >
                              ★
                            </div>
                          ))}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors duration-200">
                          {rating}+ Stars
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Special Filters */}
              <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center space-x-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span>Special Offers</span>
                </h4>
                <div className="space-y-4">
                  {/* Discount Filter */}
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyDiscounted}
                      onChange={(e) => {
                        setOnlyDiscounted(e.target.checked);
                        const newSearchParams = new URLSearchParams(searchParams);
                        if (e.target.checked) {
                          newSearchParams.set('discounted', 'true');
                        } else {
                          newSearchParams.delete('discounted');
                        }
                        setSearchParams(newSearchParams);
                      }}
                      className="rounded border-gray-300 dark:border-slate-600 text-orange-600 focus:ring-orange-500 focus:ring-2 transition-all duration-200"
                    />
                    <div className="ml-3 flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">%</span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">Only discounted</span>
                    </div>
                  </label>

                  {/* New Arrivals Filter */}
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyNewArrivals}
                      onChange={(e) => {
                        setOnlyNewArrivals(e.target.checked);
                        const newSearchParams = new URLSearchParams(searchParams);
                        if (e.target.checked) {
                          newSearchParams.set('new-arrivals', 'true');
                        } else {
                          newSearchParams.delete('new-arrivals');
                        }
                        setSearchParams(newSearchParams);
                      }}
                      className="rounded border-gray-300 dark:border-slate-600 text-green-600 focus:ring-green-500 focus:ring-2 transition-all duration-200"
                    />
                    <div className="ml-3 flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">N</span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">New Arrivals</span>
                    </div>
                  </label>

                  {/* Top Selling Filter */}
                  <label className="flex items-center group cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyTopSelling}
                      onChange={(e) => {
                        setOnlyTopSelling(e.target.checked);
                        const newSearchParams = new URLSearchParams(searchParams);
                        if (e.target.checked) {
                          newSearchParams.set('top-selling', 'true');
                        } else {
                          newSearchParams.delete('top-selling');
                        }
                        setSearchParams(newSearchParams);
                      }}
                      className="rounded border-gray-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-2 transition-all duration-200"
                    />
                    <div className="ml-3 flex items-center space-x-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">🔥</span>
                      </div>
                      <span className="text-sm text-gray-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">Top Selling</span>
                    </div>
                  </label>
                </div>
              </div>
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {/* Sort and View Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  Showing {startIndex + 1}-{Math.min(startIndex + pageSize, sortedProducts.length)} of {sortedProducts.length} products
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 pr-8 text-sm text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="popularity">Sort by Popularity</option>
                    <option value="newest">Sort by Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-400 pointer-events-none" />
                </div>
                
                {/* View Toggle */}
                <div className="flex border border-gray-300 dark:border-slate-600 rounded-md">
                  <button
                    onClick={() => handleViewChange('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-300'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewChange('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-300'}`}
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
              <EmptyState
                icon={<SearchIcon className="w-12 h-12 text-blue-500 dark:text-blue-400" />}
                title="No products found"
                description="No products match your current filters. Try adjusting your search criteria or browse our full collection."
                suggestions={[
                  'Remove some filters to see more products',
                  'Try a different price range',
                  'Browse different categories',
                  'Check out our new arrivals'
                ]}
                actions={[
                  {
                    label: 'Clear All Filters',
                    href: '#',
                    variant: 'primary',
                    icon: <Filter className="w-4 h-4" />
                  },
                  {
                    label: 'Browse All Products',
                    href: '/shop',
                    variant: 'secondary',
                    icon: <ShoppingBag className="w-4 h-4" />
                  }
                ]}
                className="relative"
              />
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
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100"
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
                          : 'border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100'
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
                    className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100"
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