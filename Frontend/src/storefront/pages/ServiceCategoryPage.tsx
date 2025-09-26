import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp, Star, Clock, Users } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import TitleUpdater from '../components/common/TitleUpdater';
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
    image: apiService.images?.[0]?.image || null,
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
  viewMode?: 'grid' | 'list';
}> = ({ service, onServiceClick, viewMode = 'grid' }) => {
  const handleServiceClick = async () => {
    try {
      await incrementServiceView(service.id.toString());
      onServiceClick(service);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  // Grid view layout (original)
  if (viewMode === 'grid') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer">
        <Link 
          to={`/service/${service.id}`}
          onClick={handleServiceClick}
          className="block"
        >
          {/* Service Image */}
          <div className="relative w-full h-48 overflow-hidden">
            {service.image ? (
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/80 font-medium">{service.title}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Service Info */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {service.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {service.description}
            </p>
            
            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium text-gray-900 dark:text-white ml-1">
                  {service.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({service.reviewCount} reviews)
              </span>
            </div>
            
            {/* Price and Duration */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                Starting from ${service.price.toFixed(2)}
              </div>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4 mr-1" />
                {service.duration}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  // List view layout (new)
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer">
      <Link 
        to={`/service/${service.id}`}
        onClick={handleServiceClick}
        className="block"
      >
        <div className="flex flex-col md:flex-row">
          {/* Left side - Service Image */}
          <div className="relative w-full md:w-64 h-48 overflow-hidden flex-shrink-0 order-first">
            {service.image ? (
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-lg text-white/80 font-medium">{service.title}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Right side - Service Info */}
          <div className="flex-1 p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {service.title}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 md:line-clamp-3 text-sm md:text-base">
              {service.description}
            </p>
            
            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current" />
                <span className="text-sm md:text-base font-medium text-gray-900 dark:text-white ml-1">
                  {service.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                ({service.reviewCount} reviews)
              </span>
            </div>
            
            {/* Starting Price */}
            <div className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">
              Starting from ${service.price.toFixed(2)}
            </div>
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
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2">
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
    <div className="space-y-2">
      {priceRanges.map((range) => (
        <label key={range.label} className="flex items-center">
          <input
            type="checkbox"
            checked={selectedRanges.includes(range.label)}
            onChange={() => onRangeChange(range.label)}
            className="rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {range.label}
          </span>
        </label>
      ))}
    </div>
  );
};

// Service Category Page Component
const ServiceCategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || categoryName;
  
  // State
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('name');
  
  // Filter section states
  const [priceFilterOpen, setPriceFilterOpen] = useState(true);
  const [ratingFilterOpen, setRatingFilterOpen] = useState(true);
  const [sortFilterOpen, setSortFilterOpen] = useState(false);

  // Price ranges
  const priceRanges = [
    { label: 'Under $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $200', min: 100, max: 200 },
    { label: '$200 - $500', min: 200, max: 500 },
    { label: 'Over $500', min: 500, max: null }
  ];

  // Rating options
  const ratingOptions = [
    { label: '4+ Stars', value: '4' },
    { label: '3+ Stars', value: '3' },
    { label: '2+ Stars', value: '2' },
    { label: '1+ Stars', value: '1' }
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
        
        const services = servicesResponse.results || servicesResponse;
        const categoriesRaw = categoriesResponse.results || categoriesResponse;
        
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

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = servicesData.filter(service => {
      // Filter by category
      const matchesCategory = !categoryParam || 
        service.parentCategory?.toLowerCase() === categoryParam.toLowerCase() ||
        service.category?.toLowerCase() === categoryParam.toLowerCase();
      
      if (!matchesCategory) return false;
      
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
  const currentCategory = categories.find(cat => 
    cat.name.toLowerCase() === categoryParam?.toLowerCase()
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
        <div className="lg:hidden mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {selectedPriceRanges.length + selectedRatings.length + (sortBy !== 'name' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 flex-shrink-0`}>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Filters
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
                <div className="space-y-2">
                  {ratingOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(option.value)}
                        onChange={() => handleRatingChange(option.value)}
                        className="rounded border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
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
                <div className="space-y-2">
                  {sortOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="radio"
                        name="sort"
                        checked={sortBy === option.value}
                        onChange={() => setSortBy(option.value)}
                        className="border-gray-300 dark:border-slate-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
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
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Services Grid/List */}
            {filteredAndSortedServices.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredAndSortedServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onServiceClick={handleServiceClick}
                    viewMode={viewMode}
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
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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
