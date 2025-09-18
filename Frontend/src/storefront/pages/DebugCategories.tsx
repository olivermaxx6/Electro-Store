import React, { useState, useEffect } from 'react';

const DebugCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching categories from API...');
        const response = await fetch('http://localhost:8001/api/public/categories/?top=true');
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Response data:', data);
          setCategories(data.results || data);
        } else {
          setError(`API request failed with status: ${response.status}`);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Categories</h1>
      
      {loading && <p>Loading categories...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {categories.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Categories ({categories.length})</h2>
          <ul className="list-disc list-inside">
            {categories.map((category) => (
              <li key={category.id}>
                <strong>{category.name}</strong> (ID: {category.id}, Slug: {category.slug})
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-2">Raw Data</h3>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(categories, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugCategories;
