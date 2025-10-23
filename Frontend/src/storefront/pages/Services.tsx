import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, Shield, Award, Users, CheckCircle, Zap, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import TitleUpdater from '../components/common/TitleUpdater';
import PhoneDialog from '../components/common/PhoneDialog';
// @ts-ignore
import { getServices, getServiceCategories, getServiceCategoriesWithServices, incrementServiceView, Service, ServiceCategory } from '../../lib/servicesApi';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useWebsiteContent } from '../hooks/useWebsiteContent';

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

// YouTube-Style Subcategory Thumbnail Component
const SubcategoryThumbnail: React.FC<{ 
  subcategory: any; 
  onSubcategoryClick: (subcategory: any) => void;
}> = ({ subcategory, onSubcategoryClick }) => {
  const handleSubcategoryClick = () => {
    onSubcategoryClick(subcategory);
  };

  return (
    <div className="group cursor-pointer">
      <Link 
        to={`/services/subcategory/${subcategory.id}?name=${encodeURIComponent(subcategory.name)}`} 
        onClick={handleSubcategoryClick}
        className="block"
      >
        {/* YouTube-Style Thumbnail */}
        <div className="relative w-full aspect-video bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden">
          {subcategory.image ? (
            <img
              src={subcategory.image}
              alt={subcategory.name}
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
                        <span class="text-sm text-white font-medium">${subcategory.name}</span>
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
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-white font-medium">{subcategory.name}</span>
              </div>
            </div>
          )}
          
          {/* Service-Style Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {subcategory.services_count || 0} services
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
        <div className="mt-3">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-red-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
            {subcategory.name}
          </h3>
          
          <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {subcategory.services_count || 0} service{subcategory.services_count !== 1 ? 's' : ''}
          </div>
        </div>
      </Link>
    </div>
  );
};

// YouTube-Style Horizontal Scroll Container
const YouTubeScrollContainer: React.FC<{
  subcategories: any[];
  onSubcategoryClick: (subcategory: any) => void;
}> = ({ subcategories, onSubcategoryClick }) => {
  return (
    <div className="relative w-full">
      <div className="overflow-x-auto overflow-y-hidden scrollbar-hide mobile-scroll w-full" style={{ scrollBehavior: 'smooth' }}>
        <div className="flex gap-4" style={{ width: 'max-content', minWidth: '100%' }}>
          {subcategories.map((subcategory) => (
            <div key={subcategory.id} className="w-80 flex-shrink-0">
              <SubcategoryThumbnail 
                subcategory={subcategory}
                onSubcategoryClick={onSubcategoryClick}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// YouTube-Style Category Section Component
const CategorySection: React.FC<{
  categoryName: string;
  subcategories: any[];
  onSubcategoryClick: (subcategory: any) => void;
}> = ({ categoryName, subcategories, onSubcategoryClick }) => {
  return (
    <div className="space-y-6">
      {/* YouTube-Style Category Label */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-red-600 dark:bg-blue-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {categoryName}
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {subcategories.reduce((total, sub) => total + (sub.services_count || 0), 0)} services
        </div>
      </div>

      {/* YouTube-Style Horizontal Scroll */}
      {subcategories.length > 0 ? (
        <YouTubeScrollContainer
          subcategories={subcategories}
          onSubcategoryClick={onSubcategoryClick}
        />
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-800 rounded-xl">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No services available for this category.
          </p>
        </div>
      )}
    </div>
  );
};

const Services: React.FC = () => {
  // Dynamic data state
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
  
  // Store settings for currency (currently unused but kept for future use)
  const { settings: _settings } = useStoreSettings();
  
  // Website content for services page description
  const { content: websiteContent } = useWebsiteContent();

  // Add CSS for YouTube-style thumbnails and horizontal scroll
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
      
      .scrollbar-hide {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      
      /* Mobile touch scrolling */
      .mobile-scroll {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
        overscroll-behavior-x: contain;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .mobile-scroll::-webkit-scrollbar {
        display: none;
      }
      
      /* Ensure proper touch scrolling on mobile */
      @media (max-width: 768px) {
        .mobile-scroll {
          touch-action: pan-x;
          overflow-x: auto;
          overflow-y: hidden;
        }
      }
      
      /* Tablet specific fixes */
      @media (min-width: 769px) and (max-width: 1024px) {
        .mobile-scroll {
          touch-action: pan-x;
          overflow-x: auto;
          overflow-y: hidden;
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
        
        console.log('🚀 Starting to fetch service categories...');
        
        // Add cache busting to ensure fresh data
        const categoriesResponse = await getServiceCategories();
        
        console.log('📡 Raw API response:', categoriesResponse);
        
        // Extract results from paginated response
        const categoriesRaw = (categoriesResponse as any).results || categoriesResponse;
        
        console.log('📦 Extracted categories:', categoriesRaw);
        console.log('📊 Categories count:', categoriesRaw.length);
        
        // Debug logging
        console.log('Categories with hierarchy:', categoriesRaw.map((c: any) => ({ 
          id: c.id,
          name: c.name, 
          parent: c.parent,
          parent_name: c.parent_name,
          parentType: typeof c.parent,
          depth: c.depth
        })));
        
        // Normalize and transform data
        const normalizedCategories = normalizeCategoryData(categoriesRaw);
        
        console.log('✨ Normalized categories:', normalizedCategories.map(cat => ({
          id: cat.id,
          name: cat.name,
          parent: cat.parent,
          parentType: typeof cat.parent,
          depth: cat.depth
        })));
        
        setCategories(normalizedCategories);
        console.log('✅ Categories set successfully!');
        
      } catch (err) {
        console.error('❌ Failed to fetch services data:', err);
        console.error('Error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
        console.log('🏁 Loading finished');
      }
    };

    fetchData();
  }, []);

  // Refresh data when page becomes visible (handles image updates)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh data
        const fetchData = async () => {
          try {
            const categoriesResponse = await getServiceCategories();
            const categoriesRaw = (categoriesResponse as any).results || categoriesResponse;
            const normalizedCategories = normalizeCategoryData(categoriesRaw);
            setCategories(normalizedCategories);
          } catch (err) {
            console.error('Error refreshing categories data:', err);
          }
        };
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Category-Subcategory Grouping - Show ALL categories with proper hierarchy
  const groupedCategories = React.useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    
    console.log('🔍 Debugging groupedCategories:', {
      totalCategories: categories.length,
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        parent: cat.parent,
        parentType: typeof cat.parent,
        depth: cat.depth
      }))
    });
    
    // Group categories by their hierarchy level
    // Root categories have parent === null or parent === undefined
    const rootCategories = categories.filter(cat => cat.parent === null || cat.parent === undefined);
    const childCategories = categories.filter(cat => cat.parent !== null && cat.parent !== undefined);
    
    console.log('📊 Category Analysis:', {
      rootCategories: rootCategories.length,
      childCategories: childCategories.length,
      rootCategoryNames: rootCategories.map(cat => cat.name),
      childCategoryDetails: childCategories.map(cat => ({
        name: cat.name,
        parent: cat.parent,
        parentType: typeof cat.parent,
        depth: cat.depth
      }))
    });
    
    // For each root category, find its child categories
    rootCategories.forEach(rootCategory => {
      const rootName = rootCategory.name;
      
      // Find child categories that belong to this root
      // Parent is a number (ID) in the API response
      const childCats = childCategories.filter(child => {
        const matches = child.parent === rootCategory.id;
        
        if (matches) {
          console.log(`✅ Found child category: ${child.name} belongs to ${rootName}`);
        }
        
        return matches;
      });
      
      console.log(`🏗️ Building group for ${rootName}:`, {
        childCount: childCats.length,
        children: childCats.map(child => child.name)
      });
      
      // Add groups even if they don't have child categories (show all root categories)
      groups[rootName] = childCats;
    });
    
    console.log('🎯 Final groupedCategories:', groups);
    return groups;
  }, [categories]);

  const handleSubcategoryClick = (subcategory: any) => {
    // Subcategory click is handled in the SubcategoryCard component
    console.log('Subcategory clicked:', subcategory);
  };

  // Dialog handlers
  const openPhoneDialog = () => {
    setIsPhoneDialogOpen(true);
  };

  const closePhoneDialog = () => {
    setIsPhoneDialogOpen(false);
  };

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

        {/* Loading Screen */}
        {loading && <LoadingScreen />}

        {/* Main Content - YouTube-Style Layout */}
        {!loading && !error && (
          <div className="space-y-12" id="services">
            {/* YouTube-Style Categories */}
            {Object.keys(groupedCategories).length > 0 ? (
              <div className="space-y-12">
                {Object.entries(groupedCategories).map(([categoryName, subcategories]) => (
                  <CategorySection
                    key={categoryName}
                    categoryName={categoryName}
                    subcategories={subcategories}
                    onSubcategoryClick={handleSubcategoryClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Zap className="w-12 h-12 text-red-500 dark:text-blue-400" />
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