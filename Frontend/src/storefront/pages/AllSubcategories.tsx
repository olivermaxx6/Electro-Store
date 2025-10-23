import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Home, ShoppingBag } from 'lucide-react';
import LoadingScreen from '../components/common/LoadingScreen';
import { useDropdown } from '../contexts/DropdownContext';
import { useAllCategories } from '../hooks/useCategories';

interface Category {
  id: number;
  name: string;
  slug: string;
  slogan?: string;
  parent: number | null;
  description?: string;
  image?: string;
}

interface GrandchildCategory {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  image?: string;
}

// Enhanced CategoryCard component with larger pictures
const CategoryCard: React.FC<{ 
  category: GrandchildCategory; 
  onClick: (category: GrandchildCategory) => void;
}> = ({ category, onClick }) => (
  <div
    className="flex-shrink-0 w-40 sm:w-44 md:w-48 lg:w-52 cursor-pointer group"
    onClick={() => onClick(category)}
    style={{ minWidth: '160px', maxWidth: '208px' }}
  >
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-200 group-hover:scale-105 group-hover:border-red-300 dark:group-hover:border-blue-500 h-full">
      <div className="aspect-square bg-gray-100 dark:bg-slate-700 relative overflow-hidden">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-white text-lg font-medium">
                {category.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white text-center line-clamp-2 group-hover:text-red-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {category.name}
        </h3>
      </div>
    </div>
  </div>
);

// CategorySection component for each subcategory with enhanced horizontal scrolling
const CategorySection: React.FC<{
  subcategory: Category;
  grandchildCategories: GrandchildCategory[];
  onCategoryClick: (category: GrandchildCategory) => void;
  onShopAllClick: (subcategory: Category) => void;
}> = ({ subcategory, grandchildCategories, onCategoryClick, onShopAllClick }) => {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll events
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      // Initial check
      handleScroll();
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, [grandchildCategories]);

  // Calculate visible items based on container width
  const getVisibleItemsCount = () => {
    if (typeof window === 'undefined') return 3;
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) return 1; // Mobile
    if (screenWidth < 1024) return 2; // Tablet
    if (screenWidth < 1280) return 3; // Desktop
    return 4; // Large desktop
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          {subcategory.name}
        </h2>
        {grandchildCategories.length > getVisibleItemsCount() && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {grandchildCategories.length} items
          </div>
        )}
      </div>
      
      {/* Compact horizontal scrollable list */}
      <div className="relative w-full overflow-hidden">
        {/* Scroll Left Button - Only show when needed */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-800 shadow-md rounded-full p-1.5 hover:bg-red-50 dark:hover:bg-blue-900/20 transition-all duration-200 border border-red-200 dark:border-blue-600"
          >
            <ChevronLeft className="w-4 h-4 text-red-600 dark:text-blue-400" />
          </button>
        )}
        
        {/* Scroll Right Button - Only show when needed */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-slate-800 shadow-md rounded-full p-1.5 hover:bg-red-50 dark:hover:bg-blue-900/20 transition-all duration-200 border border-red-200 dark:border-blue-600"
          >
            <ChevronRight className="w-4 h-4 text-red-600 dark:text-blue-400" />
          </button>
        )}
        
        {/* Horizontal scrollable container - no extra padding */}
        <div
          ref={scrollContainerRef}
          className="horizontal-scroll-container flex gap-3 pb-2"
          style={{ 
            maxWidth: '100%',
            width: '100%'
          }}
        >
          {grandchildCategories.map((grandchild) => (
            <CategoryCard
              key={grandchild.id}
              category={grandchild}
              onClick={onCategoryClick}
            />
          ))}
        </div>
      </div>

      {/* Shop all button */}
      <div className="mt-4">
        <button
          onClick={() => onShopAllClick(subcategory)}
          className="inline-flex items-center px-4 py-2 bg-red-600 dark:bg-blue-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          Shop all {subcategory.name}
        </button>
      </div>
    </div>
  );
};

const AllSubcategories: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activeDropdown } = useDropdown();
  const { categories, loading, error } = useAllCategories();

  // Add CSS to hide scrollbars and ensure proper container behavior
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .horizontal-scroll-container {
        overflow-x: auto;
        overflow-y: hidden;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;
        -ms-overflow-style: none;
        overscroll-behavior-x: contain;
      }
      .horizontal-scroll-container::-webkit-scrollbar {
        display: none;
      }
      
      /* Mobile and tablet specific fixes */
      @media (max-width: 1024px) {
        .horizontal-scroll-container {
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

  // Get category ID from URL params
  const categoryId = searchParams.get('category');
  const categoryName = searchParams.get('name');

  // Get the parent category
  const parentCategory = categories.find(cat => cat.id === parseInt(categoryId || '0'));

  // Debug logging
  useEffect(() => {
    if (categories.length > 0) {
      console.log('AllSubcategories: Loaded categories:', categories.length);
      console.log('AllSubcategories: Parent category:', parentCategory);
      console.log('AllSubcategories: Subcategories:', categories.filter(cat => cat.parent === parseInt(categoryId || '0')));
    }
  }, [categories, categoryId, parentCategory]);

  // Get all subcategories for this parent category
  const getSubcategories = () => {
    if (!categoryId) return [];
    return categories.filter(cat => cat.parent === parseInt(categoryId));
  };

  // Get grandchild categories for a specific subcategory
  const getGrandchildCategories = (subcategoryId: number): GrandchildCategory[] => {
    return categories.filter(cat => cat.parent === subcategoryId);
  };

  // Get description for the main category
  const getCategoryDescription = () => {
    // Use slogan from the API if available
    if (parentCategory?.slogan) {
      return parentCategory.slogan;
    }
    
    // Fallback to default description
    return `Explore our comprehensive range of ${categoryName || parentCategory?.name || 'products'}. Discover high-quality items carefully selected to meet your needs, featuring the latest innovations and timeless classics. Our extensive collection ensures you'll find exactly what you're looking for, backed by our commitment to quality and customer satisfaction.`;
  };

  // Event handlers
  const handleCategoryClick = (category: GrandchildCategory) => {
    // Check if this category has children (subcategories)
    const hasChildren = categories.some(cat => cat.parent === category.id);
    
    if (hasChildren) {
      // If it has children, show subcategories
      navigate(`/allsubcategories?category=${category.id}&name=${encodeURIComponent(category.name)}`);
    } else {
      // If it's a leaf category, show products using the Category page
      navigate(`/category/${category.slug}`);
    }
  };

  const handleShopAllClick = (subcategory: Category) => {
    // Check if this subcategory has children (grandchild categories)
    const hasChildren = categories.some(cat => cat.parent === subcategory.id);
    
    if (hasChildren) {
      // If it has children, show subcategories
      navigate(`/allsubcategories?category=${subcategory.id}&name=${encodeURIComponent(subcategory.name)}`);
    } else {
      // If it's a leaf category, show products using the Category page
      navigate(`/category/${subcategory.slug}`);
    }
  };

  const handleSubcategoryClick = (subcategory: Category) => {
    // Scroll to the subcategory section
    const element = document.getElementById(`subcategory-${subcategory.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const subcategories = getSubcategories();

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading categories..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No category selected
  if (!categoryId || !parentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No category selected</p>
          <button 
            onClick={() => navigate('/categories')}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        {!activeDropdown && (
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <button
                onClick={() => navigate('/')}
                className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </button>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 dark:text-white font-medium">
                {categoryName || parentCategory.name}
              </span>
            </nav>
          </div>
        )}

        {/* 1. Parent Category Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {categoryName || parentCategory.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {getCategoryDescription()}
          </p>
          {subcategories.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Browse {subcategories.length} subcategor{subcategories.length === 1 ? 'y' : 'ies'} below
            </div>
          )}
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col xl:flex-row gap-8">
          {/* 2. Left Sidebar - Subcategories with Grandchild Lists */}
          <div className="w-full xl:w-80 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 xl:sticky xl:top-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {parentCategory?.name} Subcategories
              </h2>
              <div className="space-y-4">
                {subcategories.map((subcategory) => {
                  const grandchildCategories = getGrandchildCategories(subcategory.id);
                  return (
                    <div key={subcategory.id} className="border-b border-gray-200 dark:border-slate-700 pb-4 last:border-b-0">
                      {/* Subcategory Header */}
                      <button
                        onClick={() => handleSubcategoryClick(subcategory)}
                        className="w-full text-left px-3 py-2 rounded-md transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-blue-400 font-medium"
                      >
                        {subcategory.name}
                      </button>
                      
                      {/* Grandchild Categories Vertical List */}
                      {grandchildCategories.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1">
                          {grandchildCategories.map((grandchild) => (
                            <button
                              key={grandchild.id}
                              onClick={() => handleCategoryClick(grandchild)}
                              className="w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-blue-400"
                            >
                              {grandchild.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Right/Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Loop through each subcategory */}
            {subcategories.map((subcategory) => {
              const grandchildCategories = getGrandchildCategories(subcategory.id);
              return (
                <div 
                  key={subcategory.id} 
                  id={`subcategory-${subcategory.id}`}
                  className="mb-8 w-full"
                >
                  <CategorySection
                    subcategory={subcategory}
                    grandchildCategories={grandchildCategories}
                    onCategoryClick={handleCategoryClick}
                    onShopAllClick={handleShopAllClick}
                  />
                </div>
              );
            })}

        {/* No subcategories message */}
        {subcategories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 dark:bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📂</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No subcategories found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              The category "{categoryName || parentCategory?.name}" doesn't have any subcategories yet.
            </p>
            <button 
              onClick={() => navigate('/categories')}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              Browse All Categories
            </button>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllSubcategories;
