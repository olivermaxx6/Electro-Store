import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Placeholder from '../components/common/Placeholder';

const NotFound: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8001/api/public/categories/?top=true');
        if (response.ok) {
          const data = await response.json();
          const categoriesData = data.results || data;
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    
    loadCategories();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center ">
      <div className="text-center">
        <Placeholder size="xl" className="mx-auto mb-8">
          <div className="text-gray-400 text-lg">404</div>
        </Placeholder>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or doesn't exist.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
        
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Pages</h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/" className="text-primary hover:text-primary-600 transition-colors">
              Home
            </Link>
            {categories.map((category) => (
              <Link 
                key={category.id}
                to={`/allsubcategories?category=${category.id}&name=${encodeURIComponent(category.name)}`} 
                className="text-primary hover:text-primary-600 transition-colors"
              >
                {category.name}
              </Link>
            ))}
            <Link to="/deals" className="text-primary hover:text-primary-600 transition-colors">
              Hot Deals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;