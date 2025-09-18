import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../../store/productsSlice';
import { selectFilters, selectBrands } from '../../store/productsSlice';
import { FilterState } from '../../types';
import Button from '../common/Button';
import DualRangeSlider from './DualRangeSlider';

const FiltersPanel = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const brands = useSelector(selectBrands);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    dispatch(setFilters(localFilters));
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterState = {};
    setLocalFilters(clearedFilters);
    dispatch(setFilters(clearedFilters));
  };

  const handleBrandToggle = (brand: string) => {
    const currentBrands = localFilters.brand || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    handleFilterChange('brand', newBrands);
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          Clear All
        </Button>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Price Range</h4>
          <DualRangeSlider
            min={0}
            max={5000}
            step={50}
            value={localFilters.priceRange || [0, 5000]}
            onChange={(value) => handleFilterChange('priceRange', value)}
            formatValue={(val) => `£${val}`}
          />
        </div>

        {/* Brand */}
        <div>
          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Brand</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.brand?.includes(brand) || false}
                  onChange={() => handleBrandToggle(brand)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{brand}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Minimum Rating</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  checked={localFilters.rating === rating}
                  onChange={() => handleFilterChange('rating', rating)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{rating}+ Stars</span>
              </label>
            ))}
          </div>
        </div>

        {/* Only Discounted */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localFilters.onlyDiscounted || false}
              onChange={(e) => handleFilterChange('onlyDiscounted', e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Only discounted items</span>
          </label>
        </div>

        {/* Apply Button */}
        <Button variant="primary" className="w-full" onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

export default FiltersPanel;
