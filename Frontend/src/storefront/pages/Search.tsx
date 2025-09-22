import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Search as SearchIcon, RefreshCw, ShoppingBag } from 'lucide-react';
import { setSearchQuery, selectProducts } from '../store/productsSlice';
import { productRepo } from '../lib/repo';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ProductCard from '../components/products/ProductCard';
import LoadingScreen from '../components/common/LoadingScreen';
import TitleUpdater from '../components/common/TitleUpdater';
import EmptyState from '../components/common/EmptyState';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const products = useSelector(selectProducts);
  
  const query = searchParams.get('q') || '';
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const performSearch = async () => {
      if (query.trim()) {
        setLoading(true);
        dispatch(setSearchQuery(query));
        
        try {
          const results = await productRepo.search(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    };
    
    performSearch();
  }, [query, dispatch]);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle={`Search: ${query}`} />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {query ? `Search Results for "${query}"` : 'Search'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {query 
              ? `Found ${searchResults.length} result(s) for "${query}"`
              : 'Enter a search term to find products'
            }
          </p>
        </div>
        
        {loading ? (
          <LoadingScreen message="Searching for products..." />
        ) : searchResults.length === 0 && query ? (
          <EmptyState
            icon={<SearchIcon className="w-12 h-12 text-blue-500 dark:text-blue-400" />}
            title="No products found"
            description={`We couldn't find any products matching "${query}". Try different keywords or browse our collection.`}
            suggestions={[
              'Check your spelling and try again',
              'Try more general keywords',
              'Browse different categories',
              'Use fewer or different search terms'
            ]}
            actions={[
              {
                label: 'Try New Search',
                href: '/search',
                variant: 'primary',
                icon: <RefreshCw className="w-4 h-4" />
              },
              {
                label: 'Browse All Products',
                href: '/shop',
                variant: 'secondary',
                icon: <ShoppingBag className="w-4 h-4" />
              }
            ]}
            className="relative"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {searchResults.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;