import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AdminTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let pageTitle = 'Admin Dashboard';

    // Map routes to page titles
    switch (path) {
      case '/admin':
        pageTitle = 'Admin Dashboard';
        break;
      case '/admin/settings':
        pageTitle = 'Settings';
        break;
      case '/admin/chat':
        pageTitle = 'Chat';
        break;
      case '/admin/products':
        pageTitle = 'Products';
        break;
      case '/admin/orders':
        pageTitle = 'Orders';
        break;
      case '/admin/customers':
        pageTitle = 'Customers';
        break;
      case '/admin/categories':
        pageTitle = 'Categories';
        break;
      case '/admin/brands':
        pageTitle = 'Brands';
        break;
      case '/admin/services':
        pageTitle = 'Services';
        break;
      case '/admin/content':
        pageTitle = 'Content';
        break;
      case '/admin/profile':
        pageTitle = 'Profile';
        break;
      default:
        pageTitle = 'Admin Dashboard';
    }

    document.title = `${pageTitle} - Admin Dashboard`;
  }, [location.pathname]);

  return null; // This component doesn't render anything
};

export default AdminTitleUpdater;
