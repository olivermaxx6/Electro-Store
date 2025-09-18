import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items = [],
  className = '',
}) => {
  const location = useLocation();
  
  // Auto-generate breadcrumbs from current path if no items provided
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const autoItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    ...pathSegments.map((segment, index) => ({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: index === pathSegments.length - 1 ? undefined : `/${pathSegments.slice(0, index + 1).join('/')}`,
    })),
  ];
  
  const breadcrumbItems = items.length > 0 ? items : autoItems;
  
  return (
    <nav className={`flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 ${className}`} aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index === 0 && (
            <Home className="h-4 w-4" aria-hidden="true" />
          )}
          
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
          )}
          
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;