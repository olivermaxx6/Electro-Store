import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FooterColumns: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8001/api/public/categories/?top=true');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.results || data);
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
        { label: 'Press', href: '/press' },
      ],
    },
    {
      title: 'Categories',
      links: loading ? [] : categories.map(category => ({
        label: category.name,
        href: `/category/${category.slug}`
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
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {footerSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-blue-400 transition-colors"
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
  );
};

export default FooterColumns;