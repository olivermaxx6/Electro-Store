import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';





/*Mobile Category Navigation (where categories are showing on mobile)*/

interface Category {
  id: number;
  name: string;
  slug: string;
  children?: Category[];
}

interface MobileCategoryNavigationProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

const MobileCategoryNavigation: React.FC<MobileCategoryNavigationProps> = ({
  categories,
  isOpen,
  onClose
}) => {
  const [currentView, setCurrentView] = useState<'main' | 'subcategory'>('main');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const handleCategoryClick = (category: Category) => {
    if (category.children && category.children.length > 0) {
      setSelectedCategory(category);
      setCurrentView('subcategory');
    }
  };

  const handleBackToMain = () => {
    setCurrentView('main');
    setSelectedCategory(null);
  };

  const handleClose = () => {
    setCurrentView('main');
    setSelectedCategory(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentView === 'subcategory' && (
              <button
                onClick={handleBackToMain}
                className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentView === 'subcategory' ? selectedCategory?.name : 'Categories'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {currentView === 'main' ? (
          /* Main Categories List */
          <div className="space-y-0">
            {categories.map((category, index) => (
              <div key={category.id}>
                <div
                  className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                  onClick={() => handleCategoryClick(category)}
                >
                  <span className="text-gray-900 dark:text-white font-medium">
                    {category.name}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </div>
                {index < categories.length - 1 && (
                  <div className="border-b border-gray-100 dark:border-slate-700" />
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Subcategory List */
          <div className="space-y-0">
            {selectedCategory?.children?.map((subcategory, index) => (
              <div key={subcategory.id}>
                <Link
                  to={subcategory.children && subcategory.children.length > 0 
                    ? `/allsubcategories?category=${subcategory.id}&name=${encodeURIComponent(subcategory.name)}`
                    : `/category/${subcategory.slug}`
                  }
                  className="flex items-center justify-between px-4 py-4 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-200"
                  onClick={handleClose}
                >
                  <span className="text-gray-900 dark:text-white font-medium">
                    {subcategory.name}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-500 dark:text-slate-400" />
                </Link>
                {index < (selectedCategory?.children?.length || 0) - 1 && (
                  <div className="border-b border-gray-100 dark:border-slate-700" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCategoryNavigation;
