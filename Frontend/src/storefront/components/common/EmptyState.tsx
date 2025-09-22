import React from 'react';
import { Search, Filter, RefreshCw, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    href: string;
    variant?: 'primary' | 'secondary';
    icon?: React.ReactNode;
  }>;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  suggestions = [],
  actions = [],
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      {/* Icon */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center shadow-lg">
          {icon || (
            <Search className="w-12 h-12 text-blue-500 dark:text-blue-400" />
          )}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Content */}
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          {description}
        </p>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Try these suggestions:
            </h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {actions.map((action, index) => (
              <Link
                key={index}
                to={action.href}
                className={`
                  inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105
                  ${action.variant === 'primary'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-md hover:shadow-lg'
                  }
                `}
              >
                {action.icon && <span className="w-4 h-4">{action.icon}</span>}
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-2xl opacity-40"></div>
      </div>
    </div>
  );
};

export default EmptyState;
