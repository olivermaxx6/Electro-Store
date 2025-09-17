import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
  href: string;
}

interface ProductTabsProps {
  tabs: Tab[];
  activeTab?: string;
  className?: string;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  tabs,
  activeTab,
  className = '',
}) => {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <nav className="flex space-x-8">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            to={tab.href}
            className={clsx(
              'py-4 px-1 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default ProductTabs;