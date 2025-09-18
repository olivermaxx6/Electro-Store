import { useEffect, useMemo, useState } from 'react';
import {
  listBrands, listTopCategories, listSubcategories,
  listProducts, getProduct,
  createProduct, updateProduct, deleteProduct,
  uploadProductImages, deleteProductImage,
  authStore
} from '../../lib/api';
import { useCurrency } from '../../store/currencyStore';

const onlyImages = (files) => [...files].filter(f => /\.(jpe?g|png)$/i.test(f.name));
const kvToObject = (rows) => {
  const obj = {}; rows.forEach(({key,value}) => { const k=(key||'').trim(); if(k) obj[k]=value??''; }); return obj;
};
const objectToKv = (obj={}) => Object.entries(obj).map(([k,v])=>({key:k,value:String(v??'')}));

// Calculate discounted price
const calculateDiscountedPrice = (price, discountPercent) => {
  const priceNum = parseFloat(price) || 0;
  const discountNum = parseFloat(discountPercent) || 0;
  const discountAmount = (priceNum * discountNum) / 100;
  return Math.max(0, priceNum - discountAmount);
};

export default function ProductsPage(){
  const { formatAmount } = useCurrency();
  useEffect(()=>{ 
    console.log('[ProductsPage] mounted');
    // Load initial data
    loadTaxonomy();
  },[]);
  
  // taxonomies
  const [brands, setBrands] = useState([]);
  const [topCats, setTopCats] = useState([]);
  const [subcats, setSubcats] = useState([]);

  // CREATE form
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cPrice, setCPrice] = useState('');
  const [cDiscount, setCDiscount] = useState('');
  const [cStock, setCStock] = useState('');
  const [cBrand, setCBrand] = useState('');
  const [cTopCat, setCTopCat] = useState('');
  const [cSubcat, setCSubcat] = useState('');
  const [cSpecs, setCSpecs] = useState([{key:'',value:''}]);
  const [cMainImage, setCMainImage] = useState(null);
  const [cSecondImage, setCSecondImage] = useState(null);
  const [cThirdImage, setCThirdImage] = useState(null);

  // FILTERS
  const [q, setQ] = useState('');
  const [fBrand, setFBrand] = useState('');
  const [fTopCat, setFTopCat] = useState('');
  const [fSubcat, setFSubcat] = useState('');
  const [fSubList, setFSubList] = useState([]);

  // LIST & EDIT
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);

  // EDIT form
  const [eName, setEName] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [ePrice, setEPrice] = useState(0);
  const [eDiscount, setEDiscount] = useState(0);
  const [eStock, setEStock] = useState(0);
  const [eBrand, setEBrand] = useState('');
  const [eTopCat, setETopCat] = useState('');
  const [eSubcat, setESubcat] = useState('');
  const [eSpecs, setESpecs] = useState([{key:'',value:''}]);
  const [eFiles, setEFiles] = useState([]);
  const [eMainImage, setEMainImage] = useState(null);
  const [eSecondImage, setESecondImage] = useState(null);
  const [eThirdImage, setEThirdImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  // load taxonomies
  const loadTaxonomy = async () => {
    try {
      const [b, t] = await Promise.all([listBrands(), listTopCategories()]);
      setBrands(b.data.results || b.data);
      setTopCats(t.data.results || t.data);
    } catch (err) {
      console.error('Failed to load taxonomy from API:', err);
      
      // Load from localStorage (data created in manage-categories page)
      const savedCats = localStorage.getItem('admin_categories');
      const savedBrands = localStorage.getItem('admin_brands');
      
      if (savedBrands) {
        setBrands(JSON.parse(savedBrands));
      } else {
        setBrands([]);
      }
      
      if (savedCats) {
        const allCats = JSON.parse(savedCats);
        // Filter to get only top-level categories (parent is null)
        const topCats = allCats.filter(cat => cat.parent === null);
        setTopCats(topCats);
      } else {
        setTopCats([]);
      }
    }
  };
  const loadSub = async (topId, setter) => {
    if (!topId){ setter([]); return; }
    const parentId = Number(topId); // Ensure it's a number
    try {
      const response = await listSubcategories(parentId);
      const data = response.data;
      const subcatsData = data.results || data;
      setter(subcatsData);
    } catch (err) {
      console.error('Failed to load subcategories from API:', err);
      
      // Load from localStorage (data created in manage-categories page)
      const savedCats = localStorage.getItem('admin_categories');
      if (savedCats) {
        const allCats = JSON.parse(savedCats);
        // Filter to get subcategories for this parent category
        const subcats = allCats.filter(cat => cat.parent === parentId);
        setter(subcats);
      } else {
        setter([]);
      }
    }
  };

  // load products
  const loadList = async () => {
    try {
    const params = {};
    if (q.trim()) params.q = q.trim();
    const catId = fSubcat || fTopCat;
    if (fBrand) params.brand = fBrand;
    if (catId) params.category = catId;
    const { data } = await listProducts(params);
    setProducts(data.results || data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    }
  };

  useEffect(()=>{ loadTaxonomy(); loadList(); }, []);
  useEffect(()=>{ if(fTopCat){ loadSub(fTopCat, setFSubList) } else { setFSubList([]); setFSubcat(''); } }, [fTopCat]);
  useEffect(()=>{ 
    if(cTopCat){ 
      loadSub(cTopCat, setSubcats) 
    } else { 
      setSubcats([]); 
      setCSubcat(''); 
    } 
  }, [cTopCat]);
  useEffect(()=>{ if(eTopCat){ loadSub(eTopCat, setSubcats) } }, [eTopCat]);
  
  // Listen for taxonomy updates from manage-categories page
  useEffect(() => {
    const handleTaxonomyUpdate = () => {
      console.log('Taxonomy updated, reloading...');
      loadTaxonomy();
    };
    
    window.addEventListener('taxonomy:updated', handleTaxonomyUpdate);
    return () => window.removeEventListener('taxonomy:updated', handleTaxonomyUpdate);
  }, []);

  // pick for edit
  const pick = async (p) => {
    setEditing(p);
    setEName(p.name||''); setEDesc(p.description||'');
    setEPrice(p.price??0); setEDiscount(p.discount_rate??0); setEStock(p.stock??0);
    setEBrand(p.brand||'');
    setETopCat(''); setESubcat(p.category||'');
    setESpecs(objectToKv(p.technical_specs||{}));
    setEFiles([]);
    setEMainImage(null); setESecondImage(null); setEThirdImage(null);
  };

  // create handlers
  const addSpec = () => setCSpecs([...cSpecs, {key:'',value:''}]);
  const rmSpec  = (i) => setCSpecs(cSpecs.filter((_,idx)=>idx!==i));
  const chSpec  = (i,f,v) => setCSpecs(cSpecs.map((r,idx)=> idx===i? {...r,[f]:v} : r));
  const onCreateMainImage = (e) => {
    const files = onlyImages(e.target.files);
    setCMainImage(files[0] || null);
  };
  const onCreateSecondImage = (e) => {
    const files = onlyImages(e.target.files);
    setCSecondImage(files[0] || null);
  };
  const onCreateThirdImage = (e) => {
    const files = onlyImages(e.target.files);
    setCThirdImage(files[0] || null);
  };

  // edit image handlers
  const onEditMainImage = (e) => {
    const files = onlyImages(e.target.files);
    setEMainImage(files[0] || null);
  };
  const onEditSecondImage = (e) => {
    const files = onlyImages(e.target.files);
    setESecondImage(files[0] || null);
  };
  const onEditThirdImage = (e) => {
    const files = onlyImages(e.target.files);
    setEThirdImage(files[0] || null);
  };

  const createHandler = async () => {
    setMsg(null);
    console.log('Form state:', { cName, cBrand, cTopCat, cSubcat, cMainImage, cPrice, cStock, cDiscount });
    
    if (!cName.trim()) return setMsg({kind:'error',text:'Name is required.'});
    if (!cBrand) return setMsg({kind:'error',text:'Select a Brand.'});
    const category = cSubcat || cTopCat;
    if (!category) return setMsg({kind:'error',text:'Select Category/Subcategory.'});
    if (!cMainImage) return setMsg({kind:'error',text:'Main product image is required.'});
    
    console.log('Validation passed, proceeding with product creation...');
    
    // Check authentication
    const authData = JSON.parse(localStorage.getItem('auth') || '{}');
    const authToken = authData.access;
    console.log('Auth token exists:', !!authToken);
    
    try {
      setBusy(true);
      const payload = {
        name: cName.trim(),
        description: cDesc.trim(),
        price: Number(cPrice) || 0,
        discount_rate: Number(cDiscount) || 0,
        stock: Number(cStock) || 0,
        brand: Number(cBrand),
        category: Number(category),
        technical_specs: kvToObject(cSpecs),
      };
      console.log('Creating product with payload:', payload);
      const { data: prod } = await createProduct(payload);
      console.log('Product created successfully:', prod);
      const allImages = [cMainImage, cSecondImage, cThirdImage].filter(img => img);
      if (allImages.length) { await uploadProductImages(prod.id, allImages); }
      // reset
      setCName(''); setCDesc(''); setCPrice(''); setCDiscount(''); setCStock('');
      setCBrand(''); setCTopCat(''); setCSubcat('');
      setCSpecs([{key:'',value:''}]); 
      setCMainImage(null); setCSecondImage(null); setCThirdImage(null);
      await loadList();
      setMsg({kind:'success', text:'Product created successfully!'});
      console.log('=== PRODUCT CREATION SUCCESS ===');
    } catch(err){
      console.error('=== PRODUCT CREATION ERROR ===');
      console.error('Error object:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.message);
      
      // Handle token validation errors
      if (err.response?.status === 401) {
        console.log('Authentication error detected');
        const errorMessage = 'Authentication failed. Please log in again.';
        setMsg({kind:'error', text: errorMessage});
        return;
      }
      
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.uiMessage || err.message || 'Failed to create product.';
      setMsg({kind:'error', text: errorMessage});
    } finally { 
      setBusy(false);
      console.log('=== PRODUCT CREATION COMPLETE ===');
    }
  };

  // edit handlers
  const addESpec = () => setESpecs([...eSpecs, {key:'',value:''}]);
  const rmESpec  = (i) => setESpecs(eSpecs.filter((_,idx)=>idx!==i));
  const chESpec  = (i,f,v) => setESpecs(eSpecs.map((r,idx)=> idx===i? {...r,[f]:v} : r));
  const onEditFiles = (e) => setEFiles(onlyImages(e.target.files));

  const saveHandler = async () => {
    if(!editing) return;
    setMsg(null);
    try{
      setBusy(true);
      const category = eSubcat || eTopCat || editing.category;
      const payload = {
        name: eName.trim(),
        description: eDesc.trim(),
        price: Number(ePrice),
        discount_rate: Number(eDiscount) || 0,
        stock: Number(eStock),
        brand: eBrand ? Number(eBrand) : null,
        category: Number(category),
        technical_specs: kvToObject(eSpecs),
      };
      await updateProduct(editing.id, payload);
      
      // Handle image uploads
      const allImages = [eMainImage, eSecondImage, eThirdImage].filter(img => img);
      if (allImages.length) {
        await uploadProductImages(editing.id, allImages);
      }
      if (eFiles.length) await uploadProductImages(editing.id, eFiles);
      const fresh = (await getProduct(editing.id)).data;
      setEditing(fresh);
      await loadList();
      setMsg({kind:'success', text:'Product updated.'});
    } catch(err){
      setMsg({kind:'error', text: err.uiMessage || 'Failed to save product.'});
    } finally { setBusy(false) }
  };

  const deleteHandler = async () => {
    if(!editing) return;
    if(!confirm('Delete this product?')) return;
    setMsg(null);
    try {
      setBusy(true);
      await deleteProduct(editing.id);
      setEditing(null);
      await loadList();
      setMsg({kind:'success', text:'Product deleted.'});
    } catch(err){
      setMsg({kind:'error', text: err.uiMessage || 'Failed to delete product.'});
    } finally { setBusy(false) }
  };

  const removeImage = async (imgId) => {
    if(!editing) return;
    await deleteProductImage(editing.id, imgId);
    const fresh = (await getProduct(editing.id)).data;
    setEditing(fresh);
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
        {/* Add Product */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create Product</h2>
          </div>
          {msg && <div className={`rounded-2xl border-2 px-4 py-3 mb-6 text-sm font-medium shadow-sm ${msg.kind==='error'?'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200':'border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-200'}`}>{msg.text}</div>}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Product Name</label>
              <input 
                placeholder="Enter product name" 
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200" 
                value={cName} 
                onChange={e=>setCName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Price</label>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                placeholder="0.00" 
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200" 
                value={cPrice} 
                onChange={e=>setCPrice(e.target.value)} 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
              <textarea 
                placeholder="Enter product description" 
                rows={3} 
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 resize-none" 
                value={cDesc} 
                onChange={e=>setCDesc(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Stock Quantity</label>
              <input 
                type="number" 
                min="0" 
                placeholder="0" 
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200" 
                value={cStock} 
                onChange={e=>setCStock(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Brand</label>
              <select 
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200" 
                value={cBrand} 
                onChange={e=>setCBrand(e.target.value)}
              >
                <option value="">Select Brand</option>
              {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select 
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200" 
                value={cTopCat} 
                onChange={e=>{ setCTopCat(e.target.value); setCSubcat(''); }}
              >
                <option value="">Select Category</option>
              {topCats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Subcategory</label>
              <select 
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                value={cSubcat} 
                onChange={e=>setCSubcat(e.target.value)} 
                disabled={!cTopCat}
              >
                <option value="">{cTopCat ? 'Select Subcategory' : 'Select a category first'}</option>
              {subcats.map(sc=><option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💰</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Pricing & Discounts</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Discount Rate (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.01" 
                  placeholder="0.00" 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-green-500 dark:focus:border-green-400 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all duration-200" 
                  value={cDiscount} 
                  onChange={e=>setCDiscount(e.target.value)} 
                />
              </div>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Final Price</label>
                <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatAmount(calculateDiscountedPrice(cPrice, cDiscount))}
                  </div>
                  {cDiscount > 0 && (
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      💰 You save {formatAmount((parseFloat(cPrice) || 0) - calculateDiscountedPrice(cPrice, cDiscount))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-3xl border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Technical Specifications</h3>
            </div>
            <div className="space-y-4">
              {cSpecs.map((row,idx)=>(
                <div key={idx} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Specification Key</label>
                    <input 
                      placeholder="e.g., RAM, Storage, Color" 
                      className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200" 
                      value={row.key} 
                      onChange={e=>chSpec(idx,'key',e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Value</label>
                    <input 
                      placeholder="e.g., 8GB, 256GB, Black" 
                      className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200" 
                      value={row.value} 
                      onChange={e=>chSpec(idx,'value',e.target.value)} 
                    />
                  </div>
                  <button 
                    type="button" 
                    className="h-12 px-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl" 
                    onClick={()=>rmSpec(idx)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                className="w-full border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-2xl px-4 py-4 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 font-semibold flex items-center justify-center gap-2" 
                onClick={addSpec}
              >
                <span className="text-lg">➕</span>
                Add New Specification
              </button>
            </div>
          </div>

          {/* Images */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📸</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Product Images</h3>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {/* Main Product Image */}
              <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-6 text-center bg-white/50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-lg">📷</span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Main Product Image</div>
                <div className="text-red-500 text-sm font-medium mb-4">Required *</div>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png" 
                  onChange={onCreateMainImage}
                  className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                />
                {cMainImage && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl">
                    <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                      <span>✓</span>
                      <span className="text-sm">{cMainImage.name}</span>
                    </div>
                  </div>
                )}
                {!cMainImage && (
                  <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                    No file chosen
                  </div>
                )}
              </div>

              {/* Second Product Image */}
              <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-6 text-center bg-white/50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-lg">🖼️</span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Second Product Image</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">Optional</div>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png" 
                  onChange={onCreateSecondImage}
                  className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                />
                {cSecondImage && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl">
                    <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                      <span>✓</span>
                      <span className="text-sm">{cSecondImage.name}</span>
                    </div>
                  </div>
                )}
                {!cSecondImage && (
                  <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                    No file chosen
                  </div>
                )}
              </div>

              {/* Third Product Image */}
              <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-6 text-center bg-white/50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-lg">🎨</span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Third Product Image</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">Optional</div>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png" 
                  onChange={onCreateThirdImage}
                  className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                />
                {cThirdImage && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl">
                    <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                      <span>✓</span>
                      <span className="text-sm">{cThirdImage.name}</span>
                    </div>
                  </div>
                )}
                {!cThirdImage && (
                  <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                    No file chosen
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
              <div className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                📁 Images will be saved in: <span className="font-semibold">Backend\media\Assets\images\products\Selling products/</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={createHandler} 
              disabled={busy} 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
            >
              {busy ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating Product...
                </>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  Create Product
                </>
              )}
            </button>
          </div>
        </section>

        {/* Manage Products */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📋</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manage Products</h2>
          </div>

          {/* Filters */}
          <div className="p-6 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-700 dark:to-slate-600 rounded-3xl border border-slate-200 dark:border-slate-600">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">🔍</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Search & Filter</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Search Products</label>
                <input 
                  placeholder="Search by name, description..." 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200" 
                  value={q} 
                  onChange={e=>setQ(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Brand</label>
                <select 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200" 
                  value={fBrand} 
                  onChange={e=>setFBrand(e.target.value)}
                >
              <option value="">All brands</option>
              {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200" 
                  value={fTopCat} 
                  onChange={e=>{ setFTopCat(e.target.value); setFSubcat(''); }}
                >
              <option value="">All categories</option>
              {topCats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Subcategory</label>
                <select 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                  value={fSubcat} 
                  onChange={e=>setFSubcat(e.target.value)} 
                  disabled={!fTopCat}
                >
              <option value="">{fTopCat ? 'All subcategories' : 'Select a category first'}</option>
              {fSubList.map(sc=><option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
          </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={loadList} 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <span className="text-lg">🔍</span>
                Apply Filters
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">📦</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Product List</h3>
              <div className="ml-auto text-sm text-slate-600 dark:text-slate-400">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {products.map(p=>(
                <button 
                  key={p.id} 
                  onClick={()=>pick(p)} 
                  className="group text-left border-2 border-slate-200 dark:border-slate-600 rounded-3xl p-6 bg-white dark:bg-slate-700 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-lg">📦</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">ID: #{p.id}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Stock: {p.stock}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="font-bold text-slate-800 dark:text-slate-100 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {p.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {p.description || 'No description available'}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatAmount(p.price)}
                      </div>
                      {p.discount_rate > 0 && (
                        <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg text-xs font-semibold">
                          -{p.discount_rate}%
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Brand {p.brand ? `#${p.brand}` : 'None'}</span>
                      <span>Category #{p.category}</span>
                    </div>
                  </div>
              </button>
            ))}
              {products.length===0 && (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📦</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">No products found</div>
                  <div className="text-slate-500 dark:text-slate-500 text-sm mt-1">Try adjusting your search filters</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Edit Product */}
        {editing && (
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">✏️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Product</h2>
              <div className="ml-auto text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-xl">
                {editing.name}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Product Name</label>
                <input 
                  placeholder="Enter product name" 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200" 
                  value={eName} 
                  onChange={e=>setEName(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Price</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="0.00" 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200" 
                  value={ePrice} 
                  onChange={e=>setEPrice(e.target.value)} 
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea 
                  placeholder="Enter product description" 
                  rows={3} 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200 resize-none" 
                  value={eDesc} 
                  onChange={e=>setEDesc(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Discount Rate (%)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.01" 
                  placeholder="0.00" 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200" 
                  value={eDiscount} 
                  onChange={e=>setEDiscount(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Final Price</label>
                <div className="border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30">
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {formatAmount(calculateDiscountedPrice(ePrice, eDiscount))}
                  </div>
                  {eDiscount > 0 && (
                    <div className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      💰 You save {formatAmount((parseFloat(ePrice) || 0) - calculateDiscountedPrice(ePrice, eDiscount))}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Stock Quantity</label>
                <input 
                  type="number" 
                  min="0" 
                  placeholder="0" 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200" 
                  value={eStock} 
                  onChange={e=>setEStock(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Brand</label>
                <select 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200" 
                  value={eBrand} 
                  onChange={e=>setEBrand(e.target.value)}
                >
                  <option value="">Select Brand</option>
                {brands.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                <select 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200" 
                  value={eTopCat} 
                  onChange={e=>{ setETopCat(e.target.value); setESubcat(''); }}
                >
                  <option value="">Select Category</option>
                {topCats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Subcategory</label>
                <select 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                  value={eSubcat} 
                  onChange={e=>setESubcat(e.target.value)} 
                  disabled={!eTopCat && !editing.category}
                >
                  <option value="">{eTopCat ? 'Select Subcategory' : 'Keep existing or pick a Category'}</option>
                {subcats.map(sc=><option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-3xl border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">⚙️</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Technical Specifications</h3>
              </div>
              <div className="space-y-4">
                {eSpecs.map((row,idx)=>(
                  <div key={idx} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Specification Key</label>
                      <input 
                        placeholder="e.g., RAM, Storage, Color" 
                        className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200" 
                        value={row.key} 
                        onChange={e=>chESpec(idx,'key',e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Value</label>
                      <input 
                        placeholder="e.g., 8GB, 256GB, Black" 
                        className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 transition-all duration-200" 
                        value={row.value} 
                        onChange={e=>chESpec(idx,'value',e.target.value)} 
                      />
                    </div>
                    <button 
                      type="button" 
                      className="h-12 px-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl" 
                      onClick={()=>rmESpec(idx)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="w-full border-2 border-dashed border-orange-300 dark:border-orange-600 rounded-2xl px-4 py-4 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 font-semibold flex items-center justify-center gap-2" 
                  onClick={addESpec}
                >
                  <span className="text-lg">➕</span>
                  Add New Specification
                </button>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📸</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Product Images</h3>
              </div>
              
              {/* Current Images */}
              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Current Images</div>
                <div className="flex flex-wrap gap-4">
                {editing.images?.map(img=>(
                    <div key={img.id} className="relative group">
                      <div className="w-32 h-32 border-2 border-slate-200 dark:border-slate-600 rounded-2xl overflow-hidden bg-white dark:bg-slate-700 shadow-lg">
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <img src={img.image} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <button 
                        type="button" 
                        onClick={()=>removeImage(img.id)} 
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(!editing.images || editing.images.length===0) && (
                    <div className="w-32 h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-700">
                      <div className="text-slate-500 dark:text-slate-400 text-sm text-center">
                        No images<br />yet
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* New Image Uploads */}
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Add New Images</div>
              <div className="grid gap-6 md:grid-cols-3">
                {/* Main Product Image */}
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-6 text-center bg-white/50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-lg">📷</span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Main Product Image</div>
                  <div className="text-red-500 text-sm font-medium mb-4">Required *</div>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png" 
                    onChange={onEditMainImage}
                    className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                  />
                  {eMainImage && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl">
                      <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                        <span>✓</span>
                        <span className="text-sm">{eMainImage.name}</span>
                      </div>
                    </div>
                  )}
                  {!eMainImage && (
                    <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                      No file chosen
                    </div>
                  )}
                </div>

                {/* Second Product Image */}
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-6 text-center bg-white/50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-lg">🖼️</span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Second Product Image</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">Optional</div>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png" 
                    onChange={onEditSecondImage}
                    className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                  />
                  {eSecondImage && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl">
                      <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                        <span>✓</span>
                        <span className="text-sm">{eSecondImage.name}</span>
                      </div>
                    </div>
                  )}
                  {!eSecondImage && (
                    <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                      No file chosen
                    </div>
                  )}
                </div>

                {/* Third Product Image */}
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-6 text-center bg-white/50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-lg">🎨</span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Third Product Image</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">Optional</div>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png" 
                    onChange={onEditThirdImage}
                    className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                  />
                  {eThirdImage && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl">
                      <div className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                        <span>✓</span>
                        <span className="text-sm">{eThirdImage.name}</span>
                      </div>
                    </div>
                  )}
                  {!eThirdImage && (
                    <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                      No file chosen
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <div className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                  📁 New images will be saved in: <span className="font-semibold">Backend\media\Assets\images\products\Selling products\</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4 justify-end">
              <button 
                onClick={saveHandler} 
                disabled={busy} 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
              >
                {busy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span className="text-lg">💾</span>
                    Save Changes
                  </>
                )}
              </button>
              <button 
                onClick={deleteHandler} 
                disabled={busy} 
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
              >
                {busy ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <span className="text-lg">🗑️</span>
                    Delete Product
                  </>
                )}
              </button>
            </div>
          </section>
        )}
      </div>
  );
}