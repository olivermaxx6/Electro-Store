import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import TitleUpdater from '../components/common/TitleUpdater';
// @ts-ignore
import { getServices, getServiceCategories, incrementServiceView, Service, ServiceCategory } from '../../lib/servicesApi';
import { useStoreSettings } from '../hooks/useStoreSettings';

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
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer flex-shrink-0 min-w-[300px] max-w-[300px] subcategory-card">
      <Link 
        to={`/services/${encodeURIComponent(subcategory.parent_name?.toLowerCase() || 'services')}?category=${encodeURIComponent(subcategory.parent_name || subcategory.name)}`} 
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
        </div>
        
        {/* Subcategory Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-base">
            {subcategory.name}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
            {subcategory.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {services.length} service{services.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
              <span>View All</span>
              <ArrowRight className="w-4 h-4 ml-1" />
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
        <div className="flex gap-6 pb-4" style={{ width: 'max-content', minWidth: '100%' }}>
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
    <div className="space-y-6">
      {/* Category Header - Left-aligned */}
      <div className="text-left">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {categoryName}
        </h2>
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
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No subcategories available for this category.
          </p>
        </div>
      )}

      {/* Show All Button - Centered */}
      <div className="flex justify-center">
        <Link
          to={`/services/${encodeURIComponent(categoryName.toLowerCase())}?category=${encodeURIComponent(categoryName)}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
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
  
  // Store settings for currency (currently unused but kept for future use)
  const { settings: _settings } = useStoreSettings();

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
        min-width: 300px;
        max-width: 300px;
      }
      .subcategory-card img {
        max-width: 100%;
        height: auto;
        object-fit: cover;
        display: block;
      }
      .subcategory-card-container {
        flex-shrink: 0;
        width: 300px;
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
        const services = servicesResponse.results || servicesResponse;
        const categoriesRaw = categoriesResponse.results || categoriesResponse;
        
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
                              { id: 'uncategorized', name: 'Uncategorized', description: 'Services without category' };
        
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

  // Filter out empty categories
  const nonEmptyCategories = Object.keys(groupedServices).filter(categoryName => {
    const categoryData = groupedServices[categoryName];
    return Object.keys(categoryData.subcategories).length > 0 || categoryName !== 'Uncategorized';
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle="All Services" />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            All Services
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Explore our full range of services across electrical, lighting, security, and smart home solutions. 
            Each category is designed to help you find exactly what you need quickly and easily.
          </p>
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
          <div className="space-y-16">
            {/* Services by Categories */}
            {nonEmptyCategories.length > 0 ? (
              <div className="space-y-20">
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
      </div>
    </div>
  );
};

export default Services;