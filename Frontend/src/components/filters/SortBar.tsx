import { useDispatch, useSelector } from 'react-redux';
import { setSortBy } from '../../store/productsSlice';
import { selectSortBy } from '../../store/productsSlice';
import { SortOption } from '../../types';

const SortBar = () => {
  const dispatch = useDispatch();
  const sortBy = useSelector(selectSortBy);

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'popularity', label: 'Popularity' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  const handleSortChange = (value: SortOption) => {
    dispatch(setSortBy(value));
  };

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">View:</span>
        <div className="flex border border-gray-300 rounded-md">
          <button className="px-3 py-1 text-sm bg-primary text-white rounded-l-md">
            Grid
          </button>
          <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-r-md">
            List
          </button>
        </div>
      </div>
    </div>
  );
};

export default SortBar;
