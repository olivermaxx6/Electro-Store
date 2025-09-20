import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronDown, Grid, List, Star, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import DualRangeSlider from '../components/filters/DualRangeSlider';
import TitleUpdater from '../components/common/TitleUpdater';
import { getServices, getServiceCategories, getServiceReviews, calculateServiceStats, incrementServiceView, Service, ServiceCategory } from '../../lib/servicesApi';
import { formatPrice } from '../lib/format';
import { useStoreSettings } from '../hooks/useStoreSettings';

// Transform API service data to match the component's expected format
const transformServiceData = (apiService: Service, reviewsStats?: { averageRating: number; reviewCount: number }) => ({
  id: apiService.id,
  title: apiService.name,
  description: apiService.description,
  price: parseFloat(apiService.price.toString()),
  duration: apiService.availability || 'Contact for details',
  rating: reviewsStats?.averageRating || parseFloat(apiService.rating.toString()),
  reviewCount: reviewsStats?.reviewCount || apiService.review_count,
  viewCount: apiService.view_count || 0,
  image: apiService.images?.[0]?.image || null,
  features: apiService.key_features || [],
  category: apiService.category?.name || 'Uncategorized'
});

const Services: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity');
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 1000]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  
  // Dynamic data state
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Store settings for currency
  const { settings } = useStoreSettings();
  
  // Debug logging
  console.log('Services page - settings:', settings);
  console.log('Services page - currency:', settings?.currency);

  // Fetch services and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [servicesResponse, categoriesResponse] = await Promise.all([
          getServices(),
          getServiceCategories()
        ]);
        
        // Transform services data with review statistics
        const transformedServices = await Promise.all(
          servicesResponse.map(async (service) => {
            try {
              const reviews = await getServiceReviews(service.id.toString());
              const stats = calculateServiceStats(reviews);
              return transformServiceData(service, stats);
            } catch (error) {
              console.error(`Failed to fetch reviews for service ${service.id}:`, error);
              return transformServiceData(service);
            }
          })
        );
        setServicesData(transformedServices);
        
        // Build categories list
        const categoryNames = categoriesResponse.map((cat: ServiceCategory) => cat.name);
        setCategories(['All', ...categoryNames]);
        
        console.log('Fetched services:', servicesResponse);
        console.log('Transformed services:', transformedServices);
        console.log('Fetched categories:', categoryNames);
        
      } catch (err) {
        console.error('Failed to fetch services data:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add a refresh function that can be called manually
  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [servicesResponse, categoriesResponse] = await Promise.all([
        getServices(),
        getServiceCategories()
      ]);
      
      // Transform services data with review statistics
      const transformedServices = await Promise.all(
        servicesResponse.map(async (service) => {
          try {
            const reviews = await getServiceReviews(service.id.toString());
            const stats = calculateServiceStats(reviews);
            return transformServiceData(service, stats);
          } catch (error) {
            console.error(`Failed to fetch reviews for service ${service.id}:`, error);
            return transformServiceData(service);
          }
        })
      );
      setServicesData(transformedServices);
      
      // Build categories list
      const categoryNames = categoriesResponse.map((cat: ServiceCategory) => cat.name);
      setCategories(['All', ...categoryNames]);
      
      console.log('Refreshed categories:', categoryNames);
      
    } catch (err) {
      console.error('Failed to refresh services data:', err);
      setError('Failed to refresh services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', newSort);
    setSearchParams(newSearchParams);
  };

  const handleViewChange = (newView: string) => {
    setViewMode(newView);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('view', newView);
    setSearchParams(newSearchParams);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newSearchParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newSearchParams.delete('category');
    } else {
      newSearchParams.set('category', category);
    }
    setSearchParams(newSearchParams);
  };

  const handleDurationChange = (duration: string) => {
    setSelectedDurations(prev => 
      prev.includes(duration) 
        ? prev.filter(d => d !== duration)
        : [...prev, duration]
    );
  };

  // Filter services by category, price range, and duration
  let filteredServices = selectedCategory === 'All' 
    ? servicesData 
    : servicesData.filter(service => service.category === selectedCategory);
  
  // Apply price range filter
  filteredServices = filteredServices.filter(service => 
    service.price >= priceRange[0] && service.price <= priceRange[1]
  );
  
  // Apply duration filter
  if (selectedDurations.length > 0) {
    filteredServices = filteredServices.filter(service => {
      const serviceDuration = service.duration.toLowerCase();
      return selectedDurations.some(duration => 
        serviceDuration.includes(duration.toLowerCase()) || 
        (duration === 'ongoing' && serviceDuration.includes('ongoing'))
      );
    });
  }

  // Sort services based on current sort option
  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      case 'popularity':
      default:
        return b.reviewCount - a.reviewCount;
    }
  });

  const ServiceCard: React.FC<{ service: typeof servicesData[0]; viewMode: string }> = ({ service, viewMode }) => {
    if (viewMode === 'list') {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-64 flex-shrink-0">
              <div className="w-full h-48 bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${service.image ? 'hidden' : ''}`}>
                  <Placeholder size="md">
                    <div className="text-gray-400 dark:text-gray-500">Service Image</div>
                  </Placeholder>
                </div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {service.rating} ({service.reviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        👁️ {service.viewCount} views
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {service.description}
                  </p>
                </div>
                
                <div className="lg:text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {formatPrice(service.price, (settings?.currency as any) || 'USD')}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4">
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      {feature}
                    </div>
                  ))}
                </div>
                
                <Link 
                  to={`/service/${service.id}`}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  onClick={async () => {
                    try {
                      await incrementServiceView(service.id);
                    } catch (error) {
                      console.error('Failed to increment service view:', error);
                    }
                  }}
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Grid view
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 bg-gray-200 dark:bg-slate-700 overflow-hidden">
          {service.image ? (
            <img 
              src={service.image} 
              alt={service.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-full h-full flex items-center justify-center ${service.image ? 'hidden' : ''}`}>
            <Placeholder size="md">
              <div className="text-gray-400 dark:text-gray-500">Service Image</div>
            </Placeholder>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
              {service.category}
            </span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {service.rating}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                👁️ {service.viewCount}
              </span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {service.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {service.description}
          </p>
          
          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Clock className="w-4 h-4" />
            {service.duration}
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatPrice(service.price, (settings?.currency as any) || 'USD')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {service.reviewCount} reviews
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-4">
            {service.features.slice(0, 2).map((feature, index) => (
              <div key={index} className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="w-3 h-3" />
                {feature}
              </div>
            ))}
            {service.features.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{service.features.length - 2} more
              </div>
            )}
          </div>
          
          <Link 
            to={`/service/${service.id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={async () => {
              try {
                await incrementServiceView(service.id);
              } catch (error) {
                console.error('Failed to increment service view:', error);
              }
            }}
          >
            Learn More
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle="Services" />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Our Services
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Professional technology services to help your business grow and succeed
              </p>
            </div>
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading services...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-8">
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
        )}

        {/* Main Content - only show when not loading and no error */}
        {!loading && !error && (
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Price Range</h4>
                <DualRangeSlider
                  min={100}
                  max={1000}
                  step={50}
                  value={priceRange}
                  onChange={setPriceRange}
                  formatValue={(val) => formatPrice(val, (settings?.currency as any) || 'USD')}
                />
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Duration</h4>
                <div className="space-y-2">
                  {['1-2 days', '1-2 weeks', '2-4 weeks', '1-2 months', 'Ongoing'].map((duration) => (
                    <label key={duration} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedDurations.includes(duration)}
                        onChange={() => handleDurationChange(duration)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{duration}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Services Grid */}
          <div className="flex-1">
            {/* Sort and View Controls */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {sortedServices.length} services
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  >
                    <option value="popularity">Sort by Popularity</option>
                    <option value="newest">Sort by Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Sort by Rating</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                {/* View Toggle */}
                <div className="flex border border-gray-300 dark:border-slate-600 rounded-md">
                  <button
                    onClick={() => handleViewChange('grid')}
                    className={`p-2 ${
                      viewMode === 'grid' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewChange('list')}
                    className={`p-2 ${
                      viewMode === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Services Grid */}
            {sortedServices.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {sortedServices.map((service) => (
                  <ServiceCard key={service.id} service={service} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Placeholder size="lg" className="mx-auto mb-4">
                  <div className="text-gray-400 dark:text-gray-500">No services found</div>
                </Placeholder>
                <p className="text-gray-600 dark:text-gray-300">No services match your current filters.</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Services;
