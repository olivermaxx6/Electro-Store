import { useEffect, useMemo, useState, useRef } from 'react';
import Card from '../../components/ui/Card';
import { ThemeLayout, ThemeCard, ThemeInput, ThemeButton, ThemeAlert, ThemeSelect, FormSection } from '@theme';
import {
  listBrands, listTopCategories, listSubcategories,
  createCategory, updateCategory, deleteCategory,
  createBrand, updateBrand, deleteBrand,
} from '../../lib/api';
import { api } from '../../lib/api';
import { useOptimizedData } from '../../hooks/useOptimizedData';

// Enhanced tree building function for 3-level hierarchy
function buildHierarchyTree(categories) {
  console.log('🔍 Building hierarchy tree from categories:', categories.length);
  
  const byParent = new Map();
  categories.forEach(c => {
    const pid = c.parent ?? c.parent_id ?? null;
    const key = pid || 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  });
  
  const roots = byParent.get('root') || byParent.get(null) || [];
  console.log('🔍 Root categories found:', roots.length);
  
  const attach = (node) => ({
    ...node,
    level: node.depth || (node.parent ? (node.parent.parent ? 2 : 1) : 0),
    levelName: node.level_name || (node.parent ? (node.parent.parent ? 'Grandchild Category' : 'Child Category') : 'Parent Category'),
    children: (byParent.get(node.id) || []).map(attach),
  });
  
  const tree = roots.map(attach);
  console.log('🔍 Built tree structure:', tree);
  return tree;
}

// Component for rendering individual category items
function CategoryItem({ category, onSelect, depth = 0, isSelected = false, expandedCategories, onToggleExpand, scrollToEditSection }) {
  const levelIcons = {
    0: '📁', // Parent
    1: '📂', // Child
    2: '📄', // Grandchild
  };
  
  const levelNames = {
    0: 'Parent',
    1: 'Child', 
    2: 'Grandchild'
  };

  const isExpanded = expandedCategories.has(category.id);
  const hasChildren = category.children?.length > 0;
  
  // Debug logging for expansion state
  if (category.id === 1) { // Log for first category only to avoid spam
    console.log(`🔍 Category "${category.name}" (ID: ${category.id}):`, {
      isExpanded,
      hasChildren,
      childrenCount: category.children?.length || 0,
      expandedCategoriesSize: expandedCategories.size
    });
  }

  return (
    <div className="group">
      <div
        onClick={() => onSelect(category)}
        className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-500 shadow-sm' 
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-sm'
        }`}
        style={{ 
          marginLeft: depth * 24,
          position: 'relative'
        }}
      >
        {/* Connecting line for hierarchy */}
        {depth > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-px bg-slate-300 dark:bg-slate-500"
            style={{ left: `${(depth - 1) * 24 + 12}px` }}
          />
        )}
        
        <div className="flex items-center gap-3">
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(category.id);
              }}
              className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <span className={`text-slate-600 dark:text-slate-400 text-sm transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : 'rotate-0'
              }`}>
                ▶
              </span>
            </button>
          ) : (
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
            </div>
          )}
          
          {/* Category icon */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-700">
            {category.image ? (
              <img 
                src={category.image.startsWith('http') ? category.image : `${category.image}`} 
                alt={category.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-slate-600 dark:text-slate-400 text-sm">
                {levelIcons[category.level] || levelIcons[0]}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-800 dark:text-slate-200 break-words leading-tight">
              {category.name}
            </div>
            {category.slogan && (
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic break-words leading-tight">
                "{category.slogan.length > 80 ? category.slogan.substring(0, 80) + '...' : category.slogan}"
              </div>
            )}
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
              <span>{levelNames[category.level] || 'Category'}</span>
              <span>•</span>
              <span>ID: {category.id}</span>
              {category.children_count > 0 && (
                <>
                  <span>•</span>
                  <span>{category.children_count} sub{category.children_count === 1 ? '' : 's'}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Children container */}
      {category.children?.length > 0 && (
        <div className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="mt-2 space-y-1 pb-2">
            {category.children.map(child => (
              <CategoryItem
                key={child.id}
                category={child}
                onSelect={onSelect}
                depth={depth + 1}
                isSelected={isSelected}
                expandedCategories={expandedCategories}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManageCategoriesPage() {
  
  // Simple data for categories and brands - using direct API calls like ContentPage
  const [allCats, setAllCats] = useState([]);
  const [allBrands, setAllBrands] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [brandsError, setBrandsError] = useState(null);

  // Load data function with better error handling and performance
  const loadData = async () => {
    try {
      setCategoriesLoading(true);
      setBrandsLoading(true);
      setCategoriesError(null);
      setBrandsError(null);

      console.log('🚀 Starting data load...');
      const startTime = performance.now();

      // Load brands and categories in parallel with timeout
      const [brandsRes, categoriesRes] = await Promise.all([
        Promise.race([
          listBrands(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Brands request timeout')), 10000))
        ]),
        Promise.race([
          api.get('/admin/categories/'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Categories request timeout')), 15000))
        ])
      ]);
      
      const endTime = performance.now();
      console.log(`🚀 Data loaded in ${(endTime - startTime).toFixed(2)}ms`);
      
      // Handle different response structures safely
      const brands = brandsRes?.results || brandsRes?.data?.results || brandsRes?.data || brandsRes || [];
      const categories = categoriesRes?.results || categoriesRes?.data?.results || categoriesRes?.data || categoriesRes || [];
      
      setAllBrands(brands);
      setAllCats(categories);
      
      console.log(`✅ Loaded ${brands.length} brands and ${categories.length} categories`);
      
      // Debug: Log grandchild categories
      const grandchildCats = categories.filter(cat => cat.level === 2);
      console.log('🔍 Grandchild categories found:', grandchildCats);
      console.log('🔍 Categories with ID 527 or 529:', categories.filter(cat => cat.id === 527 || cat.id === 529));
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      setCategoriesError(err);
      setBrandsError(err);
    } finally {
      setCategoriesLoading(false);
      setBrandsLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Refresh functions for compatibility
  const refreshCategories = () => loadData();
  const refreshBrands = () => loadData();
  const refreshCategoriesImmediate = () => loadData();
  const refreshBrandsImmediate = () => loadData();

  // Optimistic update functions for compatibility
  const addCategoryOptimistic = (newCategory) => {
    setAllCats(prev => [...prev, newCategory]);
  };
  const updateCategoryOptimistic = (id, updates) => {
    setAllCats(prev => prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat));
  };
  const removeCategoryOptimistic = (id) => {
    setAllCats(prev => prev.filter(cat => cat.id !== id));
  };
  const addBrandOptimistic = (newBrand) => {
    setAllBrands(prev => [...prev, newBrand]);
  };
  const updateBrandOptimistic = (id, updates) => {
    setAllBrands(prev => prev.map(brand => brand.id === id ? { ...brand, ...updates } : brand));
  };
  const removeBrandOptimistic = (id) => {
    setAllBrands(prev => prev.filter(brand => brand.id !== id));
  };

  // Form states for adding new items
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlogan, setNewCatSlogan] = useState('');
  const [newSubParentId, setNewSubParentId] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newSubSlogan, setNewSubSlogan] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandImage, setNewBrandImage] = useState(null);
  const [newSubImage, setNewSubImage] = useState(null);

  // Edit/delete states
  const [editMode, setEditMode] = useState('category');
  const [editCatId, setEditCatId] = useState('');
  const [editSubParentId, setEditSubParentId] = useState('');
  const [editSubId, setEditSubId] = useState('');
  const [editBrandId, setEditBrandId] = useState('');
  const [editName, setEditName] = useState('');
  const [editSlogan, setEditSlogan] = useState('');
  const [editCurrentImage, setEditCurrentImage] = useState(null);
  const [editSubImage, setEditSubImage] = useState(null);
  const [editBrandImage, setEditBrandImage] = useState(null);

  // UI state
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [userHasCollapsed, setUserHasCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Refs for scroll targets
  const editCategoryRef = useRef(null);
  const editSubcategoryRef = useRef(null);
  const editGrandchildRef = useRef(null);
  const editBrandRef = useRef(null);

  // Real-time refresh function
  const refreshData = async () => {
    try {
      // Force immediate refresh without debounce for better UX
      await loadData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // Scroll to edit section function
  const scrollToEditSection = (section) => {
    setTimeout(() => {
      let targetRef = null;
      switch (section) {
        case 'category':
          targetRef = editCategoryRef.current;
          break;
        case 'subcategory':
          targetRef = editSubcategoryRef.current;
          break;
        case 'grandchild':
          targetRef = editGrandchildRef.current;
          break;
        case 'brand':
          targetRef = editBrandRef.current;
          break;
        default:
          return;
      }
      
      if (targetRef) {
        targetRef.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  // Derived data with filtering and sorting
  const filteredCats = useMemo(() => {
    // Ensure allCats is always an array
    const safeAllCats = Array.isArray(allCats) ? allCats : [];
    let filtered = safeAllCats;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(cat => 
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.full_path.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply level filter
    if (filterLevel !== 'all') {
      const level = parseInt(filterLevel);
      filtered = filtered.filter(cat => cat.level === level);
    }
    
    // Apply sorting - ensure filtered is still an array before sorting
    if (Array.isArray(filtered)) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'level':
            return a.level - b.level;
          case 'children':
            return b.children_count - a.children_count;
          case 'id':
            return a.id - b.id;
          default:
            return 0;
        }
      });
    }
    
    return filtered;
  }, [allCats, searchTerm, filterLevel, sortBy]);

  const tree = useMemo(() => buildHierarchyTree(filteredCats), [filteredCats]);
  
  // Count categories from the tree structure to avoid duplicates from flat API response
  const categoryCounts = useMemo(() => {
    const counts = { parents: 0, children: 0, grandchildren: 0 };
    
    const countFromTree = (nodes) => {
      nodes.forEach(node => {
        if (node.level === 0) counts.parents++;
        else if (node.level === 1) counts.children++;
        else if (node.level === 2) counts.grandchildren++;
        
        if (node.children && node.children.length > 0) {
          countFromTree(node.children);
        }
      });
    };
    
    countFromTree(tree);
    
    // Debug logging
    console.log('Category counts calculated:', counts);
    console.log('Tree structure:', tree);
    console.log('Filtered categories:', filteredCats.length);
    console.log('All categories:', (Array.isArray(allCats) ? allCats : []).length);
    
    return counts;
  }, [tree, filteredCats, allCats]);
  
  const parentCats = useMemo(() => (Array.isArray(allCats) ? allCats : []).filter(c => c.level === 0), [allCats]);
  const childCats = useMemo(() => (Array.isArray(allCats) ? allCats : []).filter(c => c.level === 1), [allCats]);
  const grandchildCats = useMemo(() => (Array.isArray(allCats) ? allCats : []).filter(c => c.level === 2), [allCats]);

  // Helper function to get categories that can have children
  const getEligibleParents = useMemo(() => {
    return (Array.isArray(allCats) ? allCats : []).filter(cat => cat.can_have_children);
  }, [allCats]);

  // Helper function to get subcategories by parent
  const subcatsByParent = useMemo(() => {
    const map = new Map();
    (Array.isArray(allCats) ? allCats : []).forEach(c => {
      if (c.parent) {
        if (!map.has(c.parent)) map.set(c.parent, []);
        map.get(c.parent).push(c);
      }
    });
    return map;
  }, [allCats]);

  // Data fetching is now handled automatically by useOptimizedData hooks

  const broadcast = () => window.dispatchEvent(new CustomEvent('taxonomy:updated'));

  // Toggle expand/collapse for categories
  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      // Save to localStorage
      localStorage.setItem('admin_expanded_categories', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Expand all categories
  const expandAll = () => {
    console.log('🔧 Expand All clicked - Total categories:', (Array.isArray(allCats) ? allCats : []).length);
    const allCategoryIds = (Array.isArray(allCats) ? allCats : []).map(cat => cat.id);
    console.log('🔧 Category IDs to expand:', allCategoryIds);
    const newSet = new Set(allCategoryIds);
    setExpandedCategories(newSet);
    setUserHasCollapsed(false); // Reset the flag when user manually expands
    localStorage.setItem('admin_expanded_categories', JSON.stringify(allCategoryIds));
    localStorage.removeItem('admin_user_has_collapsed'); // Remove the flag
    console.log('🔧 Expanded categories set:', newSet.size);
  };

  // Collapse all categories
  const collapseAll = () => {
    console.log('🔧 Collapse All clicked');
    setExpandedCategories(new Set());
    setUserHasCollapsed(true); // Mark that user has manually collapsed
    localStorage.setItem('admin_expanded_categories', JSON.stringify([]));
    localStorage.setItem('admin_user_has_collapsed', 'true'); // Persist the flag
    console.log('🔧 All categories collapsed');
  };

  // Load expanded state from localStorage on component mount
  useEffect(() => {
    const savedExpanded = localStorage.getItem('admin_expanded_categories');
    const userHasCollapsedFlag = localStorage.getItem('admin_user_has_collapsed') === 'true';
    
    setUserHasCollapsed(userHasCollapsedFlag);
    
    if (savedExpanded) {
      try {
        const expandedArray = JSON.parse(savedExpanded);
        setExpandedCategories(new Set(expandedArray));
      } catch (error) {
        console.error('Failed to parse saved expanded categories:', error);
      }
    } else {
      // If no saved state, expand all categories by default
      // This will be set when categories are loaded
    }
  }, []);

  // Auto-expand all categories when they're first loaded (only if user hasn't manually collapsed)
  useEffect(() => {
    if ((Array.isArray(allCats) ? allCats : []).length > 0 && expandedCategories.size === 0 && !userHasCollapsed) {
      console.log('🔧 Auto-expanding categories on first load');
      const allCategoryIds = (Array.isArray(allCats) ? allCats : []).map(cat => cat.id);
      const newSet = new Set(allCategoryIds);
      setExpandedCategories(newSet);
      localStorage.setItem('admin_expanded_categories', JSON.stringify(allCategoryIds));
    } else if (userHasCollapsed) {
      console.log('🔧 User has collapsed - skipping auto-expansion');
    }
  }, [allCats, expandedCategories.size, userHasCollapsed]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when not typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'e':
            e.preventDefault();
            expandAll();
            break;
          case 'c':
            e.preventDefault();
            collapseAll();
            break;
          case 'f':
            e.preventDefault();
            document.querySelector('input[placeholder="Search categories..."]')?.focus();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const onPickCategory = (cat) => {
    console.log('🔍 Picking category:', cat);
    console.log('🔍 Category level:', cat.level);
    console.log('🔍 Category parent:', cat.parent);
    setSelectedCategory(cat);
    
    // Determine edit mode based on category level
    let editMode = 'category';
    if (cat.level === 1) {
      editMode = 'subcategory';
    } else if (cat.level === 2) {
      editMode = 'grandchild';
    }
    console.log('🔍 Setting edit mode to:', editMode);
    setEditMode(editMode);
    
    // Set up edit state based on category level
    if (cat.level === 0) {
      // Parent category
      setEditCatId(String(cat.id));
      setEditSubParentId('');
      setEditSubId('');
    } else if (cat.level === 1) {
      // Child category
      setEditCatId('');
      setEditSubParentId(String(cat.parent));
      setEditSubId(String(cat.id));
    } else if (cat.level === 2) {
      // Grandchild category
      setEditCatId('');
      setEditSubParentId(String(cat.parent));
      setEditSubId(String(cat.id));
    }
    
    // Set common edit fields
    setEditName(cat.name);
    setEditSlogan(cat.slogan || '');
    setEditCurrentImage(cat.image);
    
    // Scroll to the appropriate edit section
    const section = cat.level === 0 ? 'category' : cat.level === 1 ? 'subcategory' : 'grandchild';
    scrollToEditSection(section);
    setEditSubImage(null);
    setMsg(null);
    
    console.log('🔍 Edit state set:', {
      editMode,
      editCatId: cat.level === 0 ? String(cat.id) : '',
      editSubParentId: cat.level > 0 ? String(cat.parent) : '',
      editSubId: cat.level > 0 ? String(cat.id) : '',
      editName: cat.name,
      editSlogan: cat.slogan || ''
    });
  };

  const onPickBrand = (brand) => {
    setEditMode('brand');
    setEditBrandId(String(brand.id));
    setEditName(brand.name);
    setEditCurrentImage(brand.image);
    setEditBrandImage(null);
    setMsg(null);
    
    // Scroll to brand edit section
    scrollToEditSection('brand');
  };

  const showError = (err, fallback = 'Something went wrong') => {
    console.error('Error details:', err);
    let errorMessage = err?.uiMessage || fallback;
    
    if (err?.response?.status === 400) {
      const responseData = err?.response?.data;
      if (responseData?.detail) {
        errorMessage = responseData.detail;
      } else if (responseData?.name && Array.isArray(responseData.name)) {
        // Handle validation errors from Django REST framework
        errorMessage = responseData.name.join(', ');
      } else if (responseData?.parent && Array.isArray(responseData.parent)) {
        errorMessage = responseData.parent.join(', ');
      } else if (errorMessage.includes('PROTECT')) {
        errorMessage = 'Cannot delete item: There are products using this item. Please delete or reassign the products first.';
      } else if (errorMessage.includes('hierarchy')) {
        errorMessage = 'Cannot create subcategory: Maximum hierarchy depth reached.';
      } else if (errorMessage.includes('already exists')) {
        errorMessage = errorMessage; // Keep the specific validation message
      }
    } else if (err?.response?.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (err?.response?.status === 403) {
      errorMessage = 'Access denied. You may not have admin permissions.';
    } else if (err?.response?.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (err?.response?.status === 0) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    // Handle specific category deletion constraint errors
    if (errorMessage.includes('product(s) are using this category')) {
      errorMessage = `⚠️ Cannot delete category: ${errorMessage}\n\nTo delete this category:\n1. Go to Products page\n2. Find products using this category\n3. Either delete those products or reassign them to another category\n4. Then try deleting the category again`;
    }
    
    console.error('Final error message:', errorMessage);
    setMsg({ kind: 'error', text: errorMessage });
  };

  const normalizeId = (v) => {
    if (v === undefined || v === null || v === '' || v === 'null') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // === Add Category (Parent) ===
  const addCategory = async (e) => {
    e.preventDefault();
    setMsg(null);
    const name = (newCatName || '').trim();
    const slogan = (newCatSlogan || '').trim();
    if (!name) return setMsg({ kind: 'error', text: 'Please enter a category name.' });
    try {
      setBusy(true);
      const response = await createCategory({ name, slogan });
      
      // Optimistically update local state immediately
      if (response) {
        addCategoryOptimistic(response);
      }
      
      // Then refresh to get the latest data from server
      await refreshData();
      
      setNewCatName('');
      setNewCatSlogan('');
      broadcast();
      setMsg({ kind: 'success', text: 'Parent category added.' });
    } catch (err) {
      setMsg({ kind: 'error', text: err.uiMessage || 'Failed to add category.' });
    } finally { setBusy(false); }
  };

  // === Add Subcategory (Child or Grandchild) ===
  const addSubcategory = async (e) => {
    e.preventDefault();
    setMsg(null);
    const parent = normalizeId(newSubParentId);
    const name = (newSubName || '').trim();
    const slogan = (newSubSlogan || '').trim();
    if (!parent) return setMsg({ kind: 'error', text: 'Please select a parent category first.' });
    if (!name) return setMsg({ kind: 'error', text: 'Please enter a subcategory name.' });
    
    // Check if this will be a grandchild category (level 2) and require image
    const parentCategory = (Array.isArray(allCats) ? allCats : []).find(cat => cat.id === parent);
    const willBeGrandchild = parentCategory && parentCategory.level === 1;
    
    if (willBeGrandchild && !newSubImage) {
      return setMsg({ kind: 'error', text: 'Image is required for grandchild categories (level 2). Please upload an image.' });
    }
    
    try {
      setBusy(true);
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('slogan', slogan);
      formData.append('parent', parent);
      if (newSubImage) {
        formData.append('image', newSubImage);
      }
      
      await createCategory(formData);
      setNewSubName('');
      setNewSubSlogan('');
      setNewSubParentId('');
      setNewSubImage(null);
      broadcast();
      await refreshData();
      setMsg({ kind: 'success', text: 'Subcategory added.' });
    } catch (err) {
      console.error('[ManageCategoriesPage] Failed to add subcategory:', err);
      
      // Handle specific error types
      if (err.response?.data?.error_type === 'duplicate_image') {
        setMsg({ 
          kind: 'error', 
          text: 'Duplicate Image: This image already exists for this category. Please upload a different image.' 
        });
      } else {
        showError(err, 'Failed to add subcategory.');
      }
    } finally { setBusy(false); }
  };

  // === Add Brand ===
  const addBrand = async (e) => {
    e.preventDefault();
    setMsg(null);
    const name = (newBrandName || '').trim();
    if (!name) return setMsg({ kind: 'error', text: 'Please enter a brand name.' });
    try {
      setBusy(true);
      
      const formData = new FormData();
      formData.append('name', name);
      if (newBrandImage) {
        formData.append('image', newBrandImage);
      }
      
      await createBrand(formData);
      await refreshData();
      setNewBrandName('');
      setNewBrandImage(null);
      broadcast();
      setMsg({ kind: 'success', text: 'Brand added.' });
    } catch (err) {
      console.error('[ManageCategoriesPage] Failed to add brand:', err);
      
      // Handle specific error types
      if (err.response?.data?.error_type === 'duplicate_image') {
        setMsg({ 
          kind: 'error', 
          text: 'Duplicate Image: This image already exists for this brand. Please upload a different image.' 
        });
      } else {
        setMsg({ kind: 'error', text: err.uiMessage || 'Failed to add brand.' });
      }
    } finally { setBusy(false); }
  };

  // === Save Edit ===
  const saveEdit = async () => {
    setMsg(null);
    if (!editName.trim()) return setMsg({ kind: 'error', text: 'Please enter a new name.' });
    try {
      setBusy(true);
      
      if (editMode === 'category') {
        if (!editCatId) return setMsg({ kind: 'error', text: 'Pick a category to edit.' });
        console.log('Updating category with data:', { name: editName, slogan: editSlogan });
        await updateCategory(editCatId, { name: editName, slogan: editSlogan });
      } else if (editMode === 'subcategory' || editMode === 'grandchild') {
        if (!editSubId) return setMsg({ kind: 'error', text: 'Pick a subcategory to edit.' });
        
        // Note: Image is optional for editing existing grandchild categories
        // Only require image when creating new grandchild categories
        
        const formData = new FormData();
        formData.append('name', editName);
        formData.append('slogan', editSlogan);
        
        // For subcategory and grandchild categories, we need to maintain the parent relationship
        if ((editMode === 'subcategory' || editMode === 'grandchild') && editSubParentId) {
          formData.append('parent', editSubParentId);
        }
        
        if (editSubImage) {
          formData.append('image', editSubImage);
        }
        
        console.log('🔍 Updating category with formData:', {
          name: editName,
          slogan: editSlogan,
          parent: (editMode === 'subcategory' || editMode === 'grandchild') ? editSubParentId : undefined,
          hasImage: !!editSubImage
        });
        
        await updateCategory(editSubId, formData);
      } else {
        if (!editBrandId) return setMsg({ kind: 'error', text: 'Pick a brand to edit.' });
        
        const formData = new FormData();
        formData.append('name', editName);
        if (editBrandImage) {
          formData.append('image', editBrandImage);
        }
        
        await updateBrand(editBrandId, formData);
      }
      
      // Optimistically update local state immediately
      if (editMode === 'category' && editCatId) {
        updateCategoryOptimistic(editCatId, { name: editName, slogan: editSlogan });
      } else if ((editMode === 'subcategory' || editMode === 'grandchild') && editSubId) {
        updateCategoryOptimistic(editSubId, { name: editName, slogan: editSlogan });
      } else if (editMode === 'brand' && editBrandId) {
        updateBrandOptimistic(editBrandId, { name: editName });
      }
      
      // Update the selected category with the new data
      if (selectedCategory) {
        console.log('Updating selected category:', { name: editName, slogan: editSlogan });
        setSelectedCategory(prev => ({
          ...prev,
          name: editName,
          slogan: editSlogan
        }));
      }
      
      // Then refresh to get the latest data from server
      broadcast();
      await refreshData();
      setMsg({ kind: 'success', text: 'Changes saved.' });
      
      // Reset edit image states
      setEditBrandImage(null);
      setEditSubImage(null);
    } catch (err) { 
      console.error('[ManageCategoriesPage] Failed to save changes:', err);
      
      // Handle specific error types
      if (err.response?.data?.error_type === 'duplicate_image') {
        setMsg({ 
          kind: 'error', 
          text: 'Duplicate Image: This image already exists. Please upload a different image.' 
        });
      } else {
        showError(err, 'Failed to save changes.');
      }
    } finally { setBusy(false); }
  };

  // === Delete Edit ===
  // Check if category can be safely deleted
  const canDeleteCategory = async (categoryId) => {
    try {
      // Get products using this category
      const products = await listProducts({ category: categoryId });
      return products.length === 0;
    } catch (error) {
      console.warn('Could not check category usage:', error);
      return false; // Err on the side of caution
    }
  };

  const deleteEdit = async () => {
    setMsg(null);
    try {
      setBusy(true);
      
      if (editMode === 'category') {
        if (!editCatId) return setMsg({ kind: 'error', text: 'Pick a category to delete.' });
        
        // Check if category can be safely deleted
        const canDelete = await canDeleteCategory(editCatId);
        if (!canDelete) {
          setMsg({ 
            kind: 'error', 
            text: '⚠️ Cannot delete this category because it has products associated with it.\n\nTo delete this category:\n1. Go to Products page\n2. Find products using this category\n3. Either delete those products or reassign them to another category\n4. Then try deleting the category again'
          });
          return;
        }
        
        if (!confirm('Delete Category and all its Subcategories?')) return;
        console.log('Deleting category with ID:', editCatId);
        
        // Optimistically remove from local state immediately
        removeCategoryOptimistic(editCatId);
        
        await deleteCategory(editCatId);
        setEditCatId(''); 
        setEditName('');
      } else if (editMode === 'subcategory' || editMode === 'grandchild') {
        if (!editSubId) return setMsg({ kind: 'error', text: 'Pick a subcategory to delete.' });
        
        // Check if subcategory can be safely deleted
        const canDelete = await canDeleteCategory(editSubId);
        if (!canDelete) {
          setMsg({ 
            kind: 'error', 
            text: '⚠️ Cannot delete this subcategory because it has products associated with it.\n\nTo delete this subcategory:\n1. Go to Products page\n2. Find products using this subcategory\n3. Either delete those products or reassign them to another category\n4. Then try deleting the subcategory again'
          });
          return;
        }
        
        if (!confirm('Delete this Subcategory?')) return;
        console.log('Deleting subcategory with ID:', editSubId);
        
        // Optimistically remove from local state immediately
        removeCategoryOptimistic(editSubId);
        
        await deleteCategory(editSubId);
        setEditSubId(''); 
        setEditName('');
      } else {
        if (!editBrandId) return setMsg({ kind: 'error', text: 'Pick a brand to delete.' });
        if (!confirm('Delete this Brand?')) return;
        console.log('Deleting brand with ID:', editBrandId);
        
        // Optimistically remove from local state immediately
        removeBrandOptimistic(editBrandId);
        
        await deleteBrand(editBrandId);
        setEditBrandId(''); 
        setEditName('');
      }
      
      await refreshData();
      broadcast();
      setMsg({ kind: 'success', text: 'Item deleted successfully.' });
    } catch (err) { 
      console.error('Delete error:', err);
      showError(err, 'Failed to delete item.'); 
    } finally { setBusy(false); }
  };

  return (
    <ThemeLayout>
      {/* Global loading indicator */}
      {(categoriesLoading || brandsLoading) && (
        <div className="fixed top-4 right-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span className="text-sm font-medium">
            {categoriesLoading && brandsLoading ? 'Loading categories and brands...' : 
             categoriesLoading ? 'Loading categories...' : 'Loading brands...'}
          </span>
        </div>
      )}
      
      <div className="flex flex-col xl:flex-row gap-6">
        {/* LEFT SIDE - Category Tree */}
        <div className="xl:w-5/12 w-full xl:sticky xl:top-16 h-fit space-y-6">
          <ThemeCard className="mb-2.5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📂</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Category Hierarchy</h2>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Click any item to edit/delete. Click ▶ to expand/collapse subcategories. Supports 3 levels: Parent → Child → Grandchild
            </div>
            
            {/* Search and Filter Controls */}
            <div className="mb-4 space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  🔍
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              
              {/* Filter and Sort Controls */}
              <div className="flex flex-wrap gap-2">
                {/* Level Filter */}
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels</option>
                  <option value="0">Parent Only</option>
                  <option value="1">Child Only</option>
                  <option value="2">Grandchild Only</option>
                </select>
                
                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="level">Sort by Level</option>
                  <option value="children">Sort by Children</option>
                  <option value="id">Sort by ID</option>
                </select>
              </div>
              
              {/* Expand/Collapse Controls */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
                  title="Expand all categories (Ctrl+E)"
                >
                  <span>📂</span>
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors duration-200"
                  title="Collapse all categories (Ctrl+C)"
                >
                  <span>📁</span>
                  Collapse All
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('admin_categories');
                    localStorage.removeItem('admin_brands');
                    localStorage.removeItem('admin_expanded_categories');
                    localStorage.removeItem('admin_user_has_collapsed');
                    setUserHasCollapsed(false);
                    loadData();
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-red-100 dark:bg-red-700 hover:bg-red-200 dark:hover:bg-red-600 rounded-lg transition-colors duration-200"
                  title="Clear cache and reload from API"
                >
                  <span>🗑️</span>
                  Clear Cache
                </button>
              </div>
              
              {/* Keyboard Shortcuts Help */}
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="font-semibold mb-1">Keyboard Shortcuts:</div>
                <div className="grid grid-cols-1 gap-1">
                  <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl+E</kbd> Expand All</span>
                  <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl+C</kbd> Collapse All</span>
                  <span><kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs">Ctrl+F</kbd> Focus Search</span>
                </div>
              </div>
            </div>
            
            {/* Simple Statistics */}
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Categories:</div>
              <div className="flex gap-4 text-sm">
                <span>📁 Parents: <strong>{categoryCounts.parents}</strong></span>
                <span>📂 Children: <strong>{categoryCounts.children}</strong></span>
                <span>📄 Grandchildren: <strong>{categoryCounts.grandchildren}</strong></span>
                <span>Total: <strong>{categoryCounts.parents + categoryCounts.children + categoryCounts.grandchildren}</strong></span>
              </div>
            </div>

            {categoriesLoading ? (
              <div className="max-h-[36rem] overflow-y-auto space-y-2 pr-2 pb-6">
                {/* Skeleton loading for categories */}
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded"></div>
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : categoriesError ? (
              <div className="text-center py-8 text-red-500 dark:text-red-400">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">❌</span>
                </div>
                <div className="font-medium mb-1">Failed to load categories</div>
                <div className="text-sm mb-4">{categoriesError.message}</div>
                <button
                  onClick={loadData}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : tree.length ? (
              <div className="max-h-[36rem] overflow-y-auto space-y-2 pr-2 pb-6">
                {tree.map(category => (
                  <CategoryItem
                    key={category.id}
                    category={category}
                    onSelect={onPickCategory}
                    depth={0}
                    isSelected={selectedCategory?.id === category.id}
                    expandedCategories={expandedCategories}
                    onToggleExpand={toggleExpand}
                  />
                ))}
                {/* Extra spacing to ensure last item is fully visible */}
                <div className="h-4"></div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">📂</span>
                </div>
                <div className="font-medium mb-1">No categories found</div>
                <div className="text-sm">
                  {searchTerm || filterLevel !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Create your first category using the form on the right'
                  }
                </div>
                {(searchTerm || filterLevel !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterLevel('all');
                    }}
                    className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </ThemeCard>

          {/* Brands Section */}
          <ThemeCard>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🏷️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Brands</h2>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">Click a brand to edit/delete.</div>
            {brandsLoading ? (
              <div className="max-h-[28rem] overflow-y-auto space-y-2 pr-2 pb-6">
                {/* Skeleton loading for brands */}
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-full p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 dark:bg-slate-600 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-2/3 mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/3"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : brandsError ? (
              <div className="text-center py-8 text-red-500 dark:text-red-400">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">❌</span>
                </div>
                <div className="font-medium mb-1">Failed to load brands</div>
                <div className="text-sm mb-4">{brandsError.message}</div>
                <button
                  onClick={loadData}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="max-h-[28rem] overflow-y-auto space-y-2 pr-2 pb-6">
                {(Array.isArray(allBrands) ? allBrands : []).map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onPickBrand(b)}
                    className="w-full text-left p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {b.image ? (
                          <img 
                            src={b.image.startsWith('http') ? b.image : `${b.image}`} 
                            alt={b.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-slate-600 dark:text-slate-400 text-sm">🏷️</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {b.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Brand • ID: {b.id}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {/* Extra spacing to ensure last item is fully visible */}
                <div className="h-4"></div>
                {(Array.isArray(allBrands) ? allBrands : []).length === 0 && (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">🏷️</span>
                    </div>
                    <div className="font-medium mb-1">No brands yet</div>
                    <div className="text-sm">Create your first brand using the form on the right</div>
                  </div>
                )}
              </div>
            )}
          </ThemeCard>
        </div>

        {/* RIGHT SIDE - Forms */}
        <div className="xl:w-7/12 w-full space-y-6">
          {/* Popup Alert Dialog */}
          {msg && (
            <ThemeAlert 
              message={msg.text} 
              type={msg.kind} 
              onClose={() => setMsg(null)}
              autoClose={true}
              duration={1000}
            />
          )}

          {/* Quick Actions Toolbar */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  setNewCatName('');
                  setNewCatSlogan('');
                  setNewSubParentId('');
                  setNewSubName('');
                  setNewSubSlogan('');
                  setNewBrandName('');
                  setMsg(null);
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-200"
                title="Clear all forms"
              >
                <span>🧹</span>
                Clear Forms
              </button>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterLevel('all');
                  setSortBy('name');
                }}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-200"
                title="Reset filters"
              >
                <span>🔄</span>
                Reset Filters
              </button>
              <button
                onClick={expandAll}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-200"
                title="Expand all categories"
              >
                <span>📂</span>
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors duration-200"
                title="Collapse all categories"
              >
                <span>📁</span>
                Collapse All
              </button>
            </div>
          </div>

          {/* Add Parent Category */}
          <FormSection title="Add Parent Category" icon="📂" color="primary">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📂</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Parent Category</h3>
              </div>
              <form onSubmit={addCategory} className="space-y-4">
                <div className="space-y-3">
                  <ThemeInput
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Enter parent category name"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      💬 Category Slogan (Optional)
                    </label>
                    <textarea
                      value={newCatSlogan}
                      onChange={(e) => setNewCatSlogan(e.target.value)}
                      placeholder="Browse our stunning range of lighting here at Electro-Store. We have everything you need, from statement pieces with the wow factor, to functional items helping to light the way in your home or garden..."
                      className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <ThemeButton 
                    type="submit" 
                    disabled={busy || !newCatName.trim()} 
                    loading={busy} 
                    variant="primary" 
                    icon="📂"
                    className="whitespace-nowrap min-w-fit flex-shrink-0"
                  >
                    Add Parent
                  </ThemeButton>
                </div>
                {newCatName.trim() && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                    💡 This will create a top-level category that can have child and grandchild categories
                  </div>
                )}
              </form>
            </div>
          </FormSection>

          {/* Add Subcategory */}
          <FormSection title="Add Subcategory" icon="📁" color="success">
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📁</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Subcategory</h3>
              </div>
              <form onSubmit={addSubcategory} className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <ThemeSelect
                    value={newSubParentId}
                    onChange={(e) => setNewSubParentId(e.target.value)}
                    placeholder="Select Parent Category"
                    options={getEligibleParents.map(c => ({
                      value: c.id,
                      label: `${'  '.repeat(c.level)}${c.name} (${c.level_name})`
                    }))}
                    required
                  />
                  <ThemeInput
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Enter subcategory name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    💬 Category Slogan (Optional)
                  </label>
                  <textarea
                    value={newSubSlogan}
                    onChange={(e) => setNewSubSlogan(e.target.value)}
                    placeholder="Browse our stunning range of lighting here at Electro-Store. We have everything you need, from statement pieces with the wow factor, to functional items helping to light the way in your home or garden..."
                    className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    📷 Category Image                     {(() => {
                      const parentCategory = (Array.isArray(allCats) ? allCats : []).find(cat => cat.id === normalizeId(newSubParentId));
                      const willBeGrandchild = parentCategory && parentCategory.level === 1;
                      return willBeGrandchild ? '(Required for grandchild categories)' : '(Optional - typically for grandchild categories)';
                    })()}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewSubImage(e.target.files[0] || null)}
                    className="block w-full text-sm text-slate-500 dark:text-slate-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-emerald-50 file:text-emerald-700
                      hover:file:bg-emerald-100
                      dark:file:bg-emerald-900/20 dark:file:text-emerald-300
                      dark:hover:file:bg-emerald-900/30"
                  />
                  {newSubImage && (
                    <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      Selected: {newSubImage.name}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <ThemeButton 
                    type="submit" 
                    disabled={busy || !newSubParentId || !newSubName.trim() || (() => {
                      const parentCategory = (Array.isArray(allCats) ? allCats : []).find(cat => cat.id === normalizeId(newSubParentId));
                      const willBeGrandchild = parentCategory && parentCategory.level === 1;
                      return willBeGrandchild && !newSubImage;
                    })()} 
                    loading={busy} 
                    variant="success" 
                    icon="📁"
                    className="whitespace-nowrap min-w-fit flex-shrink-0"
                  >
                    Add Subcategory
                  </ThemeButton>
                </div>
                
                {newSubParentId && newSubName.trim() && (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    💡 This will create a subcategory under the selected parent
                  </div>
                )}
              </form>
            </div>
          </FormSection>

          {/* Add Brand */}
          <FormSection title="Add Brand" icon="🏷️" color="warning">
            <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-3xl border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🏷️</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Brand</h3>
              </div>
              <form onSubmit={addBrand} className="space-y-4">
                <div className="flex gap-3">
                  <ThemeInput
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    placeholder="Enter brand name"
                    className="flex-1"
                  />
                  <ThemeButton 
                    type="submit" 
                    disabled={busy} 
                    loading={busy} 
                    variant="warning" 
                    icon="🏷️"
                    className="whitespace-nowrap min-w-fit flex-shrink-0"
                  >
                    Add Brand
                  </ThemeButton>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    🖼️ Brand Logo/Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewBrandImage(e.target.files[0] || null)}
                    className="block w-full text-sm text-slate-500 dark:text-slate-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-orange-50 file:text-orange-700
                      hover:file:bg-orange-100
                      dark:file:bg-orange-900/20 dark:file:text-orange-300
                      dark:hover:file:bg-orange-900/30"
                  />
                  {newBrandImage && (
                    <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                      Selected: {newBrandImage.name}
                    </div>
                  )}
                </div>
              </form>
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl">
                <div className="text-orange-700 dark:text-orange-300 text-sm font-medium">
                  💡 Brands help customers identify and trust your products
                </div>
              </div>
            </div>
          </FormSection>

          {/* Edit or Delete */}
          <FormSection title="Edit or Delete" icon="✏️" color="edit">
            <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">✏️</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Edit or Delete Items</h3>
              </div>
              
              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Select Item Type:</div>
                <div className="flex flex-wrap gap-3">
                  <TypePill selected={editMode === 'category'} onClick={() => { setEditMode('category'); setEditName(''); setEditSlogan(''); setMsg(null); }}>
                    Parent Category
                  </TypePill>
                  <TypePill selected={editMode === 'subcategory'} onClick={() => { setEditMode('subcategory'); setEditName(''); setEditSlogan(''); setMsg(null); }}>
                    Child Category
                  </TypePill>
                  <TypePill selected={editMode === 'grandchild'} onClick={() => { setEditMode('grandchild'); setEditName(''); setEditSlogan(''); setMsg(null); }}>
                    Grandchild Category
                  </TypePill>
                  <TypePill selected={editMode === 'brand'} onClick={() => { setEditMode('brand'); setEditName(''); setEditSlogan(''); setMsg(null); }}>
                    Brand
                  </TypePill>
                </div>
              </div>

              {editMode === 'category' && (
                <div ref={editCategoryRef} className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <ThemeSelect
                      value={editCatId}
                      onChange={(e) => {
                        const id = e.target.value; 
                        setEditCatId(id);
                        const c = (Array.isArray(allCats) ? allCats : []).find(x => String(x.id) === String(id));
                        setEditName(c?.name || '');
                        setEditSlogan(c?.slogan || '');
                      }}
                      placeholder="Select Parent Category"
                      options={parentCats.map(c => ({ value: c.id, label: c.name }))}
                    />
                    <ThemeInput
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="New name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      💬 Category Slogan
                    </label>
                    <textarea
                      value={editSlogan}
                      onChange={(e) => setEditSlogan(e.target.value)}
                      placeholder="Browse our stunning range of lighting here at Electro-Store. We have everything you need, from statement pieces with the wow factor, to functional items helping to light the way in your home or garden..."
                      className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {(editMode === 'subcategory' || editMode === 'grandchild') && (
                <div ref={editMode === 'subcategory' ? editSubcategoryRef : editGrandchildRef} className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <ThemeSelect
                      value={editSubId}
                      onChange={(e) => {
                        const id = e.target.value; 
                        setEditSubId(id);
                        const sc = (Array.isArray(allCats) ? allCats : []).find(x => String(x.id) === String(id));
                        setEditName(sc?.name || '');
                        setEditSlogan(sc?.slogan || '');
                        setEditCurrentImage(sc?.image || null);
                        setEditSubImage(null);
                        // Also update the parent ID for grandchild categories
                        if (editMode === 'grandchild' && sc?.parent) {
                          setEditSubParentId(String(sc.parent));
                        }
                      }}
                      placeholder={`Select ${editMode === 'subcategory' ? 'Child' : 'Grandchild'} Category`}
                      options={(Array.isArray(allCats) ? allCats : []).filter(c => c.level === (editMode === 'subcategory' ? 1 : 2)).map(sc => ({ 
                        value: sc.id, 
                        label: `${sc.name} (${sc.full_path || sc.name})` 
                      }))}
                      // Debug: Log the filtered options
                      onFocus={() => {
                        const filtered = (Array.isArray(allCats) ? allCats : []).filter(c => c.level === (editMode === 'subcategory' ? 1 : 2));
                        console.log('🔍 Filtered categories for', editMode, ':', filtered);
                        console.log('🔍 Current editMode:', editMode);
                        console.log('🔍 Looking for level:', editMode === 'subcategory' ? 1 : 2);
                      }}
                    />
                    <ThemeInput
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="New name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      💬 Category Slogan
                    </label>
                    <textarea
                      value={editSlogan}
                      onChange={(e) => setEditSlogan(e.target.value)}
                      placeholder="Browse our stunning range of lighting here at Electro-Store. We have everything you need, from statement pieces with the wow factor, to functional items helping to light the way in your home or garden..."
                      className="w-full px-4 py-3 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      📷 Category Image {editMode === 'grandchild' && '(Optional for editing existing grandchild categories)'}
                    </label>
                    {editCurrentImage && (
                      <div className="mb-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current image:</div>
                        <div className="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                          <img 
                            src={editCurrentImage.startsWith('http') ? editCurrentImage : `${editCurrentImage}`} 
                            alt="Current category image" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditSubImage(e.target.files[0] || null)}
                      className="block w-full text-sm text-slate-500 dark:text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-amber-50 file:text-amber-700
                        hover:file:bg-amber-100
                        dark:file:bg-amber-900/20 dark:file:text-amber-300
                        dark:hover:file:bg-amber-900/30"
                    />
                    {editSubImage && (
                      <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        New image selected: {editSubImage.name}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {editMode === 'brand' && (
                <div ref={editBrandRef} className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <ThemeSelect
                      value={editBrandId}
                      onChange={(e) => {
                        const id = e.target.value; 
                        setEditBrandId(id);
                        const b = (Array.isArray(allBrands) ? allBrands : []).find(x => String(x.id) === String(id));
                        setEditName(b?.name || '');
                        setEditCurrentImage(b?.image || null);
                        setEditBrandImage(null);
                      }}
                      placeholder="Select Brand"
                      options={(Array.isArray(allBrands) ? allBrands : []).map(b => ({ value: b.id, label: b.name }))}
                    />
                    <ThemeInput
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="New name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      🖼️ Brand Logo/Image
                    </label>
                    {editCurrentImage && (
                      <div className="mb-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current image:</div>
                        <div className="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                          <img 
                            src={editCurrentImage.startsWith('http') ? editCurrentImage : `${editCurrentImage}`} 
                            alt="Current brand image" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditBrandImage(e.target.files[0] || null)}
                      className="block w-full text-sm text-slate-500 dark:text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-amber-50 file:text-amber-700
                        hover:file:bg-amber-100
                        dark:file:bg-amber-900/20 dark:file:text-amber-300
                        dark:hover:file:bg-amber-900/30"
                    />
                    {editBrandImage && (
                      <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        New image selected: {editBrandImage.name}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3 justify-end">
                <ThemeButton 
                  type="button" 
                  onClick={saveEdit} 
                  disabled={busy || (editMode === 'grandchild' && !editSubImage && !editCurrentImage)} 
                  loading={busy} 
                  variant="success" 
                  icon="💾"
                  className="whitespace-nowrap min-w-fit flex-shrink-0"
                >
                  Save Changes
                </ThemeButton>
                <ThemeButton 
                  type="button" 
                  onClick={deleteEdit} 
                  disabled={busy} 
                  loading={busy} 
                  variant="danger" 
                  icon="🗑️"
                  className="whitespace-nowrap min-w-fit flex-shrink-0"
                >
                  Delete
                </ThemeButton>
              </div>
              
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
                <div className="text-amber-700 dark:text-amber-300 text-sm font-medium">
                  ⚠️ Deleting a category will also delete all its subcategories and associated products
                </div>
              </div>
            </div>
          </FormSection>
        </div>
      </div>
    </ThemeLayout>
  );
}

function TypePill({ selected, onClick, children }) {
  const getIcon = () => {
    if (children.includes('Parent')) return '📂';
    if (children.includes('Child')) return '📁';
    if (children.includes('Grandchild')) return '📄';
    if (children.includes('Brand')) return '🏷️';
    return '📝';
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-2xl border-2 px-6 py-3 text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 ${
        selected 
          ? 'border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 shadow-lg' 
          : 'border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 dark:hover:from-amber-900/10 dark:hover:to-orange-900/10 text-slate-700 dark:text-slate-300 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`text-lg transition-transform duration-200 ${
          selected ? 'animate-pulse' : 'group-hover:scale-110'
        }`}>
          {getIcon()}
        </span>
        <span className="whitespace-nowrap">{children}</span>
      </div>
      {selected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
      )}
    </button>
  );
}