import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import { ThemeLayout, ThemeCard, ThemeInput, ThemeButton, ThemeAlert, ThemeSelect, FormSection } from '@shared/theme';
import {
  listBrands, listTopCategories, listSubcategories,
  createCategory, updateCategory, deleteCategory,
  createBrand, updateBrand, deleteBrand,
} from '../../lib/api';
import { api } from '../../lib/api';

// Enhanced tree building function for 3-level hierarchy
function buildHierarchyTree(categories) {
  const byParent = new Map();
  categories.forEach(c => {
    const pid = c.parent ?? c.parent_id ?? null;
    const key = pid || 'root';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  });
  
  const roots = byParent.get('root') || byParent.get(null) || [];
  
  const attach = (node) => ({
    ...node,
    level: node.depth || 0,
    levelName: node.level_name || (node.parent ? 'Child Category' : 'Parent Category'),
    children: (byParent.get(node.id) || []).map(attach),
  });
  
  return roots.map(attach);
}

// Component for rendering individual category items
function CategoryItem({ category, onSelect, depth = 0, isSelected = false, expandedCategories, onToggleExpand }) {
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
                src={category.image} 
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
  // Data state
  const [allCats, setAllCats] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

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
  const [editBrandImage, setEditBrandImage] = useState(null);
  const [editSubImage, setEditSubImage] = useState(null);
  const [editCurrentImage, setEditCurrentImage] = useState(null);

  // UI state
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [userHasCollapsed, setUserHasCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Derived data with filtering and sorting
  const filteredCats = useMemo(() => {
    let filtered = allCats;
    
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
    
    // Apply sorting
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
    console.log('All categories:', allCats.length);
    
    return counts;
  }, [tree, filteredCats, allCats]);
  
  const parentCats = useMemo(() => allCats.filter(c => c.level === 0), [allCats]);
  const childCats = useMemo(() => allCats.filter(c => c.level === 1), [allCats]);
  const grandchildCats = useMemo(() => allCats.filter(c => c.level === 2), [allCats]);

  // Helper function to get categories that can have children
  const getEligibleParents = useMemo(() => {
    return allCats.filter(cat => cat.can_have_children);
  }, [allCats]);

  // Helper function to get subcategories by parent
  const subcatsByParent = useMemo(() => {
    const map = new Map();
    allCats.forEach(c => {
      if (c.parent) {
        if (!map.has(c.parent)) map.set(c.parent, []);
        map.get(c.parent).push(c);
      }
    });
    return map;
  }, [allCats]);

  const loadAll = async () => {
    try {
      // Get ALL categories with hierarchical data
      let allCategories = [];
      let nextUrl = '/admin/categories/';
      
      while (nextUrl) {
        try {
          const catRes = await api.get(nextUrl);
          const categoriesData = catRes.data.results || catRes.data;
          if (Array.isArray(categoriesData)) {
            allCategories = [...allCategories, ...categoriesData];
            nextUrl = catRes.data.next || null;
          } else if (categoriesData) {
            // Handle single object response
            allCategories = [categoriesData];
            nextUrl = null;
          } else {
            // Handle empty response
            nextUrl = null;
          }
        } catch (pageError) {
          // If a specific page fails (like page=2 when it doesn't exist), 
          // stop pagination and use what we have
          console.warn(`Failed to load page ${nextUrl}:`, pageError);
          // Don't break here, just stop pagination
          nextUrl = null;
        }
      }
      
      const cats = Array.isArray(allCategories) ? allCategories.map(c => ({
        id: c.id, 
        name: c.name, 
        slogan: c.slogan || '',
        parent: c.parent ?? null,
        depth: c.depth || 0,
        level: c.level || 0,
        level_name: c.level_name || (c.parent ? 'Child Category' : 'Parent Category'),
        full_path: c.full_path || c.name,
        can_have_children: c.can_have_children !== false,
        children_count: c.children_count || 0,
        children: c.children || []
      })) : [];
      
      // Debug logging
      console.log('Loaded categories from API:', cats.length);
      console.log('Parent categories:', cats.filter(c => c.level === 0));
      console.log('All categories:', cats);
      
      // Only proceed if we have categories from API
      if (cats.length > 0) {
        const brandRes = await listBrands();
        const brands = brandRes.data.results || brandRes.data || [];
        setAllCats(cats);
        setAllBrands(Array.isArray(brands) ? brands : []);
        
        // Save to localStorage as backup
        localStorage.setItem('admin_categories', JSON.stringify(cats));
        localStorage.setItem('admin_brands', JSON.stringify(Array.isArray(brands) ? brands : []));
        return; // Success, exit early
      } else {
        console.warn('No categories loaded from API, falling back to localStorage');
      }
    } catch (err) {
      console.error('Failed to load categories/brands:', err);
      
      let errorMessage = 'Failed to load categories/brands';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You may not have admin permissions.';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check if the server is running correctly.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.response?.status === 0) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setMsg({ kind: 'error', text: errorMessage });
      
      // Load from localStorage as fallback
      const savedCats = localStorage.getItem('admin_categories');
      const savedBrands = localStorage.getItem('admin_brands');
      
      console.log('API failed, loading from localStorage');
      console.log('Saved categories from localStorage:', savedCats ? JSON.parse(savedCats).length : 'none');
      
      if (savedCats) {
        try {
          const parsedCats = JSON.parse(savedCats);
          console.log('Loaded from localStorage:', parsedCats.length, 'categories');
          console.log('Parent categories from localStorage:', parsedCats.filter(c => c.level === 0));
          setAllCats(parsedCats);
        } catch (parseError) {
          console.error('Failed to parse saved categories:', parseError);
          setAllCats([]);
        }
      } else {
        setAllCats([]);
      }
      
      if (savedBrands) {
        try {
          setAllBrands(JSON.parse(savedBrands));
        } catch (parseError) {
          console.error('Failed to parse saved brands:', parseError);
          setAllBrands([]);
        }
      } else {
        setAllBrands([]);
      }
    }
  };

  useEffect(() => { loadAll(); }, []);

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
    console.log('🔧 Expand All clicked - Total categories:', allCats.length);
    const allCategoryIds = allCats.map(cat => cat.id);
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
    if (allCats.length > 0 && expandedCategories.size === 0 && !userHasCollapsed) {
      console.log('🔧 Auto-expanding categories on first load');
      const allCategoryIds = allCats.map(cat => cat.id);
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
    setSelectedCategory(cat);
    setEditMode(cat.level === 0 ? 'category' : cat.level === 1 ? 'subcategory' : 'grandchild');
    
    if (cat.level === 0) {
      setEditCatId(String(cat.id));
    } else if (cat.level === 1) {
      setEditSubParentId(String(cat.parent));
      setEditSubId(String(cat.id));
    } else {
      // Grandchild category
      const parentCat = allCats.find(c => c.id === cat.parent);
      setEditSubParentId(String(parentCat?.parent || ''));
      setEditSubId(String(cat.id));
    }
    
    setEditName(cat.name);
    setEditSlogan(cat.slogan || '');
    setEditCurrentImage(cat.image);
    setEditSubImage(null);
    setMsg(null);
  };

  const onPickBrand = (brand) => {
    setEditMode('brand');
    setEditBrandId(String(brand.id));
    setEditName(brand.name);
    setEditCurrentImage(brand.image);
    setEditBrandImage(null);
    setMsg(null);
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
      await createCategory({ name, slogan });
      await loadAll();
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
      await loadAll();
      setNewSubName('');
      setNewSubSlogan('');
      setNewSubParentId('');
      setNewSubImage(null);
      broadcast();
      setMsg({ kind: 'success', text: 'Subcategory added.' });
    } catch (err) {
      showError(err, 'Failed to add subcategory.');
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
      await loadAll();
      setNewBrandName('');
      setNewBrandImage(null);
      broadcast();
      setMsg({ kind: 'success', text: 'Brand added.' });
    } catch (err) {
      setMsg({ kind: 'error', text: err.uiMessage || 'Failed to add brand.' });
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
        
        const formData = new FormData();
        formData.append('name', editName);
        formData.append('slogan', editSlogan);
        if (editSubImage) {
          formData.append('image', editSubImage);
        }
        
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
      
      await loadAll();
      
      // Update the selected category with the new data
      if (selectedCategory) {
        console.log('Updating selected category:', { name: editName, slogan: editSlogan });
        setSelectedCategory(prev => ({
          ...prev,
          name: editName,
          slogan: editSlogan
        }));
      }
      
      broadcast();
      setMsg({ kind: 'success', text: 'Changes saved.' });
      
      // Reset edit image states
      setEditBrandImage(null);
      setEditSubImage(null);
    } catch (err) { 
      showError(err, 'Failed to save changes.'); 
    } finally { setBusy(false); }
  };

  // === Delete Edit ===
  const deleteEdit = async () => {
    setMsg(null);
    try {
      setBusy(true);
      
      if (editMode === 'category') {
        if (!editCatId) return setMsg({ kind: 'error', text: 'Pick a category to delete.' });
        if (!confirm('Delete Category and all its Subcategories?')) return;
        console.log('Deleting category with ID:', editCatId);
        await deleteCategory(editCatId);
        setEditCatId(''); 
        setEditName('');
      } else if (editMode === 'subcategory' || editMode === 'grandchild') {
        if (!editSubId) return setMsg({ kind: 'error', text: 'Pick a subcategory to delete.' });
        if (!confirm('Delete this Subcategory?')) return;
        console.log('Deleting subcategory with ID:', editSubId);
        await deleteCategory(editSubId);
        setEditSubId(''); 
        setEditName('');
      } else {
        if (!editBrandId) return setMsg({ kind: 'error', text: 'Pick a brand to delete.' });
        if (!confirm('Delete this Brand?')) return;
        console.log('Deleting brand with ID:', editBrandId);
        await deleteBrand(editBrandId);
        setEditBrandId(''); 
        setEditName('');
      }
      
      await loadAll();
      broadcast();
      setMsg({ kind: 'success', text: 'Item deleted successfully.' });
    } catch (err) { 
      console.error('Delete error:', err);
      showError(err, 'Failed to delete item.'); 
    } finally { setBusy(false); }
  };

  return (
    <ThemeLayout>
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
                    loadAll();
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

            {tree.length ? (
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
            <div className="max-h-[28rem] overflow-y-auto space-y-2 pr-2 pb-6">
              {allBrands.map(b => (
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
                          src={b.image} 
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
              {allBrands.length === 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">🏷️</span>
                  </div>
                  <div className="font-medium mb-1">No brands yet</div>
                  <div className="text-sm">Create your first brand using the form on the right</div>
                </div>
              )}
            </div>
          </ThemeCard>
        </div>

        {/* RIGHT SIDE - Forms */}
        <div className="xl:w-7/12 w-full space-y-6">
          {msg && <ThemeAlert message={msg.text} type={msg.kind} />}

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
                    📷 Category Image (Optional - typically for grandchild categories)
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
                    disabled={busy || !newSubParentId || !newSubName.trim()} 
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
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <ThemeSelect
                      value={editCatId}
                      onChange={(e) => {
                        const id = e.target.value; 
                        setEditCatId(id);
                        const c = allCats.find(x => String(x.id) === String(id));
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
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <ThemeSelect
                      value={editSubId}
                      onChange={(e) => {
                        const id = e.target.value; 
                        setEditSubId(id);
                        const sc = allCats.find(x => String(x.id) === String(id));
                        setEditName(sc?.name || '');
                        setEditSlogan(sc?.slogan || '');
                        setEditCurrentImage(sc?.image || null);
                        setEditSubImage(null);
                      }}
                      placeholder={`Select ${editMode === 'subcategory' ? 'Child' : 'Grandchild'} Category`}
                      options={allCats.filter(c => c.level === (editMode === 'subcategory' ? 1 : 2)).map(sc => ({ 
                        value: sc.id, 
                        label: `${sc.name} (${sc.full_path})` 
                      }))}
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
                      📷 Category Image {editMode === 'grandchild' && '(Recommended for grandchild categories)'}
                    </label>
                    {editCurrentImage && (
                      <div className="mb-2">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current image:</div>
                        <div className="w-16 h-16 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden">
                          <img 
                            src={editCurrentImage} 
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
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <ThemeSelect
                      value={editBrandId}
                      onChange={(e) => {
                        const id = e.target.value; 
                        setEditBrandId(id);
                        const b = allBrands.find(x => String(x.id) === String(id));
                        setEditName(b?.name || '');
                        setEditCurrentImage(b?.image || null);
                        setEditBrandImage(null);
                      }}
                      placeholder="Select Brand"
                      options={allBrands.map(b => ({ value: b.id, label: b.name }))}
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
                            src={editCurrentImage} 
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
                  disabled={busy} 
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