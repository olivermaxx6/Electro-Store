import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery, selectProducts } from '../store/productsSlice';
import { productRepo } from '../lib/repo';
import Breadcrumbs from '../components/common/Breadcrumbs';
import ProductCard from '../components/products/ProductCard';
import Placeholder from '../components/common/Placeholder';

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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs className="mb-6" />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {query ? `Search Results for "${query}"` : 'Search'}
          </h1>
          <p className="text-gray-600">
            {query 
              ? `Found ${searchResults.length} result(s) for "${query}"`
              : 'Enter a search term to find products'
            }
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            <Placeholder size="lg" className="mx-auto mb-6">
              <div className="text-gray-400">Searching...</div>
            </Placeholder>
            <p className="text-gray-600">Searching for products...</p>
          </div>
        ) : searchResults.length === 0 && query ? (
          <div className="text-center py-16">
            <Placeholder size="lg" className="mx-auto mb-6">
              <div className="text-gray-400">No Results</div>
            </Placeholder>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No products found</h2>
            <p className="text-gray-600 mb-8">
              We couldn't find any products matching "{query}". Try different keywords.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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