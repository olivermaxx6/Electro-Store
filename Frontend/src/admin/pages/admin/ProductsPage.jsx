import { useEffect, useMemo, useState, useRef } from 'react';
import {
  listBrands, listTopCategories, listSubcategories,
  listProducts, getProduct,
  createProduct, updateProduct, deleteProduct,
  uploadProductImages, deleteProductImage, setMainProductImage,
  authStore
} from '../../lib/api';
import { useCurrency } from '../../store/currencyStore';
import { ThemeAlert } from '@theme';
import { useOptimizedData } from '../../hooks/useOptimizedData';

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
  
  // Simple data for products
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
    refresh: refreshProducts,
    addItem: addProductOptimistic,
    updateItem: updateProductOptimistic,
    removeItem: removeProductOptimistic
  } = useOptimizedData('products', () => listProducts());
  
  // Simple data for brands
  const {
    data: brandsRaw,
    loading: brandsLoading,
    refresh: refreshBrands
  } = useOptimizedData('brands', () => listBrands());
  
  // Ensure brands is always an array
  const brands = Array.isArray(brandsRaw) ? brandsRaw : (brandsRaw?.data?.results || brandsRaw?.data || []);
  
  // Simple data for categories
  const {
    data: topCatsRaw,
    loading: categoriesLoading,
    refresh: refreshCategories
  } = useOptimizedData('categories', () => listTopCategories());
  
  // Ensure topCats is always an array
  const topCats = Array.isArray(topCatsRaw) ? topCatsRaw : (topCatsRaw?.data?.results || topCatsRaw?.data || []);

  // CREATE form
  const [cName, setCName] = useState('');
  const [cDesc, setCDesc] = useState('');
  const [cPrice, setCPrice] = useState('');
  const [cDiscount, setCDiscount] = useState('');
  const [cStock, setCStock] = useState('');
  const [cBrand, setCBrand] = useState('');
  const [cTopCat, setCTopCat] = useState('');
  const [cSubcat, setCSubcat] = useState('');
  const [cGrandchildCat, setCGrandchildCat] = useState('');
  const [cSpecs, setCSpecs] = useState([{key:'',value:''}]);
  const [cImages, setCImages] = useState([]);
  const [cMainImage, setCMainImage] = useState(null);
  const [cIsNewArrival, setCIsNewArrival] = useState(false);
  const [cIsTopSelling, setCIsTopSelling] = useState(false);

  // FILTERS
  const [q, setQ] = useState('');
  const [fBrand, setFBrand] = useState('');
  const [fTopCat, setFTopCat] = useState('');
  const [fSubcat, setFSubcat] = useState('');
  const [fGrandchildCat, setFGrandchildCat] = useState('');
  const [fSubList, setFSubList] = useState([]);
  const [fGrandchildList, setFGrandchildList] = useState([]);
  
  // Subcategories and grandchild categories for create/edit forms
  const [subcats, setSubcats] = useState([]);
  const [grandchildCats, setGrandchildCats] = useState([]);

  // LIST & EDIT
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
  const [eGrandchildCat, setEGrandchildCat] = useState('');
  const [eSpecs, setESpecs] = useState([{key:'',value:''}]);
  const [eFiles, setEFiles] = useState([]);
  const [eImages, setEImages] = useState([]);
  const [eMainImage, setEMainImage] = useState(null);
  const [eIsNewArrival, setEIsNewArrival] = useState(false);
  const [eIsTopSelling, setEIsTopSelling] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  // Refs for scroll targets
  const createProductRef = useRef(null);
  const editProductRef = useRef(null);

  // Real-time refresh function
  const refreshData = async () => {
    try {
      await refreshProducts();
      await refreshBrands();
      await refreshCategories();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  // Scroll to section function
  const scrollToSection = (section) => {
    setTimeout(() => {
      let targetRef = null;
      switch (section) {
        case 'create':
          targetRef = createProductRef.current;
          break;
        case 'edit':
          targetRef = editProductRef.current;
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
    }, 100);
  };

  // load taxonomies
  const loadTaxonomy = async () => {
    try {
      const [b, t] = await Promise.all([listBrands(), listTopCategories()]);
      // Use the data from useSimpleResource hooks instead of local state
      await refreshBrands();
      await refreshCategories();
    } catch (err) {
      console.error('Failed to load taxonomy from API:', err);
      
      // Load from localStorage (data created in manage-categories page)
      const savedCats = localStorage.getItem('admin_categories');
      const savedBrands = localStorage.getItem('admin_brands');
      
      // Note: We can't set brands/topCats directly since they're managed by useSimpleResource
      // The localStorage fallback will be handled by the API calls in the hooks
    }
  };
  const loadSub = async (topId, setter) => {
    if (!topId){ setter([]); return; }
    const parentId = Number(topId); // Ensure it's a number
    try {
      const response = await listSubcategories(parentId);
      const data = response;
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

  const loadGrandchild = async (subId, setter) => {
    if (!subId){ setter([]); return; }
    const parentId = Number(subId); // Ensure it's a number
    try {
      const response = await listSubcategories(parentId);
      const data = response;
      const grandchildData = data.results || data;
      setter(grandchildData);
    } catch (err) {
      console.error('Failed to load grandchild categories from API:', err);
      
      // Load from localStorage (data created in manage-categories page)
      const savedCats = localStorage.getItem('admin_categories');
      if (savedCats) {
        const allCats = JSON.parse(savedCats);
        // Filter to get grandchild categories for this subcategory
        const grandchildCats = allCats.filter(cat => cat.parent === parentId);
        setter(grandchildCats);
      } else {
        setter([]);
      }
    }
  };

  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = [...products];
    
    // Apply search filter
    if (q.trim()) {
      const searchTerm = q.toLowerCase();
      filtered = filtered.filter(product => 
        product.name?.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply brand filter
    if (fBrand) {
      filtered = filtered.filter(product => product.brand === parseInt(fBrand));
    }
    
    // Apply category filter
    const catId = fGrandchildCat || fSubcat || fTopCat;
    if (catId) {
      filtered = filtered.filter(product => product.category === parseInt(catId));
    }
    
    return filtered;
  }, [products, q, fBrand, fTopCat, fSubcat, fGrandchildCat]);

  useEffect(()=>{ loadTaxonomy(); }, []);
  useEffect(()=>{ if(fTopCat){ loadSub(fTopCat, setFSubList) } else { setFSubList([]); setFSubcat(''); setFGrandchildCat(''); setFGrandchildList([]); } }, [fTopCat]);
  useEffect(()=>{ if(fSubcat){ loadGrandchild(fSubcat, setFGrandchildList) } else { setFGrandchildList([]); setFGrandchildCat(''); } }, [fSubcat]);
  useEffect(()=>{ 
    if(cTopCat){ 
      loadSub(cTopCat, setSubcats) 
    } else { 
      setSubcats([]); 
      setCSubcat(''); 
      setCGrandchildCat('');
      setGrandchildCats([]);
    } 
  }, [cTopCat]);
  useEffect(()=>{ if(cSubcat){ loadGrandchild(cSubcat, setGrandchildCats) } else { setGrandchildCats([]); setCGrandchildCat(''); } }, [cSubcat]);
  useEffect(()=>{ if(eTopCat){ loadSub(eTopCat, setSubcats) } }, [eTopCat]);
  useEffect(()=>{ if(eSubcat){ loadGrandchild(eSubcat, setGrandchildCats) } else { setGrandchildCats([]); setEGrandchildCat(''); } }, [eSubcat]);
  
  // Load subcategories when editing and top category is set
  useEffect(() => {
    if (eTopCat && editing) {
      loadSub(eTopCat, setSubcats);
    }
  }, [eTopCat, editing]);
  
  // Load grandchild categories when editing and subcategory is set
  useEffect(() => {
    if (eSubcat && editing) {
      loadGrandchild(eSubcat, setGrandchildCats);
    } else if (editing) {
      setGrandchildCats([]);
    }
  }, [eSubcat, editing]);
  
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
    
    // Resolve category hierarchy properly
    const resolveCategoryHierarchy = (categoryId) => {
      if (!categoryId) return { topCat: '', subcat: '', grandchildCat: '' };
      
      // Find the category in our loaded taxonomy
      const findCategoryInList = (categories, id) => {
        for (const cat of categories) {
          if (cat.id === id) return cat;
          if (cat.children) {
            for (const subcat of cat.children) {
              if (subcat.id === id) return { parent: cat, category: subcat };
              if (subcat.children) {
                for (const grandchild of subcat.children) {
                  if (grandchild.id === id) return { parent: cat, subparent: subcat, category: grandchild };
                }
              }
            }
          }
        }
        return null;
      };
      
      const result = findCategoryInList(topCats, categoryId);
      if (!result) return { topCat: '', subcat: '', grandchildCat: '' };
      
      if (result.category && result.subparent) {
        // It's a grandchild category
        return { 
          topCat: result.parent.id, 
          subcat: result.subparent.id, 
          grandchildCat: result.category.id 
        };
      } else if (result.category && result.parent) {
        // It's a subcategory
        return { 
          topCat: result.parent.id, 
          subcat: result.category.id, 
          grandchildCat: '' 
        };
      } else if (result.id) {
        // It's a top-level category
        return { 
          topCat: result.id, 
          subcat: '', 
          grandchildCat: '' 
        };
      }
      
      return { topCat: '', subcat: '', grandchildCat: '' };
    };
    
    const categoryHierarchy = resolveCategoryHierarchy(p.category);
    setETopCat(categoryHierarchy.topCat);
    setESubcat(categoryHierarchy.subcat);
    setEGrandchildCat(categoryHierarchy.grandchildCat);
    
    setESpecs(objectToKv(p.technical_specs||{}));
    setEIsNewArrival(p.isNew||false);
    setEIsTopSelling(p.is_top_selling||false);
    setEFiles([]);
    setEImages([]);
    setEMainImage(null); // Reset main image selection
    
    // Scroll to edit section
    scrollToSection('edit');
  };

  // create handlers
  const addSpec = () => setCSpecs([...cSpecs, {key:'',value:''}]);
  const rmSpec  = (i) => setCSpecs(cSpecs.filter((_,idx)=>idx!==i));
  const chSpec  = (i,f,v) => setCSpecs(cSpecs.map((r,idx)=> idx===i? {...r,[f]:v} : r));
  const onCreateImages = (e) => {
    const files = onlyImages(e.target.files);
    setCImages(prev => [...prev, ...files]);
  };
  
  const removeCreateImage = (index) => {
    setCImages(prev => prev.filter((_, i) => i !== index));
  };

  // edit image handlers
  const onEditImages = (e) => {
    const files = onlyImages(e.target.files);
    setEImages(prev => [...prev, ...files]);
  };
  
  const removeEditImage = (index) => {
    setEImages(prev => prev.filter((_, i) => i !== index));
  };

  const createHandler = async () => {
    setMsg(null);
    console.log('Form state:', { cName, cBrand, cTopCat, cSubcat, cImages, cPrice, cStock, cDiscount });
    
    if (!cName.trim()) return setMsg({kind:'error',text:'Name is required.'});
    if (!cBrand) return setMsg({kind:'error',text:'Select a Brand.'});
    const category = cGrandchildCat || cSubcat || cTopCat;
    if (!category) return setMsg({kind:'error',text:'Select Category/Subcategory/Grandchild Category.'});
    if (!cMainImage && cImages.length === 0) return setMsg({kind:'error',text:'Main image is required. Please select a main image or upload at least one image.'});
    
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
        isNew: cIsNewArrival,
        is_top_selling: cIsTopSelling,
      };
      console.log('Creating product with payload:', payload);
      const prod = await createProduct(payload);
      console.log('Product created successfully:', prod);
      
      // Upload main image first if provided
      if (cMainImage && cMainImage instanceof File) {
        try {
          await uploadProductImages(prod.id, [cMainImage]);
          // Get the uploaded image and set it as main
          const freshProduct = await getProduct(prod.id);
          if (freshProduct.images && freshProduct.images.length > 0) {
            const mainImage = freshProduct.images[freshProduct.images.length - 1]; // Last uploaded image
            await setMainProductImage(prod.id, mainImage.id);
          }
        } catch (imageErr) {
          console.error('[ProductsPage] Failed to upload main image:', imageErr);
          
          // Handle specific error types
          if (imageErr.response?.data?.error_type === 'duplicate_image') {
            setMsg({ 
              kind: 'error', 
              text: 'Duplicate Image: This image already exists for this product. Please upload a different image.' 
            });
          } else {
            setMsg({ 
              kind: 'error', 
              text: `Failed to upload main image: ${imageErr.response?.data?.detail || imageErr.message}` 
            });
          }
          // Don't fail the entire operation if image upload fails
        }
      }
      
      // Upload additional images if provided
      if (cImages.length > 0) { 
        try {
          // Filter out any invalid files
          const validImages = cImages.filter(img => img && img instanceof File);
          if (validImages.length > 0) {
            await uploadProductImages(prod.id, validImages);
            // If no main image was set and we uploaded additional images, set the first one as main
            if (!cMainImage) {
              const freshProduct = await getProduct(prod.id);
              if (freshProduct.images && freshProduct.images.length > 0) {
                const firstImage = freshProduct.images[0];
                await setMainProductImage(prod.id, firstImage.id);
              }
            }
          }
        } catch (imageErr) {
          console.error('[ProductsPage] Failed to upload additional images:', imageErr);
          
          // Handle specific error types
          if (imageErr.response?.data?.error_type === 'duplicate_image') {
            setMsg({ 
              kind: 'error', 
              text: 'Duplicate Image: One or more images already exist for this product. Please upload different images.' 
            });
          } else {
            setMsg({ 
              kind: 'error', 
              text: `Failed to upload additional images: ${imageErr.response?.data?.detail || imageErr.message}` 
            });
          }
          // Don't fail the entire operation if image upload fails
        }
      }
      
      // reset
      setCName(''); setCDesc(''); setCPrice(''); setCDiscount(''); setCStock('');
      setCBrand(''); setCTopCat(''); setCSubcat(''); setCGrandchildCat('');
      setCSpecs([{key:'',value:''}]); 
      setCImages([]);
      setCMainImage(null);
      await refreshData();
      setMsg({kind:'success', text:'Product created successfully!'});
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
      const category = eGrandchildCat || eSubcat || eTopCat || editing.category;
      const payload = {
        name: eName.trim(),
        description: eDesc.trim(),
        price: Number(ePrice),
        discount_rate: Number(eDiscount) || 0,
        stock: Number(eStock),
        brand: eBrand ? Number(eBrand) : null,
        category: Number(category),
        technical_specs: kvToObject(eSpecs),
        isNew: eIsNewArrival,
        is_top_selling: eIsTopSelling,
      };
      await updateProduct(editing.id, payload);
      
      // Handle main image upload first if provided
      if (eMainImage && eMainImage instanceof File) {
        console.log('[ProductsPage] Uploading main image:', eMainImage.name, eMainImage.size);
        try {
          await uploadProductImages(editing.id, [eMainImage]);
          // Get the uploaded image and set it as main
          const freshProduct = await getProduct(editing.id);
          if (freshProduct.images && freshProduct.images.length > 0) {
            const mainImage = freshProduct.images[freshProduct.images.length - 1]; // Last uploaded image
            await setMainProductImage(editing.id, mainImage.id);
          }
        } catch (imageErr) {
          console.error('[ProductsPage] Failed to upload main image:', imageErr);
          
          // Handle specific error types
          if (imageErr.response?.data?.error_type === 'duplicate_image') {
            setMsg({ 
              kind: 'error', 
              text: 'Duplicate Image: This image already exists for this product. Please upload a different image.' 
            });
          } else {
            setMsg({ 
              kind: 'error', 
              text: `Failed to upload main image: ${imageErr.response?.data?.detail || imageErr.message}` 
            });
          }
          // Don't fail the entire operation if image upload fails
        }
      } else {
        console.log('[ProductsPage] No main image to upload:', { eMainImage, isFile: eMainImage instanceof File });
      }
      
      // Handle additional image uploads
      if (eImages.length > 0) {
        console.log('[ProductsPage] Uploading additional images:', eImages.length, eImages.map(img => ({ name: img.name, size: img.size, isFile: img instanceof File })));
        try {
          // Filter out any invalid files
          const validImages = eImages.filter(img => img && img instanceof File);
          console.log('[ProductsPage] Valid images after filtering:', validImages.length);
          if (validImages.length > 0) {
            await uploadProductImages(editing.id, validImages);
          }
        } catch (imageErr) {
          console.error('[ProductsPage] Failed to upload additional images:', imageErr);
          
          // Handle specific error types
          if (imageErr.response?.data?.error_type === 'duplicate_image') {
            setMsg({ 
              kind: 'error', 
              text: 'Duplicate Image: One or more images already exist for this product. Please upload different images.' 
            });
          } else {
            setMsg({ 
              kind: 'error', 
              text: `Failed to upload additional images: ${imageErr.response?.data?.detail || imageErr.message}` 
            });
          }
          // Don't fail the entire operation if image upload fails
        }
      } else {
        console.log('[ProductsPage] No additional images to upload');
      }
      if (eFiles.length > 0) {
        try {
          // Filter out any invalid files
          const validFiles = eFiles.filter(file => file && file instanceof File);
          if (validFiles.length > 0) {
            await uploadProductImages(editing.id, validFiles);
          }
        } catch (imageErr) {
          console.error('[ProductsPage] Failed to upload files:', imageErr);
          
          // Handle specific error types
          if (imageErr.response?.data?.error_type === 'duplicate_image') {
            setMsg({ 
              kind: 'error', 
              text: 'Duplicate Image: One or more images already exist for this product. Please upload different images.' 
            });
          } else {
            setMsg({ 
              kind: 'error', 
              text: `Failed to upload files: ${imageErr.response?.data?.detail || imageErr.message}` 
            });
          }
          // Don't fail the entire operation if image upload fails
        }
      }
      const fresh = await getProduct(editing.id);
      setEditing(fresh);
      setEMainImage(null); // Reset main image selection
      await refreshData();
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
      await refreshData();
      setMsg({kind:'success', text:'Product deleted.'});
    } catch(err){
      console.error('[ProductsPage] Failed to delete product:', err);
      
      // Handle specific error cases
      if (err.message && err.message.includes('order item(s) are using this product')) {
        setMsg({ 
          kind: 'error', 
          text: `⚠️ Cannot delete product: ${err.message}\n\nTo delete this product:\n1. Go to Orders page\n2. Find orders containing this product\n3. Either delete those orders or modify them to remove this product\n4. Then try deleting the product again`
        });
      } else if (err.message && err.message.includes('Authentication')) {
        setMsg({ 
          kind: 'error', 
          text: 'Authentication expired. Please login again.' 
        });
      } else {
        const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete product';
        setMsg({ kind: 'error', text: errorMessage });
      }
    } finally { setBusy(false) }
  };

  const removeImage = async (imgId) => {
    if(!editing) return;
    await deleteProductImage(editing.id, imgId);
    const fresh = await getProduct(editing.id);
    setEditing(fresh);
  };

  const setMainImage = async (imgId) => {
    if(!editing) return;
    try {
      setBusy(true);
      await setMainProductImage(editing.id, imgId);
      const fresh = await getProduct(editing.id);
      setEditing(fresh);
      setMsg({kind:'success', text:'Main image updated successfully!'});
    } catch(err){
      setMsg({kind:'error', text: err.uiMessage || 'Failed to set main image.'});
    } finally { 
      setBusy(false) 
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
        {/* Add Product */}
        <section ref={createProductRef} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📦</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Create Product</h2>
          </div>
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
            
            {/* Technical Specifications */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Technical Specifications</label>
              <div className="space-y-3">
                {cSpecs.map((row,idx)=>(
                  <div key={idx} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Specification Key</label>
                      <input 
                        placeholder="e.g., RAM, Storage, Color" 
                        className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 text-sm" 
                        value={row.key} 
                        onChange={e=>chSpec(idx,'key',e.target.value)} 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Value</label>
                      <input 
                        placeholder="e.g., 8GB, 256GB, Black" 
                        className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 text-sm" 
                        value={row.value} 
                        onChange={e=>chSpec(idx,'value',e.target.value)} 
                      />
                    </div>
                    <button 
                      type="button" 
                      className="h-10 px-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl text-sm" 
                      onClick={()=>rmSpec(idx)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  className="w-full border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm" 
                  onClick={addSpec}
                >
                  <span className="text-sm">➕</span>
                  Add Specification
                </button>
              </div>
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
                onChange={e=>{ setCSubcat(e.target.value); setCGrandchildCat(''); }} 
                disabled={!cTopCat}
              >
                <option value="">{cTopCat ? 'Select Subcategory' : 'Select a category first'}</option>
              {subcats.map(sc=><option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Grandchild Category</label>
              <select 
                className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                value={cGrandchildCat} 
                onChange={e=>setCGrandchildCat(e.target.value)} 
                disabled={!cSubcat}
              >
                <option value="">{cSubcat ? 'Select Grandchild Category' : 'Select a subcategory first'}</option>
              {grandchildCats.map(gc=><option key={gc.id} value={gc.id}>{gc.name}</option>)}
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

          {/* New Arrivals Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🆕</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">New Arrivals</h3>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cIsNewArrival}
                  onChange={(e) => setCIsNewArrival(e.target.checked)}
                  className="w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Mark as New Arrival
                </span>
              </label>
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {cIsNewArrival ? '✅ Will appear in New Arrivals section' : '❌ Will not appear in New Arrivals section'}
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl">
              <div className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                💡 New arrival products will be displayed in the "NEW PRODUCTS" section on the home page to showcase your latest additions.
              </div>
            </div>
          </div>

          {/* Top Selling Section */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⭐</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Top Selling Product</h3>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cIsTopSelling}
                  onChange={(e) => setCIsTopSelling(e.target.checked)}
                  className="w-5 h-5 text-green-600 bg-white border-2 border-green-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Mark as Top Selling Product
                </span>
              </label>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                {cIsTopSelling ? '✅ Will appear on home page' : '❌ Will not appear on home page'}
              </div>
            </div>
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl">
              <div className="text-green-700 dark:text-green-300 text-sm font-medium">
                💡 Top selling products will be displayed in a special section on the home page to highlight your best products.
              </div>
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
            {/* Main Picture Selection */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs">⭐</span>
                </div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Main Picture *</h4>
              </div>
              <div className="space-y-3">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Select the main image that will be displayed as the primary product image
                </div>
                <div className="text-red-500 text-sm font-medium">
                  ⚠️ Main image is required
                </div>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png" 
                  onChange={(e) => setCMainImage(e.target.files[0])}
                  className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                />
                {cMainImage && (
                  <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                    ✅ Main picture selected: {cMainImage.name}
                  </div>
                )}
              </div>
            </div>

            {/* Multiple Image Upload */}
            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-8 text-center bg-white/50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📸</span>
                </div>
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Upload Additional Product Images</div>
                <div className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">Optional - Additional images for product gallery</div>
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png" 
                  multiple
                  onChange={onCreateImages}
                  className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                />
                <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                  You can select multiple images at once (JPG, PNG only)
                </div>
              </div>

              {/* Selected Images Preview */}
              {cImages.length > 0 && (
                <div className="space-y-4">
                  <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Selected Images ({cImages.length})
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-600">
                          <img 
                            src={URL.createObjectURL(image)} 
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeCreateImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                        >
                          ×
                        </button>
                        <div className="mt-2 text-xs text-center text-slate-600 dark:text-slate-400 truncate">
                          {image.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <div className="grid gap-4 md:grid-cols-6">
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
                  onChange={e=>{ setFSubcat(e.target.value); setFGrandchildCat(''); }} 
                  disabled={!fTopCat}
                >
              <option value="">{fTopCat ? 'All subcategories' : 'Select a category first'}</option>
              {fSubList.map(sc=><option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Grandchild Category</label>
                <select 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                  value={fGrandchildCat} 
                  onChange={e=>setFGrandchildCat(e.target.value)} 
                  disabled={!fSubcat}
                >
              <option value="">{fSubcat ? 'All grandchild categories' : 'Select a subcategory first'}</option>
              {fGrandchildList.map(gc=><option key={gc.id} value={gc.id}>{gc.name}</option>)}
            </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={refreshData} 
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
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map(p=>(
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
          <section ref={editProductRef} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
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
              
              {/* Technical Specifications */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Technical Specifications</label>
                <div className="space-y-3">
                  {eSpecs.map((row,idx)=>(
                    <div key={idx} className="grid gap-3 md:grid-cols-[1fr_1fr_auto] items-end">
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Specification Key</label>
                        <input 
                          placeholder="e.g., RAM, Storage, Color" 
                          className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200 text-sm" 
                          value={row.key} 
                          onChange={e=>chESpec(idx,'key',e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">Value</label>
                        <input 
                          placeholder="e.g., 8GB, 256GB, Black" 
                          className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200 text-sm" 
                          value={row.value} 
                          onChange={e=>chESpec(idx,'value',e.target.value)} 
                        />
                      </div>
                      <button 
                        type="button" 
                        className="h-10 px-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl text-sm" 
                        onClick={()=>rmESpec(idx)}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    className="w-full border-2 border-dashed border-amber-300 dark:border-amber-600 rounded-xl px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 font-medium flex items-center justify-center gap-2 text-sm" 
                    onClick={addESpec}
                  >
                    <span className="text-sm">➕</span>
                    Add Specification
                  </button>
                </div>
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
              
              {/* Current Category Info */}
              {editing && editing.category_data && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                  <div className="text-blue-700 dark:text-blue-300 text-sm font-medium mb-2">
                    📂 Current Category Information
                  </div>
                  <div className="text-blue-800 dark:text-blue-200 font-semibold">
                    {editing.category_data.name}
                  </div>
                  {editing.category_data.description && (
                    <div className="text-blue-600 dark:text-blue-400 text-sm mt-1">
                      {editing.category_data.description}
                    </div>
                  )}
                </div>
              )}
              
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
                  onChange={e=>{ setESubcat(e.target.value); setEGrandchildCat(''); }} 
                  disabled={!eTopCat && !editing.category}
                >
                  <option value="">{eTopCat ? 'Select Subcategory' : (editing?.category_data?.name ? `Current: ${editing.category_data.name}` : 'Keep existing or pick a Category')}</option>
                {subcats.map(sc=><option key={sc.id} value={sc.id}>{sc.name}</option>)}
              </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Grandchild Category</label>
                <select 
                  className="w-full border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-200 dark:focus:ring-amber-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                  value={eGrandchildCat} 
                  onChange={e=>setEGrandchildCat(e.target.value)} 
                  disabled={!eSubcat}
                >
                  <option value="">{eSubcat ? 'Select Grandchild Category' : (editing?.category_data?.name ? `Current: ${editing.category_data.name}` : 'Select a subcategory first')}</option>
                {grandchildCats.map(gc=><option key={gc.id} value={gc.id}>{gc.name}</option>)}
              </select>
              </div>
            </div>

            {/* New Arrivals Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">🆕</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">New Arrivals</h3>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eIsNewArrival}
                    onChange={(e) => setEIsNewArrival(e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-white border-2 border-blue-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Mark as New Arrival
                  </span>
                </label>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  {eIsNewArrival ? '✅ Will appear in New Arrivals section' : '❌ Will not appear in New Arrivals section'}
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <div className="text-blue-700 dark:text-blue-300 text-sm font-medium">
                  💡 New arrival products will be displayed in the "NEW PRODUCTS" section on the home page to showcase your latest additions.
                </div>
              </div>
            </div>

            {/* Top Selling Section */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">⭐</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Top Selling Product</h3>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eIsTopSelling}
                    onChange={(e) => setEIsTopSelling(e.target.checked)}
                    className="w-5 h-5 text-green-600 bg-white border-2 border-green-300 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                    Mark as Top Selling Product
                  </span>
                </label>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                  {eIsTopSelling ? '✅ Will appear on home page' : '❌ Will not appear on home page'}
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl">
                <div className="text-green-700 dark:text-green-300 text-sm font-medium">
                  💡 Top selling products will be displayed in a special section on the home page to highlight your best products.
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-3xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📸</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Product Images</h3>
              </div>

              {/* Main Picture Selection */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">⭐</span>
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Change Main Picture</h4>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Select a new main image that will be displayed as the primary product image
                  </div>
                  <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                    💡 Optional - Only upload if you want to change the main image
                  </div>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png" 
                    onChange={(e) => setEMainImage(e.target.files[0])}
                    className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                  />
                  {eMainImage && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-medium">
                      ✅ New main picture selected: {eMainImage.name}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Current Images */}
              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Current Images</div>
                <div className="flex flex-wrap gap-4">
                {editing.images?.map(img=>(
                    <div key={img.id} className="relative group">
                      <div className={`w-32 h-32 border-2 ${img.is_main ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-600'} rounded-2xl overflow-hidden bg-white dark:bg-slate-700 shadow-lg`}>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                        <img src={img.image.startsWith('http') ? img.image : `http://127.0.0.1:8001${img.image}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                        {img.is_main && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            MAIN
                      </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-2xl flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                          {!img.is_main && (
                      <button 
                        type="button" 
                              onClick={() => setMainImage(img.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                              title="Set as main image"
                            >
                              ⭐ Set Main
                            </button>
                          )}
                          <button 
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                            title="Delete image"
                          >
                            🗑️ Delete
                      </button>
                        </div>
                      </div>
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
              <div className="space-y-6">
                <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">Add New Images</div>
                
                {/* Upload Area */}
                <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-3xl p-8 text-center bg-white/50 dark:bg-slate-700/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl">📸</span>
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 mb-2">Upload Additional Images</div>
                  <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-4">Optional</div>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png" 
                    multiple
                    onChange={onEditImages}
                    className="w-full text-sm border-2 border-slate-200 dark:border-slate-600 rounded-2xl px-4 py-3 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all duration-200"
                  />
                  <div className="mt-4 text-slate-500 dark:text-slate-400 text-sm">
                    You can select multiple images at once (JPG, PNG only)
                  </div>
                </div>

                {/* Selected Images Preview */}
                {eImages.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      New Images to Upload ({eImages.length})
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {eImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-600">
                            <img 
                              src={URL.createObjectURL(image)} 
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            onClick={() => removeEditImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                          <div className="mt-2 text-xs text-center text-slate-600 dark:text-slate-400 truncate">
                            {image.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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