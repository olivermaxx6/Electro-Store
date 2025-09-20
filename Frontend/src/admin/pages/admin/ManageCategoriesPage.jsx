import { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import { ThemeLayout, ThemeCard, ThemeInput, ThemeButton, ThemeAlert, ThemeSelect, FormSection } from '@shared/theme';
import {
  listBrands, listTopCategories, listSubcategories,
  createCategory, updateCategory, deleteCategory,
  createBrand, updateBrand, deleteBrand,
} from '../../lib/api';
import { api } from '../../lib/api';

// Use ThemeAlert instead of Toast

function buildTree(categories) {
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
    children: (byParent.get(node.id) || []).map(attach),
  });
  return roots.map(attach);
}

export default function ManageCategoriesPage() {
  // LEFT side data
  const [allCats, setAllCats] = useState([]);
  const [allBrands, setAllBrands] = useState([]);

  // RIGHT side - add forms
  const [newCatName, setNewCatName] = useState('');
  const [newSubParentId, setNewSubParentId] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [newBrandName, setNewBrandName] = useState('');

  // RIGHT side - edit/delete
  const [editMode, setEditMode] = useState('category');
  const [editCatId, setEditCatId] = useState('');
  const [editSubParentId, setEditSubParentId] = useState('');
  const [editSubId, setEditSubId] = useState('');
  const [editBrandId, setEditBrandId] = useState('');
  const [editName, setEditName] = useState('');

  // feedback
  const [msg, setMsg] = useState(null);      // {kind:'success'|'error'|'info', text:string}
  const [busy, setBusy] = useState(false);   // general lock during submit

  // Derived
  const tree = useMemo(() => buildTree(allCats), [allCats]);
  const topCats = useMemo(() => allCats.filter(c => !c.parent), [allCats]);
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
      // Get ALL categories (not just top-level) so subcategories can be created under any category
      // Handle pagination to get all categories
      let allCategories = [];
      let nextUrl = '/api/public/categories/';
      
      while (nextUrl) {
        const catRes = await api.get(nextUrl);
        const categoriesData = catRes.data.results || catRes.data;
        if (Array.isArray(categoriesData)) {
          allCategories = [...allCategories, ...categoriesData];
          nextUrl = catRes.data.next || null;
        } else {
          allCategories = categoriesData;
          nextUrl = null;
        }
      }
      
      const cats = allCategories.map(c => ({
        id: c.id, name: c.name, parent: c.parent ?? null
      }));
      
      const brandRes = await listBrands();
      const brands = brandRes.data.results || brandRes.data;
      setAllCats(cats);
      setAllBrands(brands);
      
      // Save to localStorage as backup
      localStorage.setItem('admin_categories', JSON.stringify(cats));
      localStorage.setItem('admin_brands', JSON.stringify(brands));
    } catch (err) {
      console.error('Failed to load categories/brands:', err);
      
      // Load from localStorage as fallback
      const savedCats = localStorage.getItem('admin_categories');
      const savedBrands = localStorage.getItem('admin_brands');
      
      if (savedCats) {
        setAllCats(JSON.parse(savedCats));
      } else {
        setAllCats([]);
      }
      
      if (savedBrands) {
        setAllBrands(JSON.parse(savedBrands));
      } else {
        setAllBrands([]);
      }
    }
  };

  useEffect(() => { loadAll(); }, []);

  const broadcast = () => window.dispatchEvent(new CustomEvent('taxonomy:updated'));
  
  // Helper functions to save to localStorage
  const saveCategoriesToStorage = (categories) => {
    localStorage.setItem('admin_categories', JSON.stringify(categories));
  };
  
  const saveBrandsToStorage = (brands) => {
    localStorage.setItem('admin_brands', JSON.stringify(brands));
  };

  const onPickCategory = (cat) => {
    setEditMode(cat.parent ? 'subcategory' : 'category');
    if (cat.parent) {
      setEditSubParentId(String(cat.parent));
      setEditSubId(String(cat.id));
    } else {
      setEditCatId(String(cat.id));
    }
    setEditName(cat.name);
    setMsg(null);
  };
  const onPickBrand = (brand) => {
    setEditMode('brand');
    setEditBrandId(String(brand.id));
    setEditName(brand.name);
    setMsg(null);
  };

  const showError = (err, fallback='Something went wrong') => {
    let errorMessage = err?.uiMessage || fallback;
    
    // Handle specific brand deletion errors
    if (err?.response?.status === 400 && errorMessage.includes('PROTECT')) {
      errorMessage = 'Cannot delete brand: There are products using this brand. Please delete or reassign the products first.';
    } else if (err?.response?.status === 400 && errorMessage.includes('brand')) {
      errorMessage = 'Cannot delete brand: This brand is being used by existing products.';
    }
    
    setMsg({ kind: 'error', text: errorMessage });
  };

  const normalizeId = (v) => {
    if (v === undefined || v === null || v === '' || v === 'null') return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  // === Add Category ===
  const addCategory = async (e) => {
    e.preventDefault();
    setMsg(null);
    const name = (newCatName || '').trim();
    if (!name) return setMsg({ kind: 'error', text: 'Please enter a category name.' });
    try {
      setBusy(true);
      await createCategory({ name });
      
      // Refresh data from database instead of updating local state
      await loadAll();
      
      setNewCatName('');
      broadcast();
      setMsg({ kind: 'success', text: 'Category added.' });
    } catch (err) {
      setMsg({ kind: 'error', text: err.uiMessage || 'Failed to add category.' });
    } finally { setBusy(false); }
  };

  // === Add Subcategory ===
  const addSubcategory = async (e) => {
    e.preventDefault();
    setMsg(null);
    const parent = normalizeId(newSubParentId);
    const name = (newSubName || '').trim();
    if (!parent) return setMsg({ kind: 'error', text: 'Please select a category first.' });
    if (!name) return setMsg({ kind: 'error', text: 'Please enter a subcategory name.' });
    try {
      setBusy(true);
      await createCategory({ name, parent });
      
      // Refresh data from database instead of updating local state
      await loadAll();
      
      setNewSubName('');
      broadcast();
      setMsg({ kind: 'success', text: 'Subcategory added.' });
    } catch (err) {
      setMsg({ kind: 'error', text: err.uiMessage || 'Failed to add subcategory.' });
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
      await createBrand({ name });
      
      // Refresh data from database instead of updating local state
      await loadAll();
      
      setNewBrandName('');
      broadcast();
      setMsg({ kind: 'success', text: 'Brand added.' });
    } catch (err) {
      setMsg({ kind: 'error', text: err.uiMessage || 'Failed to add brand.' });
    } finally { setBusy(false); }
  };

  // === Save Edit ===
  const saveEdit = async () => {
    setMsg(null);
    if (!editName.trim()) return setMsg({kind:'error', text:'Please enter a new name.'});
    try {
      setBusy(true);
      if (editMode === 'category') {
        if (!editCatId) return setMsg({kind:'error', text:'Pick a category to edit.'});
        await updateCategory(editCatId, { name: editName });
        
        // Refresh data from database instead of updating local state
        await loadAll();
      } else if (editMode === 'subcategory') {
        if (!editSubId) return setMsg({kind:'error', text:'Pick a subcategory to edit.'});
        await updateCategory(editSubId, { name: editName });
        
        // Refresh data from database instead of updating local state
        await loadAll();
      } else {
        if (!editBrandId) return setMsg({kind:'error', text:'Pick a brand to edit.'});
        await updateBrand(editBrandId, { name: editName });
        
        // Refresh data from database instead of updating local state
        await loadAll();
      }
      broadcast();
      setMsg({ kind: 'success', text: 'Changes saved.' });
    } catch (err) { showError(err, 'Failed to save changes.'); }
    finally { setBusy(false); }
  };

  // === Delete Edit ===
  const deleteEdit = async () => {
    setMsg(null);
    try {
      setBusy(true);
      if (editMode === 'category') {
        if (!editCatId) return setMsg({kind:'error', text:'Pick a category to delete.'});
        if (!confirm('Delete Category and all its Subcategories?')) return;
        await deleteCategory(editCatId);
        
        // Refresh data from database instead of updating local state
        await loadAll();
        setEditCatId(''); setEditName('');
      } else if (editMode === 'subcategory') {
        if (!editSubId) return setMsg({kind:'error', text:'Pick a subcategory to delete.'});
        if (!confirm('Delete this Subcategory?')) return;
        await deleteCategory(editSubId);
        
        // Refresh data from database instead of updating local state
        await loadAll();
        setEditSubId(''); setEditName('');
      } else {
        if (!editBrandId) return setMsg({kind:'error', text:'Pick a brand to delete.'});
        if (!confirm('Delete this Brand?')) return;
        
        console.log('Attempting to delete brand with ID:', editBrandId);
        await deleteBrand(editBrandId);
        
        // Refresh data from database instead of updating local state
        await loadAll();
        setEditBrandId(''); setEditName('');
      }
      broadcast();
      setMsg({ kind: 'success', text: 'Item deleted.' });
    } catch (err) { 
      console.error('Delete error:', err);
      console.error('Error response:', err.response);
      showError(err, 'Failed to delete item.'); 
    }
    finally { setBusy(false); }
  };

  const renderTree = (nodes, depth = 0) => (
    <div className="space-y-2">
      {nodes.map(n => (
        <div key={n.id} className="group">
          <button
            type="button"
            onClick={() => onPickCategory(n)}
            className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 rounded-2xl transition-all duration-300 border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            style={{ marginLeft: Math.min(depth * 20, 80) }}
            title={n.parent ? 'Subcategory' : 'Category'}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                n.parent 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}>
                <span className="text-white text-sm">
                  {n.parent ? '📁' : '📂'}
                </span>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {n.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {n.parent ? 'Subcategory' : 'Category'} • ID: {n.id}
                </div>
              </div>
              {n.children?.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 px-2 py-1 rounded-lg">
                  {n.children.length} sub{n.children.length === 1 ? 'category' : 'categories'}
                </div>
              )}
            </div>
          </button>
          {n.children?.length ? (
            <div className="mt-2 ml-4 border-l-2 border-slate-200 dark:border-slate-600 pl-4">
              {renderTree(n.children, depth + 1)}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );

  return (
    <ThemeLayout>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT */}
          <div className="lg:w-5/12 w-full lg:sticky lg:top-16 h-fit space-y-6">
            <ThemeCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📂</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Categories & Subcategories</h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">Click any item to pre-fill Edit/Delete.</div>
              {tree.length ? renderTree(tree) : (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <div className="text-4xl mb-2">📂</div>
                  <div>No categories yet</div>
                </div>
              )}
            </ThemeCard>

            <ThemeCard>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🏷️</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Brands</h2>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">Click a brand to pre-fill Edit/Delete.</div>
              <div className="space-y-3">
                {allBrands.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => onPickBrand(b)}
                    className="group w-full text-left p-4 bg-slate-50 dark:bg-slate-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 rounded-2xl transition-all duration-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-lg">🏷️</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                          {b.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Brand • ID: {b.id}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
                {allBrands.length === 0 && (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏷️</span>
                    </div>
                    <div className="font-medium">No brands yet</div>
                    <div className="text-sm mt-1">Create your first brand using the form on the right</div>
                  </div>
                )}
              </div>
            </ThemeCard>
          </div>

          {/* RIGHT */}
          <div className="lg:w-7/12 w-full space-y-6">
            {msg && <ThemeAlert message={msg.text} type={msg.kind} />}


            <FormSection title="Add Category" icon="➕" color="primary">
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📂</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Category</h3>
                </div>
                <form onSubmit={addCategory} className="flex gap-3">
                  <ThemeInput
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="Enter category name"
                    className="flex-1"
                  />
                  <ThemeButton 
                    type="submit" 
                    disabled={busy} 
                    loading={busy} 
                    variant="primary" 
                    icon="➕"
                    className="whitespace-nowrap min-w-fit flex-shrink-0"
                  >
                    Add Category
                  </ThemeButton>
                </form>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                  <div className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                    💡 Categories are top-level classifications for your products
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Add Subcategory" icon="📁" color="success">
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📁</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Subcategory</h3>
                </div>
                <form onSubmit={addSubcategory} className="grid gap-4 md:grid-cols-3">
                  <ThemeSelect
                    value={newSubParentId}
                    onChange={(e) => setNewSubParentId(e.target.value)}
                    placeholder="Select Parent Category"
                    options={allCats.map(c => ({
                      value: c.id,
                      label: c.parent ? `  └─ ${c.name}` : c.name
                    }))}
                  />
                  <ThemeInput
                    value={newSubName}
                    onChange={(e) => setNewSubName(e.target.value)}
                    placeholder="Enter subcategory name"
                  />
                  <ThemeButton 
                    type="submit" 
                    disabled={busy} 
                    loading={busy} 
                    variant="success" 
                    icon="📁"
                    className="whitespace-nowrap min-w-fit flex-shrink-0 justify-center"
                  >
                    Add Subcategory
                  </ThemeButton>
                </form>
                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                  <div className="text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                    💡 Subcategories provide more specific organization under main categories
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Add Brand" icon="🏷️" color="warning">
              <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-3xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">🏷️</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Create New Brand</h3>
                </div>
                <form onSubmit={addBrand} className="flex gap-3">
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
                </form>
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl">
                  <div className="text-orange-700 dark:text-orange-300 text-sm font-medium">
                    💡 Brands help customers identify and trust your products
                  </div>
                </div>
              </div>
            </FormSection>

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
                    <TypePill selected={editMode==='category'} onClick={()=>{ setEditMode('category'); setEditName(''); setMsg(null); }}>
                      Category
                    </TypePill>
                    <TypePill selected={editMode==='subcategory'} onClick={()=>{ setEditMode('subcategory'); setEditName(''); setMsg(null); }}>
                      Subcategory
                    </TypePill>
                    <TypePill selected={editMode==='brand'} onClick={()=>{ setEditMode('brand'); setEditName(''); setMsg(null); }}>
                      Brand
                    </TypePill>
                  </div>
                </div>

              {editMode === 'category' && (
                <div className="grid gap-3 md:grid-cols-2">
                  <ThemeSelect
                    value={editCatId}
                    onChange={(e)=>{
                      const id = e.target.value; setEditCatId(id);
                      const c = allCats.find(x=>String(x.id)===String(id));
                      setEditName(c?.name || '');
                    }}
                    placeholder="Select Category"
                    options={topCats.map(c => ({ value: c.id, label: c.name }))}
                  />
                  <ThemeInput
                    value={editName}
                    onChange={(e)=>setEditName(e.target.value)}
                    placeholder="New name"
                  />
                </div>
              )}

              {editMode === 'subcategory' && (
                <div className="grid gap-3 md:grid-cols-3">
                  <ThemeSelect
                    value={editSubParentId}
                    onChange={(e)=>{ setEditSubParentId(e.target.value); setEditSubId(''); setEditName(''); }}
                    placeholder="Select Category"
                    options={topCats.map(c => ({ value: c.id, label: c.name }))}
                  />
                  <ThemeSelect
                    value={editSubId}
                    onChange={(e)=>{
                      const id = e.target.value; setEditSubId(id);
                      const sc = (subcatsByParent.get(Number(editSubParentId)) || []).find(x=>String(x.id)===String(id));
                      setEditName(sc?.name || '');
                    }}
                    disabled={!editSubParentId}
                    placeholder={editSubParentId ? 'Select Subcategory' : 'Pick Category first'}
                    options={(subcatsByParent.get(Number(editSubParentId)) || []).map(sc => ({ value: sc.id, label: sc.name }))}
                  />
                  <ThemeInput
                    value={editName}
                    onChange={(e)=>setEditName(e.target.value)}
                    placeholder="New name"
                  />
                </div>
              )}

              {editMode === 'brand' && (
                <div className="grid gap-3 md:grid-cols-2">
                  <ThemeSelect
                    value={editBrandId}
                    onChange={(e)=>{
                      const id = e.target.value; setEditBrandId(id);
                      const b = allBrands.find(x=>String(x.id)===String(id));
                      setEditName(b?.name || '');
                    }}
                    placeholder="Select Brand"
                    options={allBrands.map(b => ({ value: b.id, label: b.name }))}
                  />
                  <ThemeInput
                    value={editName}
                    onChange={(e)=>setEditName(e.target.value)}
                    placeholder="New name"
                  />
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
          {children === 'Category' ? '📂' : children === 'Subcategory' ? '📁' : '🏷️'}
        </span>
        <span className="whitespace-nowrap">{children}</span>
      </div>
      {selected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
      )}
    </button>
  );
}