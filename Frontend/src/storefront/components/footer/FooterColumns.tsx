import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
}

const FooterColumns: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        // Fetch only top-level categories (parent is null)
        const response = await fetch('http://127.0.0.1:8001/api/public/categories/?top=true');
        if (response.ok) {
          const data = await response.json();
          const categoriesData = data.results || data;
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCategories();
  }, []);

  const footerSections = [
    {
      title: 'About',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Careers', href: '/careers' },
        { label: 'Find Us', href: '/findus' },
      ],
    },
    {
      title: 'Categories',
      links: loading ? [] : categories.map(category => ({
        label: category.name,
        href: `/allsubcategories?category=${category.id}&name=${encodeURIComponent(category.name)}`
      })),
    },
    {
      title: 'Information',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Help Center', href: '/help' },
        { label: 'Track Your Order', href: '/track-order' },
      ],
    },
    {
      title: 'Service',
      links: [
        { label: 'Shipping Info', href: '/shipping' },
        { label: 'Returns', href: '/returns' },
        { label: 'Warranty', href: '/warranty' },
        { label: 'Support', href: '/support' },
      ],
    },
  ];
  
  return (
    <div className="w-full bg-gray-50 dark:bg-slate-800">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {footerSections.map((section) => (
            <div key={section.title} className="text-center sm:text-left">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">
                {section.title}
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 transition-colors duration-200 block py-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FooterColumns;