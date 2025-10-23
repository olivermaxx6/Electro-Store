import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, Star } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import TitleUpdater from '../components/common/TitleUpdater';
import { formatPrice, currencyOptions } from '../../lib/format';
import { useStoreSettings } from '../hooks/useStoreSettings';
// @ts-ignore
import { getServices, getServiceCategories, incrementServiceView, Service, ServiceCategory } from '../../lib/servicesApi';

// Transform API service data to match the component's expected format
const transformServiceData = (apiService: Service) => {
  return {
    id: apiService.id,
    title: apiService.name,
    description: apiService.description,
    price: parseFloat(apiService.price.toString()),
    duration: apiService.availability || 'Contact for details',
    rating: parseFloat(apiService.rating.toString()),
    reviewCount: apiService.review_count,
    viewCount: apiService.view_count || 0,
    image: (apiService.images as any[])?.find(img => img.is_main)?.image || apiService.images?.[0]?.image || null,
    features: Array.isArray(apiService.key_features) ? apiService.key_features : [],
    category: apiService.category?.name || 'Uncategorized',
    categoryId: apiService.category?.id || null,
    parentCategory: apiService.category?.parent_name || null,
    parentCategoryId: apiService.category?.parent || null
  };
};

// Normalize category data
const normalizeCategoryData = (categories: any[]): ServiceCategory[] => {
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || `Browse our ${category.name} services`,
    ordering: category.ordering || category.position || 0,
    is_active: category.is_active !== false,
    parent: category.parent || null,
    parent_name: category.parent_name || category.parent?.name || null,
    children: category.children || category.subcategories || [],
    depth: category.depth || 0,
    services_count: category.services_count || 0,
    image: category.image,
    created_at: category.created_at
  }));
};

// Service Card Component
const ServiceCard: React.FC<{ 
  service: any; 
  onServiceClick: (service: any) => void;
  currency?: any;
}> = ({ service, onServiceClick, currency }) => {
  const handleServiceClick = async () => {
    try {
      await incrementServiceView(service.id.toString());
      onServiceClick(service);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  // YouTube-style thumbnail layout
  return (
    <div className="group cursor-pointer p-2">
      <Link 
        to={`/service/${service.id}`}
        onClick={handleServiceClick}
        className="block"
      >
        {/* YouTube-Style Thumbnail */}
        <div className="relative w-full aspect-video bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden">
          {service.image ? (
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // If image fails to load, show the YouTube-style fallback
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
                      <div class="text-center">
                        <div class="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span class="text-sm text-white font-medium">${service.title}</span>
                      </div>
                    </div>
                  `;
                }
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-slate-600 dark:to-slate-700 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm text-white font-medium">{service.title}</span>
              </div>
            </div>
          )}
          
          {/* Service-Style Price Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatPrice(service.price, currency)}
          </div>
          
          {/* Service-Style Action Button Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Service-Style Info */}
        <div className="mt-4 px-1">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-red-600 dark:group-hover:text-blue-400 transition-colors leading-tight mb-2">
            {service.title}
          </h3>
          
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
            <div className="flex items-center">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="ml-1">{service.rating.toFixed(1)}</span>
            </div>
            <span>•</span>
            <span>{service.reviewCount} reviews</span>
            <span>•</span>
            <span>{service.viewCount} views</span>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            {service.duration}
          </div>
        </div>
      </Link>
    </div>
  );

};

// Filter Component
const FilterSection: React.FC<{
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200 dark:border-slate-700 pb-4 mb-4">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className="flex items-center justify-between w-full text-left font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-3 touch-manipulation bg-gray-50 dark:bg-slate-700/50 rounded-lg px-3"
        type="button"
      >
        <span className="text-base lg:text-sm">{title}</span>
        <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <ChevronDown className="w-5 h-5 lg:w-4 lg:h-4" />
        </div>
      </button>
      {isOpen && (
        <div className="mt-3 space-y-3 lg:space-y-2 bg-white dark:bg-slate-800 rounded-lg p-3">
          {children}
        </div>
      )}
    </div>
  );
};

// Price Range Filter Component
const PriceRangeFilter: React.FC<{
  priceRanges: { label: string; min: number; max: number | null }[];
  selectedRanges: string[];
  onRangeChange: (range: string) => void;
}> = ({ priceRanges, selectedRanges, onRangeChange }) => {
  return (
    <div className="space-y-3 lg:space-y-2">
      {priceRanges.map((range) => (
        <label key={range.label} className="flex items-center py-2 lg:py-1 touch-manipulation">
          <input
            type="checkbox"
            checked={selectedRanges.includes(range.label)}
            onChange={() => onRangeChange(range.label)}
            className="w-5 h-5 lg:w-4 lg:h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 touch-manipulation"
          />
          <span className="ml-3 lg:ml-2 text-base lg:text-sm text-gray-700 dark:text-gray-300">
            {range.label}
          </span>
        </label>
      ))}
    </div>
  );
};

// Service Category Page Component
const ServiceCategoryPage: React.FC = () => {
  const { categoryName, id } = useParams<{ categoryName?: string; id?: string }>();
  const [searchParams] = useSearchParams();
  
  // Determine if we're using ID-based routing (subcategory) or name-based routing
  const isSubcategoryRoute = !!id;
  const categoryParam = isSubcategoryRoute ? id : (searchParams.get('category') || categoryName);
  
  // Store settings for currency
  const { settings } = useStoreSettings();
  
  // Helper function to get currency object from string
  const getCurrencyObject = (currencyCode: string) => {
    return currencyOptions.find((curr: any) => curr.code === currencyCode) || currencyOptions[0];
  };
  
  // State
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');
  
  // Filter section states
  const [priceFilterOpen, setPriceFilterOpen] = useState(true);
  const [ratingFilterOpen, setRatingFilterOpen] = useState(true);
  const [sortFilterOpen, setSortFilterOpen] = useState(false);
  
  // Ref for filter button
  const filterButtonRef = useRef<HTMLDivElement>(null);

  // Price ranges with dynamic currency
  const currencySymbol = getCurrencyObject(settings?.currency || 'GBP').symbol;
  const priceRanges = [
    { label: `Under ${currencySymbol}50`, min: 0, max: 50 },
    { label: `${currencySymbol}50 - ${currencySymbol}100`, min: 50, max: 100 },
    { label: `${currencySymbol}100 - ${currencySymbol}200`, min: 100, max: 200 },
    { label: `${currencySymbol}200 - ${currencySymbol}500`, min: 200, max: 500 },
    { label: `Over ${currencySymbol}500`, min: 500, max: null }
  ];

  // Rating options with dynamic counts
  const getRatingFilterCount = (minRating: number) => {
    return servicesData.filter(service => 
      service.rating && service.rating >= minRating
    ).length;
  };

  const ratingOptions = [
    { label: '4+ Stars', value: '4', count: getRatingFilterCount(4) },
    { label: '3+ Stars', value: '3', count: getRatingFilterCount(3) },
    { label: '2+ Stars', value: '2', count: getRatingFilterCount(2) },
    { label: '1+ Stars', value: '1', count: getRatingFilterCount(1) }
  ];

  // Sort options
  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Price (Low to High)', value: 'price' },
    { label: 'Price (High to Low)', value: 'price-desc' },
    { label: 'Rating (High to Low)', value: 'rating' },
    { label: 'Most Reviews', value: 'reviews' }
  ];

  // Fetch services and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [servicesResponse, categoriesResponse] = await Promise.all([
          getServices(),
          getServiceCategories()
        ]);
        
        const services = Array.isArray(servicesResponse) ? servicesResponse : (servicesResponse.results || []);
        const categoriesRaw = Array.isArray(categoriesResponse) ? categoriesResponse : (categoriesResponse.results || []);
        
        const normalizedCategories = normalizeCategoryData(categoriesRaw);
        const transformedServices = services.map((service: Service) => transformServiceData(service));
        
        setServicesData(transformedServices);
        setCategories(normalizedCategories);
        
      } catch (err) {
        console.error('Failed to fetch services data:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  // Scroll to top when category changes
  useEffect(() => {
    if (categoryParam) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [categoryParam]);

  // Scroll to top when filters change
  useEffect(() => {
    if (selectedPriceRanges.length > 0 || selectedRatings.length > 0 || sortBy !== 'name') {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [selectedPriceRanges, selectedRatings, sortBy]);

  // Add CSS for YouTube-style thumbnails
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .aspect-video {
        aspect-ratio: 16 / 9;
      }
      
      @supports not (aspect-ratio: 16 / 9) {
        .aspect-video {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }
        
        .aspect-video > * {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add direct event listener to filter button to bypass any React event issues
  useEffect(() => {
    const filterButton = filterButtonRef.current;
    if (filterButton) {
      const handleClick = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        console.log('Direct event listener triggered, current showFilters:', showFilters);
        setShowFilters(!showFilters);
      };

      filterButton.addEventListener('click', handleClick, true);
      filterButton.addEventListener('touchstart', handleClick, true);
      filterButton.addEventListener('mousedown', handleClick, true);

      return () => {
        filterButton.removeEventListener('click', handleClick, true);
        filterButton.removeEventListener('touchstart', handleClick, true);
        filterButton.removeEventListener('mousedown', handleClick, true);
      };
    }
  }, [showFilters]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = servicesData.filter(service => {
      // Filter by category - handle both ID-based and name-based routing
      if (!categoryParam) return true;
      
      if (isSubcategoryRoute) {
        // ID-based routing: match by category ID
        const matchesCategory = service.categoryId === parseInt(categoryParam) || 
                               service.parentCategoryId === parseInt(categoryParam);
        if (!matchesCategory) return false;
      } else {
        // Name-based routing: match by category name
        const matchesCategory = 
          service.parentCategory?.toLowerCase() === categoryParam.toLowerCase() ||
          service.category?.toLowerCase() === categoryParam.toLowerCase() ||
          service.parentCategory?.toLowerCase().replace(/\s+/g, '-') === categoryName?.toLowerCase() ||
          service.category?.toLowerCase().replace(/\s+/g, '-') === categoryName?.toLowerCase() ||
          // Additional matching for slug format
          service.parentCategory?.toLowerCase() === categoryName?.toLowerCase().replace(/-/g, ' ') ||
          service.category?.toLowerCase() === categoryName?.toLowerCase().replace(/-/g, ' ');
        if (!matchesCategory) return false;
      }
      
      // Filter by price range
      if (selectedPriceRanges.length > 0) {
        const matchesPriceRange = selectedPriceRanges.some(rangeLabel => {
          const range = priceRanges.find(r => r.label === rangeLabel);
          if (!range) return false;
          
          if (range.max === null) {
            return service.price >= range.min;
          }
          return service.price >= range.min && service.price <= range.max;
        });
        
        if (!matchesPriceRange) return false;
      }
      
      // Filter by rating
      if (selectedRatings.length > 0) {
        const matchesRating = selectedRatings.some(ratingValue => {
          return service.rating >= parseFloat(ratingValue);
        });
        
        if (!matchesRating) return false;
      }
      
      return true;
    });
    
    // Sort services
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        case 'price':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [servicesData, categoryParam, selectedPriceRanges, selectedRatings, sortBy]);

  // Get category information
  // Find current category based on routing type
  const currentCategory = isSubcategoryRoute 
    ? categories.find(cat => cat.id === parseInt(categoryParam || '0'))
    : categories.find(cat => 
        cat.name.toLowerCase() === categoryParam?.toLowerCase() ||
        cat.name.toLowerCase().replace(/\s+/g, '-') === categoryName?.toLowerCase()
      );

  const handleServiceClick = () => {
    // Service click is handled in the ServiceCard component
  };

  const handlePriceRangeChange = (range: string) => {
    setSelectedPriceRanges(prev => 
      prev.includes(range) 
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const handleRatingChange = (rating: string) => {
    setSelectedRatings(prev => 
      prev.includes(rating) 
        ? prev.filter(r => r !== rating)
        : [...prev, rating]
    );
  };

  const clearAllFilters = () => {
    setSelectedPriceRanges([]);
    setSelectedRatings([]);
    setSortBy('name');
  };

  const hasActiveFilters = selectedPriceRanges.length > 0 || selectedRatings.length > 0 || sortBy !== 'name';

  if (loading) return <LoadingScreen message="Loading services..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error loading services
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle={`${currentCategory?.name || categoryParam} Services`} />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {currentCategory?.name || categoryParam}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl leading-relaxed">
            {currentCategory?.description || `Professional installation and setup of ${categoryParam} systems.`}
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-8" onClick={(e) => e.stopPropagation()}>
          {/* Filter Section Header */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Filter Services
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Refine your search by price, rating, and more
            </p>
          </div>
          
          <div
            ref={filterButtonRef}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
              console.log('Filter button clicked, current showFilters:', showFilters);
              setShowFilters(!showFilters);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl text-blue-900 dark:text-blue-100 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 touch-manipulation cursor-pointer shadow-sm hover:shadow-md"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setShowFilters(!showFilters);
              }
            }}
            style={{ pointerEvents: 'auto' }}
          >
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                  {selectedPriceRanges.length + selectedRatings.length + (sortBy !== 'name' ? 1 : 0)}
                </span>
              )}
            </div>
            <div className={`transform transition-transform duration-200 ${showFilters ? 'rotate-180' : 'rotate-0'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Visual Separator */}
        <div className="lg:hidden mb-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-slate-600 to-transparent"></div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-gradient-to-b from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl border-2 border-gray-200 dark:border-slate-700 p-4 lg:p-6 sticky top-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Filter Services
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Refine your search
                  </p>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-base lg:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors py-2 px-3 lg:py-1 lg:px-2 touch-manipulation bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Range Filter */}
              <FilterSection
                title="Price Range"
                isOpen={priceFilterOpen}
                onToggle={() => setPriceFilterOpen(!priceFilterOpen)}
              >
                <PriceRangeFilter
                  priceRanges={priceRanges}
                  selectedRanges={selectedPriceRanges}
                  onRangeChange={handlePriceRangeChange}
                />
              </FilterSection>

              {/* Rating Filter */}
              <FilterSection
                title="Rating"
                isOpen={ratingFilterOpen}
                onToggle={() => setRatingFilterOpen(!ratingFilterOpen)}
              >
                <div className="space-y-3 lg:space-y-2">
                  {ratingOptions.map((option) => (
                    <label key={option.value} className="flex items-center justify-between py-2 lg:py-1 touch-manipulation">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedRatings.includes(option.value)}
                          onChange={() => handleRatingChange(option.value)}
                          className="w-5 h-5 lg:w-4 lg:h-4 rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 touch-manipulation"
                        />
                        <span className="ml-3 lg:ml-2 text-base lg:text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-600 px-2 py-1 rounded-full">
                        {option.count}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Sort Filter */}
              <FilterSection
                title="Sort By"
                isOpen={sortFilterOpen}
                onToggle={() => setSortFilterOpen(!sortFilterOpen)}
              >
                <div className="space-y-3 lg:space-y-2">
                  {sortOptions.map((option) => (
                    <label key={option.value} className="flex items-center py-2 lg:py-1 touch-manipulation">
                      <input
                        type="radio"
                        name="sort"
                        checked={sortBy === option.value}
                        onChange={() => setSortBy(option.value)}
                        className="w-5 h-5 lg:w-4 lg:h-4 border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400 touch-manipulation"
                      />
                      <span className="ml-3 lg:ml-2 text-base lg:text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterSection>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">{filteredAndSortedServices.length}</span> services found
              </div>
            </div>

            {/* Services Grid */}
            {filteredAndSortedServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredAndSortedServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onServiceClick={handleServiceClick}
                    currency={getCurrencyObject(settings?.currency || 'GBP')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <Filter className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Services Found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Try adjusting your filters to see more results.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium touch-manipulation"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategoryPage;
