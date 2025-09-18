import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { setProducts, setCategories, setBrands, selectProducts } from '../store/productsSlice';
import { productRepo, categoryRepo, brandRepo } from '../lib/repo';
import { useWebsiteContent } from '../hooks/useWebsiteContent';
import PromoTile from '../components/hero/PromoTile';
import ProductCard from '../components/products/ProductCard';
import HotDealBanner from '../components/promo/HotDealBanner';
import CompactList from '../components/lists/CompactList';

const Home: React.FC = () => {
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  const { content: websiteContent, loading: contentLoading, error: contentError } = useWebsiteContent();
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData, brandsData] = await Promise.all([
          productRepo.getAll(),
          categoryRepo.getAll(),
          brandRepo.getAll(),
        ]);
        
        dispatch(setProducts(productsData));
        dispatch(setCategories(categoriesData));
        dispatch(setBrands(brandsData));
        setDynamicCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, [dispatch]);
  
  // Get featured products
  const newProducts = products.filter(p => p.isNew).slice(0, 8);
  const topSelling = products.filter(p => p.ratingCount && p.ratingCount > 1000).slice(0, 4);
  
  
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">


      {/* Hero Section - Promo Tiles */}
      <section className="py-16 relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="container relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to <span className="text-red-600 dark:text-blue-400">Electro</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover the latest in technology with our premium selection of electronics, gadgets, and accessories.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contentLoading ? (
              // Loading state
              <>
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="bg-gray-200 dark:bg-slate-700 rounded-2xl p-8 h-64 animate-pulse"></div>
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="bg-gray-200 dark:bg-slate-700 rounded-2xl p-8 h-64 animate-pulse"></div>
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <div className="bg-gray-200 dark:bg-slate-700 rounded-2xl p-8 h-64 animate-pulse"></div>
                </div>
              </>
            ) : contentError ? (
              // Error state - show default banners
              <>
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <PromoTile
                    title="New Arrivals"
                    subtitle="Discover the latest tech innovations"
                    ctaText="Shop Now"
                    ctaLink={dynamicCategories.length > 0 ? `/category/${dynamicCategories[0].slug}` : "/categories"}
                  />
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <PromoTile
                    title="Best Deals"
                    subtitle="Save up to 50% on selected items"
                    ctaText="View Deals"
                    ctaLink="/deals"
                  />
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <PromoTile
                    title="Premium Brands"
                    subtitle="Shop from top electronics brands"
                    ctaText="Explore"
                    ctaLink={dynamicCategories.length > 1 ? `/category/${dynamicCategories[1].slug}` : "/categories"}
                  />
                </div>
              </>
            ) : (
              // Dynamic content from API
              <>
                <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <PromoTile
                    title={websiteContent?.banner1_text || "New Arrivals"}
                    subtitle="Discover the latest tech innovations"
                    ctaText="Shop Now"
                    ctaLink={websiteContent?.banner1_link || (dynamicCategories.length > 0 ? `/category/${dynamicCategories[0].slug}` : "/categories")}
                    image={websiteContent?.banner1_image}
                  />
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <PromoTile
                    title={websiteContent?.banner2_text || "Best Deals"}
                    subtitle="Save up to 50% on selected items"
                    ctaText="View Deals"
                    ctaLink={websiteContent?.banner2_link || "/deals"}
                    image={websiteContent?.banner2_image}
                  />
                </div>
                <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                  <PromoTile
                    title={websiteContent?.banner3_text || "Premium Brands"}
                    subtitle="Shop from top electronics brands"
                    ctaText="Explore"
                    ctaLink={websiteContent?.banner3_link || (dynamicCategories.length > 1 ? `/category/${dynamicCategories[1].slug}` : "/categories")}
                    image={websiteContent?.banner3_image}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      
      {/* New Products Section */}
      <section className="py-16 bg-gray-50 dark:bg-slate-800">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="text-red-600 dark:text-blue-400">NEW PRODUCTS</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Stay ahead with the latest technology trends and innovations
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
          
          <div className="text-center mt-12">
            <Link
              to={dynamicCategories.length > 0 ? `/category/${dynamicCategories[0].slug}` : "/categories"}
              className="btn-primary inline-flex items-center gap-3 px-10 py-5 text-lg font-semibold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                View All Products
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      
      {/* Top Selling Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="text-red-600 dark:text-blue-400">TOP SELLING</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Explore our most popular products loved by customers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Product Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {topSelling.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
            
            {/* Sidebar with Compact Lists */}
            <div className="lg:col-span-1 space-y-6">
              <CompactList
                title="TOP SELLING"
                products={topSelling.slice(0, 3)}
              />
              
              <CompactList
                title="RECENTLY VIEWED"
                products={products.slice(0, 3)}
              />
            </div>
          </div>
        </div>
      </section>
      
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