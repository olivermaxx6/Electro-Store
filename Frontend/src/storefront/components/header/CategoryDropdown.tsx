import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { ChevronRight, Sparkles, Zap, ArrowLeft } from 'lucide-react';
import { useDropdown } from '../../contexts/DropdownContext';
import { createPortal } from 'react-dom';

interface Category {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
}

interface CategoryDropdownProps {
  category: Category;
  isActive: boolean;
  className?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ 
  category, 
  isActive, 
  className 
}) => {
  // Add scrollbar hiding styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  const { activeDropdown, setActiveDropdown } = useDropdown();
  const dropdownId = `category-${category.id}`;
  const isOpen = activeDropdown === dropdownId;
  
  const [hoveredSubcategory, setHoveredSubcategory] = useState<number | null>(null);
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | null>(null);
  const [showHoverStyle, setShowHoverStyle] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 'auto' });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);

  // Calculate dropdown position with overflow handling
  const calculatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownMinWidth = 320; // Minimum width for dropdown
      const dropdownMaxWidth = 1200; // Maximum width for dropdown
      
      // Calculate available space on the right
      const availableSpaceRight = viewportWidth - rect.left;
      const availableSpaceLeft = rect.right;
      
      let left = rect.left + window.scrollX;
      let width = 'auto';
      
      // If there's not enough space on the right, adjust position and width
      if (availableSpaceRight < dropdownMinWidth) {
        // Try to fit by reducing width first
        if (availableSpaceRight >= 280) {
          width = `${Math.max(280, availableSpaceRight - 20)}px`;
        } else {
          // If still not enough space, position to the left of trigger
          left = Math.max(20, rect.right - dropdownMinWidth) + window.scrollX;
          width = `${Math.min(dropdownMaxWidth, availableSpaceLeft - 20)}px`;
        }
      } else {
        // Normal positioning with dynamic width based on content
        width = `${Math.min(dropdownMaxWidth, Math.max(dropdownMinWidth, availableSpaceRight - 20))}px`;
      }
      
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left,
        width
      });
    }
  };

  // Handle mouse enter/leave with delay to prevent flickering
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    calculatePosition();
    setActiveDropdown(dropdownId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
      setHoveredSubcategory(null);
      // Reset mobile view when leaving dropdown on desktop
      if (window.innerWidth >= 1024) {
        setShowSubcategories(false);
        setSelectedSubcategory(null);
        setShowHoverStyle(false);
      }
    }, 200);
  };

  // Mobile navigation handlers
  const handleMainCategoryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Show hover-style layout for main category (same as desktop hover)
    setShowHoverStyle(true);
  };

  const handleBackToParent = () => {
    setShowSubcategories(false);
    setSelectedSubcategory(null);
  };

  const handleBackToMain = () => {
    setShowHoverStyle(false);
    setShowSubcategories(false);
    setSelectedSubcategory(null);
  };


  // Clean up timeout on unmount and handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setHoveredSubcategory(null);
        setShowSubcategories(false);
        setSelectedSubcategory(null);
        setShowHoverStyle(false);
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, setActiveDropdown]);

  // Don't render dropdown if category has no children
  if (!category.children || category.children.length === 0) {
    return (
      <Link
        to={`/allsubcategories?category=${category.id}&name=${encodeURIComponent(category.name)}`}
        className={className}
      >
        <span className="relative z-10 flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
          {category.name}
        </span>
        
        {/* Enhanced Background Hover Effect - Light/Dark Mode Optimized */}
        <div className={clsx(
          'absolute inset-0 rounded-lg transition-all duration-500 ease-out',
          isActive
            ? 'bg-gradient-to-r from-white/35 to-white/25 dark:from-blue-400/35 dark:to-blue-400/25 shadow-xl backdrop-blur-sm border border-white/25 dark:border-blue-400/25'
            : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-white/25 group-hover:to-white/15 dark:group-hover:from-blue-400/25 dark:group-hover:to-blue-400/15 group-hover:shadow-lg group-hover:backdrop-blur-sm group-hover:border group-hover:border-white/15 dark:group-hover:border-blue-400/15'
        )} />
        
        {/* Active Indicator with Enhanced Animation */}
        {isActive && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-white via-white/95 to-white dark:from-blue-400 dark:via-blue-300 dark:to-blue-400 rounded-full shadow-lg animate-pulse" />
        )}
        
        {/* Enhanced Hover Glow Effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-white/20 via-white/10 to-white/20 dark:from-blue-400/20 dark:via-blue-300/10 dark:to-blue-400/20" />
        
        {/* Sparkle Effect on Hover */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Sparkles className="w-3 h-3 text-white/90 dark:text-blue-300/90 animate-pulse" />
        </div>
        
        {/* Subtle Border Glow */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/25 dark:border-blue-400/25" />
        
        {/* Energy Effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-blue-400/5 animate-pulse" />
        </div>
      </Link>
    );
  }

  return (
    <div 
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={triggerRef}
    >
      {/* Main Category Link */}
      <Link
        to={`/allsubcategories?category=${category.id}&name=${encodeURIComponent(category.name)}`}
        className={className}
      >
        <span className="relative z-10 flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
          {category.name}
          {category.children && category.children.length > 0 && (
            <ChevronRight className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          )}
        </span>
        
        {/* Enhanced Background Hover Effect - Light/Dark Mode Optimized */}
        <div className={clsx(
          'absolute inset-0 rounded-lg transition-all duration-500 ease-out',
          isActive
            ? 'bg-gradient-to-r from-white/35 to-white/25 dark:from-blue-400/35 dark:to-blue-400/25 shadow-xl backdrop-blur-sm border border-white/25 dark:border-blue-400/25'
            : 'bg-transparent group-hover:bg-gradient-to-r group-hover:from-white/25 group-hover:to-white/15 dark:group-hover:from-blue-400/25 dark:group-hover:to-blue-400/15 group-hover:shadow-lg group-hover:backdrop-blur-sm group-hover:border group-hover:border-white/15 dark:group-hover:border-blue-400/15'
        )} />
        
        {/* Active Indicator with Enhanced Animation */}
        {isActive && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-white via-white/95 to-white dark:from-blue-400 dark:via-blue-300 dark:to-blue-400 rounded-full shadow-lg animate-pulse" />
        )}
        
        {/* Enhanced Hover Glow Effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 bg-gradient-to-r from-white/20 via-white/10 to-white/20 dark:from-blue-400/20 dark:via-blue-300/10 dark:to-blue-400/20" />
        
        {/* Sparkle Effect on Hover */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Sparkles className="w-3 h-3 text-white/90 dark:text-blue-300/90 animate-pulse" />
        </div>
        
        {/* Subtle Border Glow */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-white/25 dark:border-blue-400/25" />
        
        {/* Energy Effect */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent dark:via-blue-400/5 animate-pulse" />
        </div>
      </Link>

      {/* Enhanced Dropdown Menu with Mobile Support - Portal */}
      {isOpen && createPortal(
        <div 
          className={clsx(
            'absolute bg-white dark:bg-slate-800 shadow-2xl border-t-2 border-red-600 dark:border-blue-600 transition-all duration-500 ease-out z-50 rounded-b-xl overflow-hidden',
            isOpen ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible -translate-y-4 scale-95'
          )}
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: dropdownPosition.width
          }}
          ref={dropdownRef}
        >
        {/* Enhanced Gradient Overlay for Visual Appeal */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-white/3 to-transparent dark:from-blue-400/8 dark:via-blue-300/3 dark:to-transparent pointer-events-none" />
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-30 dark:opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500/5 via-transparent to-blue-500/5 dark:from-blue-400/5 dark:via-transparent dark:to-red-500/5 animate-pulse" />
        </div>
        
        <div className="relative px-3 sm:px-8 py-3 sm:py-6">
          {/* Mobile Header with Back Button */}
          <div className="flex items-center justify-between mb-3 sm:mb-6 pb-2 sm:pb-4 border-b border-gray-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2">
              {/* Back Button - Only visible on mobile when in subcategory or hover-style view */}
              {(showSubcategories || showHoverStyle) && (
                <button
                  onClick={showSubcategories ? handleBackToParent : handleBackToMain}
                  className="lg:hidden flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Back to main menu</span>
                </button>
              )}
              {!showSubcategories && !showHoverStyle && (
                <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="relative">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-blue-400" />
                    <Zap className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 text-yellow-500 animate-pulse" />
                  </div>
              {category.name}
            </h3>
              )}
            </div>
            {!showSubcategories && !showHoverStyle && (
            <Link
              to={`/allsubcategories?category=${category.id}&name=${encodeURIComponent(category.name)}`}
                className="group flex items-center gap-2 text-xs sm:text-sm text-red-600 dark:text-blue-400 hover:text-red-700 dark:hover:text-blue-300 font-medium transition-all duration-300 hover:scale-105 px-2 sm:px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-blue-900/20"
            >
                View All
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            )}
          </div>

          {/* Mobile-First Layout */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto scrollbar-hide pb-4">
            {showSubcategories && selectedSubcategory ? (
              /* Mobile Subcategory View - Matching Image Layout */
              <div className="space-y-0">
                {/* Selected Category Header */}
                <div className="px-3 py-3 bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedSubcategory.name}
                  </h4>
                </div>
                
                {/* Subcategories List */}
                {selectedSubcategory.children?.map((grandchild, index) => (
                  <div key={grandchild.id}>
                    <Link
                      to={`/allsubcategories?category=${grandchild.id}&name=${encodeURIComponent(grandchild.name)}`}
                      className="flex items-center justify-between px-3 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      <span className="text-gray-900 dark:text-white font-medium">
                        {grandchild.name}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                    </Link>
                    {index < (selectedSubcategory.children?.length || 0) - 1 && (
                      <div className="border-b border-gray-100 dark:border-slate-700" />
                    )}
                  </div>
                ))}
              </div>
            ) : showHoverStyle ? (
              /* Mobile Hover-Style View - Grid Layout for Mobile */
              <div className="lg:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-1">
                  {category.children.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="group/subcategory space-y-3 p-4 rounded-lg hover:bg-gray-50/70 dark:hover:bg-slate-700/70 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-gray-200/50 dark:hover:border-slate-600/50"
                      onMouseEnter={() => setHoveredSubcategory(subcategory.id)}
                      onMouseLeave={() => setHoveredSubcategory(null)}
                    >
                      {/* Enhanced Subcategory Header */}
                      <Link
                        to={`/allsubcategories?category=${subcategory.id}&name=${encodeURIComponent(subcategory.name)}`}
                        className={clsx(
                          'block text-base font-semibold text-gray-900 dark:text-white transition-all duration-300 group-hover/subcategory:scale-105',
                          hoveredSubcategory === subcategory.id
                            ? 'text-red-600 dark:text-blue-400'
                            : 'hover:text-red-600 dark:hover:text-blue-400'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>{subcategory.name}</span>
                          <ChevronRight className={clsx(
                            'w-4 h-4 transition-all duration-300',
                            hoveredSubcategory === subcategory.id
                              ? 'opacity-100 translate-x-1'
                              : 'opacity-0 group-hover/subcategory:opacity-60 group-hover/subcategory:translate-x-1'
                          )} />
                        </div>
                      </Link>

                      {/* Vertical List of Grandchild Categories */}
                      <div className="ml-2">
                        {subcategory.children && subcategory.children.length > 0 && (
                          <div className="space-y-1">
                            {subcategory.children.map((grandchild) => (
                              <Link
                                key={grandchild.id}
                                to={`/allsubcategories?category=${grandchild.id}&name=${encodeURIComponent(grandchild.name)}`}
                                className="block text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 transition-all duration-200 py-1.5 px-3 rounded-md hover:bg-white/60 dark:hover:bg-slate-600/60 hover:shadow-sm group/grandchild hover:scale-105"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-500 rounded-full group-hover/grandchild:bg-red-600 dark:group-hover/grandchild:bg-blue-400 transition-all duration-200 group-hover/grandchild:scale-125" />
                                  <span>{grandchild.name}</span>
                                </div>
                              </Link>
                            ))}
                            
                            {/* Show count */}
                            <div className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center">
                              {subcategory.children.length} items
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Main Categories View - Mobile List */
              <div className="lg:hidden">
                {/* Mobile List View - Main Categories */}
                <div className="space-y-0">
                  {category.children.map((subcategory, index) => (
                    <div key={subcategory.id}>
                      <div
                        className="flex items-center justify-between px-3 py-3 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                        onClick={handleMainCategoryClick}
                      >
                        <span className="text-gray-900 dark:text-white font-medium">
                          {subcategory.name}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                      </div>
                      {index < (category.children?.length || 0) - 1 && (
                        <div className="border-b border-gray-100 dark:border-slate-700" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Desktop Grid View */}
            <div className="hidden lg:block">
              <div className="grid gap-6 pr-2 pb-4" style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`
              }}>
                {category.children.map((subcategory) => (
                  <div
                    key={subcategory.id}
                    className="group/subcategory space-y-3 p-4 rounded-lg hover:bg-gray-50/70 dark:hover:bg-slate-700/70 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-transparent hover:border-gray-200/50 dark:hover:border-slate-600/50"
                    onMouseEnter={() => setHoveredSubcategory(subcategory.id)}
                    onMouseLeave={() => setHoveredSubcategory(null)}
                  >
                    {/* Enhanced Subcategory Header */}
                    <Link
                      to={subcategory.children && subcategory.children.length > 0 
                        ? `/allsubcategories?category=${subcategory.id}&name=${encodeURIComponent(subcategory.name)}`
                        : `/category/${subcategory.slug}`
                      }
                      className={clsx(
                        'block text-base font-semibold text-gray-900 dark:text-white transition-all duration-300 group-hover/subcategory:scale-105',
                        hoveredSubcategory === subcategory.id 
                          ? 'text-red-600 dark:text-blue-400' 
                          : 'hover:text-red-600 dark:hover:text-blue-400'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span>{subcategory.name}</span>
                        <ChevronRight className={clsx(
                          'w-4 h-4 transition-all duration-300',
                          hoveredSubcategory === subcategory.id 
                            ? 'opacity-100 translate-x-1' 
                            : 'opacity-0 group-hover/subcategory:opacity-60 group-hover/subcategory:translate-x-1'
                        )} />
                      </div>
                    </Link>

                    {/* Vertical List of Grandchild Categories */}
                    <div className="ml-2">
                      {subcategory.children && subcategory.children.length > 0 && (
                        <div className="space-y-1">
                          {subcategory.children.map((grandchild) => (
                            <Link
                              key={grandchild.id}
                              to={`/category/${grandchild.slug}`}
                              className="block text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 transition-all duration-200 py-1.5 px-3 rounded-md hover:bg-white/60 dark:hover:bg-slate-600/60 hover:shadow-sm group/grandchild hover:scale-105"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-slate-500 rounded-full group-hover/grandchild:bg-red-600 dark:group-hover/grandchild:bg-blue-400 transition-all duration-200 group-hover/grandchild:scale-125" />
                                <span>{grandchild.name}</span>
                              </div>
                            </Link>
                          ))}
                          
                          {/* Show count */}
                          <div className="text-xs text-gray-500 dark:text-slate-400 mt-2 text-center">
                            {subcategory.children.length} items
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CategoryDropdown;