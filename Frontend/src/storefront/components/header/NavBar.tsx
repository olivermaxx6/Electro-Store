import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

const NavBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  // Static navigation items
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Services', href: '/services' },
    { label: 'Categories', href: '/categories' },
  ];
  
  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };
  
  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-blue-950 sticky top-0 z-40 shadow-xl backdrop-blur-sm border-b border-blue-500/20 dark:border-blue-600/30">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  'relative px-6 py-4 text-sm font-semibold transition-all duration-300 ease-in-out group',
                  isActive(item.href)
                    ? 'text-white'
                    : 'text-blue-100 dark:text-blue-200 hover:text-white'
                )}
              >
                <span className="relative z-10">{item.label}</span>
                
                {/* Background Hover Effect */}
                <div className={clsx(
                  'absolute inset-0 rounded-lg transition-all duration-300 ease-in-out',
                  isActive(item.href)
                    ? 'bg-white/20 dark:bg-blue-300/20 shadow-lg'
                    : 'bg-transparent group-hover:bg-white/10 dark:group-hover:bg-blue-300/10 group-hover:shadow-md'
                )} />
                
                {/* Active Indicator */}
                {isActive(item.href) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white dark:bg-blue-300 rounded-full shadow-lg" />
                )}
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-white/5 to-white/10 dark:from-blue-300/5 dark:to-blue-300/10" />
              </Link>
            ))}
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 rounded-lg bg-white/10 dark:bg-blue-300/10 text-white hover:bg-white/20 dark:hover:bg-blue-300/20 transition-all duration-300 backdrop-blur-sm border border-white/20 dark:border-blue-300/20"
          >
            <div className="relative w-6 h-6">
              <div className={clsx(
                'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
                isMobileMenuOpen ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'
              )}>
                <Menu className="w-6 h-6" />
              </div>
              <div className={clsx(
                'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300',
                isMobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'
              )}>
                <X className="w-6 h-6" />
              </div>
            </div>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        <div className={clsx(
          'lg:hidden overflow-hidden transition-all duration-500 ease-in-out',
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="py-6 space-y-2 border-t border-white/20 dark:border-blue-300/20">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                to={item.href}
                className={clsx(
                  'block py-3 px-6 text-sm font-semibold transition-all duration-300 ease-in-out rounded-lg mx-2 group',
                  isActive(item.href)
                    ? 'text-white bg-white/20 dark:bg-blue-300/20 shadow-lg'
                    : 'text-blue-100 dark:text-blue-200 hover:text-white hover:bg-white/10 dark:hover:bg-blue-300/10 hover:shadow-md'
                )}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: isMobileMenuOpen ? 'slideInDown 0.3s ease-out forwards' : 'none'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="relative z-10">{item.label}</span>
                {isActive(item.href) && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white dark:bg-blue-300 rounded-r-full" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;