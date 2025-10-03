import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { setProducts, setCategories, setBrands, selectProducts, selectCategories } from '../store/productsSlice';
import { productRepo, categoryRepo, brandRepo } from '../lib/repo';
import { useStore } from '../contexts/StoreContext';
import { useWebsiteContent } from '../hooks/useWebsiteContent';
import { useGlobalLoading } from '../hooks/useGlobalLoading';
// import PromoTile from '../components/hero/PromoTile';
import HotDealBanner from '../components/promo/HotDealBanner';
import TitleUpdater from '../components/common/TitleUpdater';
// @ts-ignore
import { getServiceCategories, getServices, ServiceCategory } from '../../lib/servicesApi';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const categories = useSelector(selectCategories);
  const { storeSettings } = useStore();
  const { content: websiteContent } = useWebsiteContent();
  const { executeWithLoading } = useGlobalLoading();
  const [, setDynamicCategories] = useState<any[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([]);
  const [serviceCategoriesLoading, setServiceCategoriesLoading] = useState(true);
  const bannerRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Ensure banners stay visible after animation
  useEffect(() => {
    const timeouts: number[] = [];
    
    bannerRefs.current.forEach((ref, index) => {
      if (ref) {
        const delay = (index + 1) * 100; // Match the animation delay
        const timeout = setTimeout(() => {
          ref.classList.add('animation-complete');
        }, delay + 600); // Wait for animation to complete (600ms)
        timeouts.push(timeout);
      }
    });
    
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

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
      .category-card {
        flex-shrink: 0;
        min-width: 280px;
        max-width: 280px;
      }
      .category-card img {
        max-width: 100%;
        height: auto;
        object-fit: cover;
        display: block;
      }
      .category-card-container {
        flex-shrink: 0;
        width: 280px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Helper function to get gradient colors and icons for service categories
  const getServiceCategoryStyle = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600', 
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-pink-500 to-rose-600',
      'from-cyan-500 to-blue-600'
    ];

    const icons = [
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    ];

    return {
      gradient: gradients[index % gradients.length],
      icon: icons[index % icons.length]
    };
  };

  // Helper function to get gradient colors and icons for product categories
  const getProductCategoryStyle = (index: number) => {
    const gradients = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600', 
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
      'from-pink-500 to-rose-600',
      'from-cyan-500 to-blue-600'
    ];

    const icons = [
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    ];

    return {
      gradient: gradients[index % gradients.length],
      icon: icons[index % icons.length]
    };
  };

  // Fetch service categories and services
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setServiceCategoriesLoading(true);
        const [categoriesResponse, servicesResponse] = await Promise.all([
          getServiceCategories(),
          getServices()
        ]);
        
        // Extract results from paginated response
        const categoriesArray = Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse.results || [];
        const services = Array.isArray(servicesResponse) ? servicesResponse : servicesResponse.results || [];
        
        // Filter only parent categories (parent is null)
        const parentCategories = categoriesArray.filter((category: ServiceCategory) => !category.parent);
        
        // Filter out parent categories that have no services
        const categoriesWithServices = parentCategories.filter((category: ServiceCategory) => {
          // Check if any service belongs to this category or its subcategories
          return services.some((service: any) => {
            const serviceCategory = service.category;
            if (!serviceCategory) return false;
            
            // Check if service belongs directly to this parent category
            if (serviceCategory.id === category.id) return true;
            
            // Check if service belongs to a subcategory of this parent category
            if (serviceCategory.parent === category.id) return true;
            
            return false;
          });
        });
        
        setServiceCategories(categoriesWithServices);
      } catch (error) {
        console.error('Failed to fetch service data:', error);
        setServiceCategories([]);
      } finally {
        setServiceCategoriesLoading(false);
      }
    };

    fetchServiceData();
  }, []);
  
  useEffect(() => {
    // Only load data if products and categories haven't been loaded yet
    if (products.length > 0 && categories.length > 0) {
      return;
    }

    const loadData = async () => {
      const [productsData, categoriesData, brandsData] = await Promise.all([
        productRepo.getAll(),
        categoryRepo.getAll(),
        brandRepo.getAll(),
      ]);
      
      console.log('Loaded categories from API:', categoriesData);
      dispatch(setProducts(productsData));
      dispatch(setCategories(categoriesData));
      dispatch(setBrands(brandsData));
      setDynamicCategories(categoriesData);
    };

    executeWithLoading(loadData, {
      message: 'Loading...',
    });
  }, [dispatch, products.length, categories.length]);
  
  // Get parent categories (top-level categories)
  // Debug: Log category structure to understand the data format
  if (categories.length > 0) {
    console.log('Sample category to analyze:', categories[0]);
    console.log('All categories with parent info:', categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      parent: cat.parent,
      parentId: cat.parentId
    })));
  }
  
  // Filter for parent categories - comprehensive approach
  const parentCategories = categories.filter(cat => {
    // Debug each category
    console.log(`Checking category: ${cat.name}`, {
      id: cat.id,
      parent: cat.parent,
      parentId: cat.parentId,
      parent_id: cat.parent_id, // sometimes it's snake_case
      isParent: cat.isParent,
      level: cat.level,
      depth: cat.depth
    });
    
    // Method 1: Check if parent field is null/undefined/0
    const isParentMethod1 = cat.parent === null || cat.parent === undefined || cat.parent === 0;
    
    // Method 2: Check if parentId field is null/undefined/0
    const isParentMethod2 = cat.parentId === null || cat.parentId === undefined || cat.parentId === 0;
    
    // Method 3: Check if parent_id field is null/undefined/0 (snake_case)
    const isParentMethod3 = cat.parent_id === null || cat.parent_id === undefined || cat.parent_id === 0;
    
    // Method 4: Check if isParent field is true
    const isParentMethod4 = cat.isParent === true;
    
    // Method 5: Check if level/depth is 0 or 1 (top level)
    const isParentMethod5 = cat.level === 0 || cat.level === 1 || cat.depth === 0 || cat.depth === 1;
    
    const isParent = isParentMethod1 || isParentMethod2 || isParentMethod3 || isParentMethod4 || isParentMethod5;
    
    if (isParent) {
      console.log(`✅ Found parent category: ${cat.name} (parent: ${cat.parent}, parentId: ${cat.parentId})`);
    } else {
      console.log(`❌ Subcategory: ${cat.name} (parent: ${cat.parent}, parentId: ${cat.parentId})`);
    }
    
    return isParent;
  });
  
  // Fallback: If no categories in Redux, try to fetch them directly
  useEffect(() => {
    if (categories.length === 0) {
      const fetchCategoriesDirectly = async () => {
        try {
          console.log('Fetching categories directly from API...');
          
          // Try to fetch only parent categories first
          try {
            const topCategoriesResponse = await fetch('http://127.0.0.1:8001/api/public/categories/?top=true');
            if (topCategoriesResponse.ok) {
              const topCategoriesData = await topCategoriesResponse.json();
              const topCategories = topCategoriesData.results || topCategoriesData;
              console.log('✅ Loaded top categories directly:', topCategories.length);
              console.log('Top categories:', topCategories);
              if (topCategories.length > 0) {
                dispatch(setCategories(topCategories));
                return; // Exit early if we got top categories
              }
            }
          } catch (error) {
            console.log('Top categories API failed, trying full categories API...');
          }
          
          // Fallback to fetching all categories
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
              break;
            }
          }
          
          console.log('Directly loaded all categories:', allCategories.length);
          console.log('Sample categories:', allCategories.slice(0, 3));
          if (allCategories.length > 0) {
            console.log('First category structure:', allCategories[0]);
          }
          dispatch(setCategories(allCategories));
        } catch (error) {
          console.error('Failed to fetch categories directly:', error);
        }
      };
      
      fetchCategoriesDirectly();
    }
  }, [categories.length, dispatch]);
  
  // Debug logging
  console.log('Total products loaded:', products.length);
  console.log('Total categories loaded:', categories.length);
  console.log('Categories data:', categories);
  console.log('Parent categories:', parentCategories);
  
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <TitleUpdater pageTitle="Home" />

      {/* Hero Section - Welcome Message */}
      <section className="py-16 relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="container relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to <span className="text-red-600 dark:text-blue-400">{storeSettings?.store_name || 'Store'}</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              {websiteContent?.home_hero_subtitle || "Discover the latest in technology with our premium selection of electronics, gadgets, and accessories."}
            </p>
          </div>




          {/* this is the promo sections */}
          
          {/* Commented out promo sections - New Arrivals, Best Deals, Premium Brands */}
          {/* 
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {contentLoading ? (
              <>
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="w-full h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="w-full h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="w-full h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse"></div>
                </div>
              </>
            ) : (
              <>
                <div 
                  ref={el => bannerRefs.current[0] = el}
                  className="animate-slide-up" 
                  style={{ animationDelay: '0.1s' }}
                >
                  <PromoTile
                    title={websiteContent?.banner1_text || "New Arrivals"}
                    subtitle="Discover the latest tech innovations"
                    ctaText="Shop Now"
                    ctaLink={websiteContent?.banner1_link || "/products?category=new"}
                    image={websiteContent?.banner1_image || null}
                  />
                </div>
                <div 
                  ref={el => bannerRefs.current[1] = el}
                  className="animate-slide-up" 
                  style={{ animationDelay: '0.2s' }}
                >
                  <PromoTile
                    title={websiteContent?.banner2_text || "Best Deals"}
                    subtitle="Save up to 50% on selected items"
                    ctaText="View Deals"
                    ctaLink={websiteContent?.banner2_link || "/products?category=deals"}
                    image={websiteContent?.banner2_image || null}
                  />
                </div>
                <div 
                  ref={el => bannerRefs.current[2] = el}
                  className="animate-slide-up" 
                  style={{ animationDelay: '0.3s' }}
                >
                  <PromoTile
                    title={websiteContent?.banner3_text || "Premium Brands"}
                    subtitle="Shop from top electronics brands"
                    ctaText="Explore"
                    ctaLink={websiteContent?.banner3_link || "/brands"}
                    image={websiteContent?.banner3_image || null}
                  />
                </div>
              </>
            )}
          </div>
          */}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              <span className="text-red-600 dark:text-blue-400">Services</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              {websiteContent?.home_services_description || "We provide comprehensive services to meet all your technology needs with expert support and quality assurance."}
            </p>
          </div>
          
          {/* Horizontal Scroll Services */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 sm:gap-8 min-w-max px-4">
              {serviceCategoriesLoading ? (
                // Loading placeholder - show 3 placeholder cards
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={`loading-${index}`} className="flex-shrink-0 w-64 sm:w-72">
                    <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg overflow-hidden">
                      <div className="h-48 bg-gray-200 dark:bg-slate-600 animate-pulse flex items-center justify-center">
                        <div className="w-16 h-16 bg-gray-300 dark:bg-slate-500 rounded-full"></div>
                      </div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-200 dark:bg-slate-600 rounded animate-pulse mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-600 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : serviceCategories.length > 0 ? (
                // Dynamic service categories from admin panel
                serviceCategories.map((category, index) => {
                  const style = getServiceCategoryStyle(index);
                  return (
                    <div key={category.id} className="flex-shrink-0 w-64 sm:w-72">
                      <Link to={`/services/${category.name.toLowerCase().replace(/\s+/g, '-')}?category=${encodeURIComponent(category.name)}`}>
                        <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer">
                          <div className={`h-48 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {style.icon}
                            </svg>
                          </div>
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{category.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {category.description || `Browse our ${category.name} services`}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })
              ) : (
                // Fallback to default services if no categories are available
                <div className="flex-shrink-0 w-64 sm:w-72">
                  <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Our Services</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Comprehensive services to meet all your technology needs</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Product Categories Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              <span className="text-red-600 dark:text-blue-400">PRODUCT CATEGORIES</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              {websiteContent?.home_categories_description || "Explore our wide range of product categories to find exactly what you need"}
            </p>
          </div>
          
          {/* Horizontal Scroll of Product Categories */}
          {parentCategories.length > 0 ? (
            <div className="relative w-full">
              <div className="overflow-x-auto overflow-y-hidden scrollbar-hide w-full" style={{ scrollBehavior: 'smooth' }}>
                <div className="flex gap-6 pb-4" style={{ width: 'max-content', minWidth: '100%' }}>
                  {parentCategories.map((category, index) => {
                    const style = getProductCategoryStyle(index);
                    return (
                      <div key={category.id} className="flex-shrink-0 category-card-container">
                        <Link to={`/allsubcategories?category=${category.id}&name=${encodeURIComponent(category.name)}`}>
                          <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group category-card">
                            <div className={`h-48 bg-gradient-to-br ${style.gradient} flex items-center justify-center`}>
                              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {style.icon}
                              </svg>
                            </div>
                            <div className="p-6">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                {category.name}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Browse our {category.name.toLowerCase()} products
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No product categories available yet.
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Categories will appear here when products are added to the system.
              </p>
            </div>
          )}
          
          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/categories"
              className="btn-primary inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 text-sm sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                View All Categories
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
            </Link>
          </div>
        </div>
      </section>
      
      
      {/* Hot Deal Banner */}
      <HotDealBanner />
      
      {/* Newsletter Section */}
      <section className="py-16 bg-red-600 dark:bg-blue-800">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-lg mb-8 opacity-90">
              Subscribe to our newsletter and get the latest deals and product updates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="bg-white text-red-600 dark:text-blue-800 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
            
            {/* Social Icons */}
            <div className="flex justify-center space-x-4 mt-8">
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;