import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronDown, Grid, List, Star, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import DualRangeSlider from '../components/filters/DualRangeSlider';

// Mock services data - in a real app, this would come from an API
const servicesData = [
  {
    id: 1,
    title: 'Website Development',
    description: 'Professional website development using modern technologies like React, Node.js, and more.',
    price: 299,
    duration: '2-3 weeks',
    rating: 4.8,
    reviewCount: 124,
    image: '/api/placeholder/300/200',
    features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile Friendly'],
    category: 'Development'
  },
  {
    id: 2,
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile app development for iOS and Android.',
    price: 599,
    duration: '4-6 weeks',
    rating: 4.9,
    reviewCount: 89,
    image: '/api/placeholder/300/200',
    features: ['Cross-Platform', 'Native Performance', 'App Store Ready', 'Push Notifications'],
    category: 'Development'
  },
  {
    id: 3,
    title: 'E-commerce Solutions',
    description: 'Complete e-commerce platform development with payment integration and inventory management.',
    price: 799,
    duration: '6-8 weeks',
    rating: 4.7,
    reviewCount: 156,
    image: '/api/placeholder/300/200',
    features: ['Payment Gateway', 'Inventory Management', 'Order Tracking', 'Analytics Dashboard'],
    category: 'E-commerce'
  },
  {
    id: 4,
    title: 'Digital Marketing',
    description: 'Comprehensive digital marketing strategies including SEO, social media, and PPC campaigns.',
    price: 199,
    duration: 'Ongoing',
    rating: 4.6,
    reviewCount: 203,
    image: '/api/placeholder/300/200',
    features: ['SEO Optimization', 'Social Media', 'PPC Campaigns', 'Analytics Reports'],
    category: 'Marketing'
  },
  {
    id: 5,
    title: 'UI/UX Design',
    description: 'Beautiful and intuitive user interface and user experience design for web and mobile.',
    price: 399,
    duration: '3-4 weeks',
    rating: 4.9,
    reviewCount: 98,
    image: '/api/placeholder/300/200',
    features: ['User Research', 'Wireframing', 'Prototyping', 'Design System'],
    category: 'Design'
  },
  {
    id: 6,
    title: 'Cloud Migration',
    description: 'Seamless migration of your applications and data to cloud platforms like AWS, Azure, or GCP.',
    price: 899,
    duration: '4-8 weeks',
    rating: 4.8,
    reviewCount: 67,
    image: '/api/placeholder/300/200',
    features: ['Zero Downtime', 'Security Assessment', 'Cost Optimization', '24/7 Support'],
    category: 'Infrastructure'
  },
  {
    id: 7,
    title: 'Data Analytics',
    description: 'Advanced data analytics and business intelligence solutions to drive informed decisions.',
    price: 499,
    duration: '2-4 weeks',
    rating: 4.7,
    reviewCount: 145,
    image: '/api/placeholder/300/200',
    features: ['Data Visualization', 'Predictive Analytics', 'Custom Dashboards', 'Real-time Reports'],
    category: 'Analytics'
  },
  {
    id: 8,
    title: 'Technical Consulting',
    description: 'Expert technical consultation to help you make informed technology decisions.',
    price: 149,
    duration: '1-2 days',
    rating: 4.8,
    reviewCount: 178,
    image: '/api/placeholder/300/200',
    features: ['Technology Audit', 'Architecture Review', 'Best Practices', 'Implementation Plan'],
    category: 'Consulting'
  }
];

const categories = ['All', 'Development', 'E-commerce', 'Marketing', 'Design', 'Infrastructure', 'Analytics', 'Consulting'];

const Services: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity');
  const [viewMode, setViewMode] = useState(searchParams.get('view') || 'grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([100, 1000]);

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

  // Filter services by category and price range
  let filteredServices = selectedCategory === 'All' 
    ? servicesData 
    : servicesData.filter(service => service.category === selectedCategory);
  
  // Apply price range filter
  filteredServices = filteredServices.filter(service => 
    service.price >= priceRange[0] && service.price <= priceRange[1]
  );

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
              <div className="w-full h-48 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Placeholder size="md">
                  <div className="text-gray-400 dark:text-gray-500">Service Image</div>
                </Placeholder>
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
                    ${service.price}
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
        <div className="h-48 bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
          <Placeholder size="md">
            <div className="text-gray-400 dark:text-gray-500">Service Image</div>
          </Placeholder>
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
              ${service.price}
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
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Our Services
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Professional technology services to help your business grow and succeed
          </p>
        </div>
        
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
                  formatValue={(val) => `$${val}`}
                />
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Duration</h4>
                <div className="space-y-2">
                  {['1-2 days', '1-2 weeks', '2-4 weeks', '1-2 months', 'Ongoing'].map((duration) => (
                    <label key={duration} className="flex items-center">
                      <input
                        type="checkbox"
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
      </div>
    </div>
  );
};

export default Services;
