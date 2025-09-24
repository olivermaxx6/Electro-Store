import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { setProducts, setCategories, setBrands, selectProducts } from '../store/productsSlice';
import { productRepo, categoryRepo, brandRepo } from '../lib/repo';
import { useStore } from '../contexts/StoreContext';
import { useWebsiteContent } from '../hooks/useWebsiteContent';
import { useGlobalLoading } from '../hooks/useGlobalLoading';
import PromoTile from '../components/hero/PromoTile';
import ProductCard from '../components/products/ProductCard';
import HotDealBanner from '../components/promo/HotDealBanner';
import TitleUpdater from '../components/common/TitleUpdater';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const { storeSettings } = useStore();
  const { content: websiteContent, loading: contentLoading } = useWebsiteContent();
  const { executeWithLoading } = useGlobalLoading();
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
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
  
  useEffect(() => {
    // Only load data if products haven't been loaded yet
    if (products.length > 0) {
      return;
    }

    const loadData = async () => {
      const [productsData, categoriesData, brandsData] = await Promise.all([
        productRepo.getAll(),
        categoryRepo.getAll(),
        brandRepo.getAll(),
      ]);
      
      dispatch(setProducts(productsData));
      dispatch(setCategories(categoriesData));
      dispatch(setBrands(brandsData));
      setDynamicCategories(categoriesData);
    };

    executeWithLoading(loadData, {
      message: 'Loading...',
    });
  }, [dispatch, products.length]);
  
  // Get new products (NEW PRODUCTS section)
  const newProducts = products.filter(p => p.isNew).slice(0, 8);
  
  // Get top selling products
  const topSellingProducts = products.filter(p => p.is_top_selling).slice(0, 8);
  
  // Debug logging
  console.log('Total products loaded:', products.length);
  console.log('Products with is_top_selling flag:', products.filter(p => p.is_top_selling).length);
  console.log('Top selling products:', topSellingProducts);
  
  
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
              Discover the latest in technology with our premium selection of electronics, gadgets, and accessories.
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
              We provide comprehensive services to meet all your technology needs with expert support and quality assurance.
            </p>
          </div>
          
          {/* Horizontal Scroll Services */}
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 sm:gap-8 min-w-max px-4">
              {/* Service 1 */}
              <div className="flex-shrink-0 w-64 sm:w-72">
                <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Technical Support</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Expert assistance for all your technical needs</p>
                  </div>
                </div>
              </div>

              {/* Service 2 */}
              <div className="flex-shrink-0 w-64 sm:w-72">
                <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Product Installation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Professional setup and installation services</p>
                  </div>
                </div>
              </div>

              {/* Service 3 */}
              <div className="flex-shrink-0 w-64 sm:w-72">
                <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Warranty Service</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Comprehensive warranty coverage and repairs</p>
                  </div>
                </div>
              </div>

              {/* Service 4 */}
              <div className="flex-shrink-0 w-64 sm:w-72">
                <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Fast Delivery</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Quick and reliable shipping to your doorstep</p>
                  </div>
                </div>
              </div>

              {/* Service 5 */}
              <div className="flex-shrink-0 w-64 sm:w-72">
                <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Custom Solutions</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Tailored technology solutions for your business</p>
                  </div>
                </div>
              </div>

              {/* Service 6 */}
              <div className="flex-shrink-0 w-64 sm:w-72">
                <div className="bg-white dark:bg-slate-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Consultation</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Expert advice to help you choose the right products</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* New Products Section */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              <span className="text-red-600 dark:text-blue-400">NEW PRODUCTS</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Stay ahead with the latest technology trends and innovations
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {newProducts.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-slide-up" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/shop?new-arrivals=true"
              className="btn-primary inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 text-sm sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                View All New Arrivals
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
      
      {/* Top Selling Products Section */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-900">
        <div className="container">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              <span className="text-red-600 dark:text-blue-400">TOP SELLING</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Discover our most popular products that customers love
            </p>
          </div>
          
          {topSellingProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {topSellingProducts.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-slide-up" 
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8 sm:mt-12">
                <Link
                  to="/shop?top-selling=true"
                  className="btn-primary inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 text-sm sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2 sm:gap-3">
                    View All Top Selling
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
            </>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                No top selling products available yet.
              </div>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Products will appear here when marked as "Top Selling" in the admin panel.
              </p>
            </div>
          )}
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