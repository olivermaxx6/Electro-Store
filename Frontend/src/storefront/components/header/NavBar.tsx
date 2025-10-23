import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { useCategoriesWithHierarchy } from '../../hooks/useCategories';
import CategoryDropdown from './CategoryDropdown';
import { DropdownProvider } from '../../contexts/DropdownContext';





/*NavBar (where categories are showing)*/

const NavBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { categories, loading: categoriesLoading } = useCategoriesWithHierarchy();

  
  // Create navigation items with dynamic categories
  const navItems: Array<{ label: string; href: string; hasDropdown: boolean }> = [
    { label: 'Home', href: '/', hasDropdown: false },
    { label: 'Services', href: '/services', hasDropdown: false },
    ...categories.map(category => ({
      label: category.name,
      href: `/allsubcategories?category=${category.id}&name=${encodeURIComponent(category.name)}`,
      // Show dropdown for any parent category that has children
      hasDropdown: Array.isArray(category.children) && category.children.length > 0
    }))
  ];
  
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };
  
  return (
    <DropdownProvider>
      <nav className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950 sticky top-0 z-50 shadow-lg backdrop-blur-sm border-b border-red-500/20 dark:border-blue-600/30">
        <div className="container mx-auto px-8 sm:px-12 lg:px-16 xl:px-20 relative">
          <div className="flex items-center justify-between">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
            {categoriesLoading ? (
              <div className="px-6 py-4 text-sm font-semibold text-red-100 dark:text-blue-200">
                Loading...
              </div>
            ) : (
              navItems.map((item) => {
                if (item.label === 'Home' || item.label === 'Services') {
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={clsx(
                        'relative py-4 text-sm font-semibold transition-all duration-300 ease-in-out group',
                        item.label === 'Services' ? 'px-8' : 'px-6',
                        isActive(item.href)
                          ? 'text-white'
                          : 'text-red-100 dark:text-blue-200 hover:text-white'
                      )}
                    >
                      <span className="relative z-10">{item.label}</span>
                      
                      {/* Background Hover Effect */}
                      <div className={clsx(
                        'absolute inset-0 rounded-lg transition-all duration-300 ease-in-out',
                        isActive(item.href)
                          ? 'bg-white/20 shadow-lg'
                          : 'bg-transparent group-hover:bg-white/10 group-hover:shadow-md'
                      )} />
                      
                      {/* Active Indicator */}
                      {isActive(item.href) && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-lg" />
                      )}
                      
                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/5 to-white/10" />
                    </Link>
                  );
                }

                const category = categories.find(cat => cat.name === item.label);
                if (!category) return null;

                if (item.hasDropdown && category.children && category.children.length > 0) {
                  return (
                    <CategoryDropdown
                      key={item.href}
                      category={category}
                      isActive={isActive(item.href)}
                      className={clsx(
                        'relative py-4 text-sm font-semibold transition-all duration-300 ease-in-out group',
                        item.label === 'Electrical & Lights' ? 'px-8' : 'px-6',
                        isActive(item.href)
                          ? 'text-white'
                          : 'text-red-100 dark:text-blue-200 hover:text-white'
                      )}
                    />
                  );
                }

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={clsx(
                      'relative py-4 text-sm font-semibold transition-all duration-300 ease-in-out group',
                      item.label === 'Electrical & Lights' ? 'px-8' : 'px-6',
                      isActive(item.href)
                        ? 'text-white'
                        : 'text-red-100 dark:text-blue-200 hover:text-white'
                    )}
                  >
                    <span className="relative z-10">{item.label}</span>
                    
                    {/* Background Hover Effect */}
                    <div className={clsx(
                      'absolute inset-0 rounded-lg transition-all duration-300 ease-in-out',
                      isActive(item.href)
                        ? 'bg-white/20 shadow-lg'
                        : 'bg-transparent group-hover:bg-white/10 group-hover:shadow-md'
                    )} />
                    
                    {/* Active Indicator */}
                    {isActive(item.href) && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full shadow-lg" />
                    )}
                    
                    {/* Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/5 to-white/10" />
                  </Link>
                );
              })
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 sm:p-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/20 shadow-sm mr-4"
            aria-label="Toggle mobile menu"
          >
            <div className="relative w-5 h-5 sm:w-6 sm:h-6">
              <div className={clsx(
                'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
                isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
              )}>
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className={clsx(
                'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
                isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
              )}>
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div className={clsx(
          'lg:hidden transition-all duration-500 ease-in-out overflow-hidden',
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="py-4 sm:py-6 space-y-1 sm:space-y-2 border-t border-white/20 bg-gradient-to-b from-red-600 via-red-700 to-red-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950">
            {categoriesLoading ? (
              <div className="py-2 sm:py-3 px-4 sm:px-6 text-sm sm:text-base font-semibold text-red-100 dark:text-blue-200">
                Loading...
              </div>
            ) : (
              navItems.map((item, index) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={clsx(
                    'block py-3 sm:py-4 px-4 sm:px-6 text-base sm:text-lg font-semibold transition-all duration-300 ease-in-out rounded-lg mx-2 group',
                    isActive(item.href)
                      ? 'text-white bg-white/20 shadow-lg'
                      : 'text-red-100 hover:text-white hover:bg-white/10 hover:shadow-md'
                  )}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: isMobileMenuOpen ? 'slideInDown 0.3s ease-out forwards' : 'none'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive(item.href) && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </nav>
    </DropdownProvider>
  );
};

export default NavBar;