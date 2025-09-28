import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Star, Clock, Shield, Award, Users, CheckCircle, Zap, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import TitleUpdater from '../components/common/TitleUpdater';
import PhoneDialog from '../components/common/PhoneDialog';
// @ts-ignore
import { getServices, getServiceCategories, incrementServiceView, Service, ServiceCategory } from '../../lib/servicesApi';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useWebsiteContent } from '../hooks/useWebsiteContent';

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

// Enhanced normalizeCategoryData function to handle the actual API response format
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

// Subcategory Card Component
const SubcategoryCard: React.FC<{ 
  subcategory: ServiceCategory; 
  services: any[]; 
  onServiceClick: (service: any) => void;
}> = ({ subcategory, services, onServiceClick }) => {
  const handleServiceClick = async (service: any) => {
    try {
      await incrementServiceView(service.id.toString());
      onServiceClick(service);
    } catch (error) {
      console.error('Failed to increment view count:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer flex-shrink-0 min-w-[300px] max-w-[300px] subcategory-card transform hover:-translate-y-1 mx-2">
      <Link 
        to={`/services/${(subcategory.parent_name?.toLowerCase() || 'services').replace(/\s+/g, '-')}?category=${encodeURIComponent(subcategory.parent_name || subcategory.name)}`} 
        onClick={() => handleServiceClick(services[0])}
        className="block h-full flex flex-col"
      >
        {/* Service Image - 300x300 */}
        <div className="relative w-full h-[300px] overflow-hidden">
          {subcategory.image ? (
            <img
              src={subcategory.image}
              alt={subcategory.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ width: '300px', height: '300px' }}
            />
          ) : services[0]?.image ? (
            <img
              src={services[0].image}
              alt={services[0].title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              style={{ width: '300px', height: '300px' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-lg text-white/80 font-medium">{subcategory.name}</span>
              </div>
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
          
          {/* Service count badge */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-900 dark:text-white">
            {services.length} service{services.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Subcategory Info */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg">
            {subcategory.name}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
            {subcategory.description}
          </p>
          
          {/* Features preview */}
          {services[0]?.features && services[0].features.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {services[0].features.slice(0, 2).map((feature: string, index: number) => (
                  <span key={index} className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
                    {feature}
                  </span>
                ))}
                {services[0].features.length > 2 && (
                  <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                    +{services[0].features.length - 2} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {services[0]?.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {services[0].rating}
                  </span>
                </div>
              )}
              {services[0]?.reviewCount && services[0].reviewCount > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({services[0].reviewCount} reviews)
                </span>
              )}
            </div>
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium group-hover:gap-2 transition-all duration-300">
              <span>View All</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

// Horizontal Scroll Component for Subcategories
const HorizontalScrollContainer: React.FC<{
  subcategories: ServiceCategory[];
  servicesBySubcategory: { [key: string]: any[] };
  onServiceClick: (service: any) => void;
}> = ({ subcategories, servicesBySubcategory, onServiceClick }) => {
  return (
    <div className="relative w-full">
      {/* Horizontal scrollable container */}
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide w-full" style={{ scrollBehavior: 'smooth' }}>
        <div className="flex gap-8 pb-4 px-4" style={{ width: 'max-content', minWidth: '100%' }}>
          {subcategories.map((subcategory) => (
            <div key={subcategory.id} className="flex-shrink-0 subcategory-card-container">
              <SubcategoryCard 
                subcategory={subcategory}
                services={servicesBySubcategory[subcategory.name] || []}
                onServiceClick={onServiceClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Category Section Component
const CategorySection: React.FC<{
  categoryName: string;
  categoryDescription: string;
  subcategories: ServiceCategory[];
  servicesBySubcategory: { [key: string]: any[] };
  onServiceClick: (service: any) => void;
}> = ({ categoryName, categoryDescription, subcategories, servicesBySubcategory, onServiceClick }) => {
  return (
    <div className="space-y-12">
      {/* Category Header - Enhanced */}
      <div className="text-left">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {categoryName}
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg max-w-4xl leading-relaxed">
          {categoryDescription}
        </p>
      </div>

      {/* Horizontal Scroll of Subcategories */}
      {subcategories.length > 0 ? (
        <HorizontalScrollContainer
          subcategories={subcategories}
          servicesBySubcategory={servicesBySubcategory}
          onServiceClick={onServiceClick}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No subcategories available for this category.
          </p>
        </div>
      )}

      {/* Show All Button - Enhanced */}
      <div className="flex justify-center">
        <Link
          to={`/services/${categoryName.toLowerCase().replace(/\s+/g, '-')}?category=${encodeURIComponent(categoryName)}`}
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Show All {categoryName} Services
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

const Services: React.FC = () => {
  // Dynamic data state
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  
  // Store settings for currency (currently unused but kept for future use)
  const { settings: _settings } = useStoreSettings();
  
  // Website content for services page description
  const { content: websiteContent } = useWebsiteContent();

  // Add CSS for horizontal scrolling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .horizontal-scroll-container {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
        width: 100%;
      }
      .horizontal-scroll-container::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .subcategory-card {
        flex-shrink: 0;
        min-width: 280px;
        max-width: 320px;
      }
      .subcategory-card img {
        max-width: 100%;
        height: auto;
        object-fit: cover;
        display: block;
      }
      .subcategory-card-container {
        flex-shrink: 0;
        width: 280px;
      }
      @media (max-width: 640px) {
        .subcategory-card {
          min-width: 260px;
          max-width: 280px;
        }
        .subcategory-card-container {
          width: 260px;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        
        // Extract results from paginated response
        const services = (servicesResponse as any).results || servicesResponse;
        const categoriesRaw = (categoriesResponse as any).results || categoriesResponse;
        
        // Debug logging
        console.log('Raw services response:', servicesResponse);
        console.log('Raw categories response:', categoriesResponse);
        console.log('Services with categories:', services.map((s: any) => ({ 
          name: s.name, 
          category: s.category,
          parentCategory: s.category?.parent_name 
        })));
        
        // Normalize and transform data
        const normalizedCategories = normalizeCategoryData(categoriesRaw);
        const transformedServices = services.map((service: Service) => transformServiceData(service));
        
        setServicesData(transformedServices);
        setCategories(normalizedCategories);
        
        console.log('Normalized categories:', normalizedCategories);
        console.log('Transformed services:', transformedServices);
        
      } catch (err) {
        console.error('Failed to fetch services data:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Improved Service Grouping Logic - Group services by parent categories first, then by subcategories
  const groupedServices = React.useMemo(() => {
    const groups: { [key: string]: { category: ServiceCategory, subcategories: { [key: string]: { subcategory: ServiceCategory, services: any[] } } } } = {};
    
    // Debug logging
    console.log('Grouping services - Total categories:', categories.length);
    console.log('Grouping services - Total services:', servicesData.length);
    console.log('Categories with parent info:', categories.map(cat => ({ 
      id: cat.id, 
      name: cat.name, 
      parent: cat.parent, 
      parent_name: cat.parent_name 
    })));
    
    // First, organize categories by parent
    const categoriesByParent: { [key: string]: ServiceCategory[] } = {};
    categories.forEach(cat => {
      const parentId = cat.parent ? cat.parent : 'uncategorized';
      if (!categoriesByParent[parentId]) {
        categoriesByParent[parentId] = [];
      }
      categoriesByParent[parentId].push(cat);
    });
    
    console.log('Categories by parent:', categoriesByParent);
    
    // Then group services under their categories
    servicesData.forEach(service => {
      const categoryId = service.categoryId;
      const category = categories.find(cat => cat.id === categoryId);
      
      console.log(`Processing service: ${service.title}, categoryId: ${categoryId}, found category:`, category);
      
      if (category) {
        const parentCategoryId = category.parent || 'uncategorized';
        const parentCategory = categories.find(cat => cat.id === parentCategoryId) || 
                              { 
                                id: 0, 
                                name: 'Uncategorized', 
                                description: 'Services without category',
                                slug: 'uncategorized',
                                ordering: 0,
                                is_active: true,
                                parent: null,
                                parent_name: null,
                                children: [],
                                depth: 0,
                                services_count: 0,
                                image: null,
                                created_at: new Date().toISOString()
                              } as unknown as ServiceCategory;
        
        console.log(`Service ${service.title} belongs to parent category: ${parentCategory.name}`);
        
        if (!groups[parentCategory.name]) {
          groups[parentCategory.name] = {
            category: parentCategory,
            subcategories: {}
          };
        }
        
        if (!groups[parentCategory.name].subcategories[category.name]) {
          groups[parentCategory.name].subcategories[category.name] = {
            subcategory: category,
            services: []
          };
        }
        
        groups[parentCategory.name].subcategories[category.name].services.push(service);
      } else {
        console.warn(`Service ${service.title} has no matching category for ID: ${categoryId}`);
      }
    });
    
    console.log('Final grouped services:', groups);
    return groups;
  }, [servicesData, categories]);

  // Get parent categories (categories without parent)
  const parentCategories = categories.filter(cat => !cat.parent);

  // Function to get category descriptions
  const getCategoryDescription = (categoryName: string): string => {
    const category = parentCategories.find(cat => cat.name === categoryName);
    return category?.description || `Browse our range of ${categoryName} services.`;
  };

  const handleServiceClick = () => {
    // Service click is handled in the SubcategoryCard component
  };

  // Dialog handlers
  const openPhoneDialog = () => {
    setIsPhoneDialogOpen(true);
  };

  const closePhoneDialog = () => {
    setIsPhoneDialogOpen(false);
  };

  // Filter out empty categories
  const nonEmptyCategories = Object.keys(groupedServices).filter(categoryName => {
    const categoryData = groupedServices[categoryName];
    return Object.keys(categoryData.subcategories).length > 0 || categoryName !== 'Uncategorized';
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle="All Services" />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 dark:from-blue-800 dark:via-blue-900 dark:to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative container mx-auto px-4 py-12 sm:py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              {(websiteContent as any)?.services_page_title ? (
                (() => {
                  const title = (websiteContent as any).services_page_title;
                  const words = title.split(' ');
                  const firstWords = words.slice(0, -1).join(' ');
                  const lastWord = words[words.length - 1];
                  
                  return (
                    <>
                      <span className="text-yellow-400">{firstWords}</span>
                      <span className="block text-white">{lastWord}</span>
                    </>
                  );
                })()
              ) : (
                <>
                  <span className="text-yellow-400">Professional</span>
                  <span className="block text-white">Electrical Services</span>
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-red-100 dark:text-blue-100 mb-6 sm:mb-8 leading-relaxed px-4">
              {websiteContent?.services_page_description || 
                "Expert electrical solutions for your home and business. From installations to repairs, we deliver quality service you can trust."}
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-yellow-500 hover:bg-yellow-400 text-red-900 dark:text-blue-900 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Get Free Quote
              </Link>
              <button
                onClick={openPhoneDialog}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-all duration-300 backdrop-blur-sm border border-white/20"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Spacer between hero and main content */}
      <div className="h-8 sm:h-12"></div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-12 sm:py-16">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-8" />
        
        {/* Features Section */}
        <div className="mb-12 sm:mb-16" id="features">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Certified Experts</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Licensed and insured professionals with years of experience</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">24/7 Emergency</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Round-the-clock emergency service for urgent electrical issues</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quality Guarantee</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">100% satisfaction guarantee on all our electrical services</p>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fast Service</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Quick response times and efficient electrical solutions</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingScreen message="Loading services..." />}

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
          <div className="space-y-20" id="services">
            {/* Services by Categories */}
            {nonEmptyCategories.length > 0 ? (
              <div className="space-y-24">
                {nonEmptyCategories.map((categoryName) => {
                  const categoryData = groupedServices[categoryName];
                  
                  // Get subcategories for this parent category
                  const subcategoriesForParent = Object.values(categoryData.subcategories).map(item => item.subcategory);
                  
                  // Create services by subcategory mapping
                  const servicesBySubcategory: { [key: string]: any[] } = {};
                  Object.values(categoryData.subcategories).forEach(item => {
                    servicesBySubcategory[item.subcategory.name] = item.services;
                  });
                  
                  return (
                    <CategorySection
                      key={categoryName}
                      categoryName={categoryName}
                      categoryDescription={getCategoryDescription(categoryName)}
                      subcategories={subcategoriesForParent}
                      servicesBySubcategory={servicesBySubcategory}
                      onServiceClick={handleServiceClick}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Services Available
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We're currently setting up our services. Please check back soon!
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Stage Section - Additional Content */}
        <div className="mt-20 sm:mt-24 mb-16 sm:mb-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 sm:p-10 lg:p-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Why Choose Our Electrical Services?
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
                We combine technical expertise with exceptional customer service to deliver electrical solutions that exceed your expectations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
              {/* Left Side - Benefits */}
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Licensed & Insured</h3>
                    <p className="text-gray-600 dark:text-gray-300">All our electricians are fully licensed, bonded, and insured for your peace of mind.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Expert Team</h3>
                    <p className="text-gray-600 dark:text-gray-300">Our experienced technicians stay updated with the latest electrical codes and technologies.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quality Workmanship</h3>
                    <p className="text-gray-600 dark:text-gray-300">We use only premium materials and follow industry best practices for every project.</p>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Contact Info */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Ready to Get Started?</h3>
                
                <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Call us for immediate assistance</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Email us for detailed quotes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Serving the entire region</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Link
                    to="/contact"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    Contact Us Now
                  </Link>
                  <Link
                    to="/services"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
                  >
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    Browse All Services
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom spacer */}
      <div className="h-8 sm:h-12"></div>
      
      {/* Phone Dialog */}
      <PhoneDialog
        isOpen={isPhoneDialogOpen}
        onClose={closePhoneDialog}
        type="call"
      />
    </div>
  );
};

export default Services;