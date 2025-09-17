import { useEffect, useState } from 'react';
import { ThemeLayout, ThemeCard, ThemeInput, ThemeButton, ThemeAlert, ThemeTextarea } from '@shared/theme';
import { listBrands, listTopCategories, createBrand, deleteBrand, createCategory, deleteCategory, updateContent, getContent } from '../../lib/api';

export default function ContentPage() {
  const [content, setContent] = useState({
    banner1_text: '',
    banner1_link: '',
    banner1_image: null,
    banner2_text: '',
    banner2_link: '',
    banner2_image: null,
    banner3_text: '',
    banner3_link: '',
    banner3_image: null,
    phone_number: '',
    email: '',
    address: '',
    logo: null
  });
  
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brandName, setBrandName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  // File states for each banner
  const [banner1File, setBanner1File] = useState(null);
  const [banner2File, setBanner2File] = useState(null);
  const [banner3File, setBanner3File] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    console.log('[ContentPage] mounted');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [brandsRes, categoriesRes, contentRes] = await Promise.all([
        listBrands(),
        listTopCategories(),
        getContent()
      ]);
      
      setBrands(brandsRes.data.results || brandsRes.data || []);
      setCategories(categoriesRes.data.results || categoriesRes.data || []);
      
      // Load actual content data from API
      const contentData = contentRes.data;
      console.log('Loaded content data:', contentData);
      setContent(prev => ({
        ...prev,
        banner1_text: contentData.banner1_text || '',
        banner1_link: contentData.banner1_link || '',
        banner1_image: contentData.banner1_image || '',
        banner2_text: contentData.banner2_text || '',
        banner2_link: contentData.banner2_link || '',
        banner2_image: contentData.banner2_image || '',
        banner3_text: contentData.banner3_text || '',
        banner3_link: contentData.banner3_link || '',
        banner3_image: contentData.banner3_image || '',
        phone_number: contentData.phone_number || '',
        email: contentData.email || '',
        address: contentData.address || '',
        logo: contentData.logo || ''
      }));
    } catch (err) {
      console.error('Failed to load data:', err);
      setMsg({ kind: 'error', text: 'Failed to load content data.' });
    }
  };

  const saveContent = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    
    try {
      // Prepare form data for file uploads
      const formData = new FormData();
      formData.append('banner1_text', content.banner1_text);
      formData.append('banner1_link', content.banner1_link);
      formData.append('banner2_text', content.banner2_text);
      formData.append('banner2_link', content.banner2_link);
      formData.append('banner3_text', content.banner3_text);
      formData.append('banner3_link', content.banner3_link);
      formData.append('phone_number', content.phone_number);
      formData.append('email', content.email);
      formData.append('address', content.address);
      
      // Add files if selected
      if (banner1File) {
        formData.append('banner1_image', banner1File);
      }
      if (banner2File) {
        formData.append('banner2_image', banner2File);
      }
      if (banner3File) {
        formData.append('banner3_image', banner3File);
      }
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      console.log('Saving content data:', {
        banner1_text: content.banner1_text,
        banner1_link: content.banner1_link,
        banner2_text: content.banner2_text,
        banner2_link: content.banner2_link,
        banner3_text: content.banner3_text,
        banner3_link: content.banner3_link,
        phone_number: content.phone_number,
        email: content.email,
        address: content.address,
        has_banner1_file: !!banner1File,
        has_banner2_file: !!banner2File,
        has_banner3_file: !!banner3File,
        has_logo_file: !!logoFile
      });
      
      // Call the API to save content
      const result = await updateContent(formData);
      console.log('Save result:', result.data);
      
      setMsg({ kind: 'success', text: 'Content saved successfully! Updated on storefront.' });
      
      // Clear file states and reload data to show updated images
      setBanner1File(null);
      setBanner2File(null);
      setBanner3File(null);
      setLogoFile(null);
      await loadData();
    } catch (err) {
      console.error('Failed to save content:', err);
      console.error('Error details:', err.response?.data);
      setMsg({ kind: 'error', text: `Failed to save contact information: ${err.uiMessage || err.message}` });
    } finally {
      setBusy(false);
    }
  };

  const addBrand = async () => {
    if (!brandName.trim()) {
      setMsg({ kind: 'error', text: 'Please enter a brand name.' });
      return;
    }
    
    setBusy(true);
    setMsg(null);
    try {
      const newBrand = await createBrand({ name: brandName.trim() });
      setBrands(prev => [newBrand.data, ...prev]);
      setBrandName('');
      setMsg({ kind: 'success', text: 'Brand added successfully!' });
    } catch (err) {
      setMsg({ kind: 'error', text: 'Failed to add brand.' });
    } finally {
      setBusy(false);
    }
  };

  const removeBrand = async (id) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    
    setBusy(true);
    setMsg(null);
    try {
      await deleteBrand(id);
      setBrands(prev => prev.filter(b => b.id !== id));
      setMsg({ kind: 'success', text: 'Brand deleted successfully!' });
    } catch (err) {
      setMsg({ kind: 'error', text: 'Failed to delete brand.' });
    } finally {
      setBusy(false);
    }
  };

  const addCategory = async () => {
    if (!categoryName.trim()) {
      setMsg({ kind: 'error', text: 'Please enter a category name.' });
      return;
    }
    
    setBusy(true);
    setMsg(null);
    try {
      const newCategory = await createCategory({ name: categoryName.trim() });
      setCategories(prev => [newCategory.data, ...prev]);
      setCategoryName('');
      setMsg({ kind: 'success', text: 'Category added successfully!' });
    } catch (err) {
      setMsg({ kind: 'error', text: 'Failed to add category.' });
    } finally {
      setBusy(false);
    }
  };

  const removeCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    setBusy(true);
    setMsg(null);
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      setMsg({ kind: 'success', text: 'Category deleted successfully!' });
    } catch (err) {
      setMsg({ kind: 'error', text: 'Failed to delete category.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemeLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">📝</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Content Management</h1>
          </div>

          {/* Alert Messages */}
          {msg && (
            <ThemeAlert 
              message={msg.text} 
              type={msg.kind === 'success' ? 'success' : 'error'}
              onClose={() => setMsg(null)}
            />
          )}

          {/* Banners Section */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🖼️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Homepage Banners</h2>
            </div>
            
            <form onSubmit={saveContent} className="space-y-8">
              {/* First Banner */}
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">1️⃣</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">First Banner</h3>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Banner Text
                    </label>
                    <ThemeInput
                      value={content.banner1_text}
                      onChange={(e) => setContent(prev => ({ ...prev, banner1_text: e.target.value }))}
                      placeholder="Enter banner text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Banner Link
                    </label>
                    <ThemeInput
                      value={content.banner1_link}
                      onChange={(e) => setContent(prev => ({ ...prev, banner1_link: e.target.value }))}
                      placeholder="Enter banner link"
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Banner Image
                  </label>
                  <div className="flex items-center gap-4">
                    {content.banner1_image && (
                      <img 
                        src={content.banner1_image} 
                        alt="Banner 1" 
                        className="w-32 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBanner1File(e.target.files[0])}
                      className="block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                    />
                  </div>
                  {banner1File && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(banner1File)} 
                        alt="New banner 1" 
                        className="w-32 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Second Banner */}
              <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">2️⃣</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Second Banner</h3>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Banner Text
                    </label>
                    <ThemeInput
                      value={content.banner2_text}
                      onChange={(e) => setContent(prev => ({ ...prev, banner2_text: e.target.value }))}
                      placeholder="Enter banner text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Banner Link
                    </label>
                    <ThemeInput
                      value={content.banner2_link}
                      onChange={(e) => setContent(prev => ({ ...prev, banner2_link: e.target.value }))}
                      placeholder="Enter banner link"
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Banner Image
                  </label>
                  <div className="flex items-center gap-4">
                    {content.banner2_image && (
                      <img 
                        src={content.banner2_image} 
                        alt="Banner 2" 
                        className="w-32 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBanner2File(e.target.files[0])}
                      className="block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/20 dark:file:text-emerald-300"
                    />
                  </div>
                  {banner2File && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(banner2File)} 
                        alt="New banner 2" 
                        className="w-32 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Third Banner */}
              <div className="p-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-3xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">3️⃣</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Third Banner</h3>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Banner Text
                    </label>
                    <ThemeInput
                      value={content.banner3_text}
                      onChange={(e) => setContent(prev => ({ ...prev, banner3_text: e.target.value }))}
                      placeholder="Enter banner text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Banner Link
                    </label>
                    <ThemeInput
                      value={content.banner3_link}
                      onChange={(e) => setContent(prev => ({ ...prev, banner3_link: e.target.value }))}
                      placeholder="Enter banner link"
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Banner Image
                  </label>
                  <div className="flex items-center gap-4">
                    {content.banner3_image && (
                      <img 
                        src={content.banner3_image} 
                        alt="Banner 3" 
                        className="w-32 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBanner3File(e.target.files[0])}
                      className="block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 dark:file:bg-orange-900/20 dark:file:text-orange-300"
                    />
                  </div>
                  {banner3File && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(banner3File)} 
                        alt="New banner 3" 
                        className="w-32 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <ThemeButton 
                  type="submit" 
                  disabled={busy} 
                  loading={busy} 
                  variant="primary" 
                  icon="💾"
                  className="whitespace-nowrap min-w-fit flex-shrink-0"
                >
                  Save Banners
                </ThemeButton>
              </div>
            </form>
          </section>

          {/* Store Contact & Logo */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🏪</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Store Contact & Logo</h2>
            </div>
            
            <form onSubmit={saveContent} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <ThemeInput
                    value={content.phone_number}
                    onChange={(e) => setContent(prev => ({ ...prev, phone_number: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <ThemeInput
                    value={content.email}
                    onChange={(e) => setContent(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                    type="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Address
                </label>
                <ThemeTextarea
                  value={content.address}
                  onChange={(e) => setContent(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter store address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Logo Image
                </label>
                <div className="flex items-center gap-4">
                  {content.logo && (
                    <img 
                      src={content.logo} 
                      alt="Logo" 
                      className="w-20 h-20 object-contain rounded-xl border border-slate-200 dark:border-slate-600 bg-white p-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files[0])}
                    className="block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900/20 dark:file:text-purple-300"
                  />
                </div>
                {logoFile && (
                  <div className="mt-2">
                    <img 
                      src={URL.createObjectURL(logoFile)} 
                      alt="New logo" 
                      className="w-20 h-20 object-contain rounded-xl border border-slate-200 dark:border-slate-600 bg-white p-2"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <ThemeButton 
                  type="submit" 
                  disabled={busy} 
                  loading={busy} 
                  variant="success" 
                  icon="💾"
                  className="whitespace-nowrap min-w-fit flex-shrink-0"
                >
                  Save Contact Info
                </ThemeButton>
              </div>
            </form>
          </section>

          {/* Brands Management */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">🏷️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Brands Management</h2>
            </div>

            <div className="space-y-6">
              {/* Add Brand Form */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">➕</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add New Brand</h3>
                </div>
                
                <div className="flex gap-3">
                  <ThemeInput
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Enter brand name"
                    className="flex-1"
                  />
                  <ThemeButton 
                    onClick={addBrand}
                    disabled={busy || !brandName.trim()}
                    loading={busy}
                    variant="success" 
                    icon="➕"
                    className="whitespace-nowrap min-w-fit flex-shrink-0"
                  >
                    Add Brand
                  </ThemeButton>
                </div>
              </div>

              {/* Brands List */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Current Brands</h3>
                {brands.map(brand => (
                  <div key={brand.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🏷️</span>
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{brand.name}</span>
                      </div>
                      <ThemeButton 
                        onClick={() => removeBrand(brand.id)}
                        disabled={busy}
                        variant="danger" 
                        icon="🗑️"
                        className="whitespace-nowrap min-w-fit flex-shrink-0"
                      >
                        Delete
                      </ThemeButton>
                    </div>
                  </div>
                ))}
                
                {brands.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">🏷️</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-medium">No brands found</div>
                    <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">Add your first brand using the form above</div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Categories Management */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📂</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Categories Management</h2>
            </div>

            <div className="space-y-6">
              {/* Add Category Form */}
              <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-2xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">➕</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Add New Category</h3>
                </div>
                
                <div className="flex gap-3">
                  <ThemeInput
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="flex-1"
                  />
                  <ThemeButton 
                    onClick={addCategory}
                    disabled={busy || !categoryName.trim()}
                    loading={busy}
                    variant="warning" 
                    icon="➕"
                    className="whitespace-nowrap min-w-fit flex-shrink-0"
                  >
                    Add Category
                  </ThemeButton>
                </div>
              </div>

              {/* Categories List */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Current Categories</h3>
                {categories.map(category => (
                  <div key={category.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">📂</span>
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{category.name}</span>
                      </div>
                      <ThemeButton 
                        onClick={() => removeCategory(category.id)}
                        disabled={busy}
                        variant="danger" 
                        icon="🗑️"
                        className="whitespace-nowrap min-w-fit flex-shrink-0"
                      >
                        Delete
                      </ThemeButton>
                    </div>
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl">📂</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 font-medium">No categories found</div>
                    <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">Add your first category using the form above</div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </ThemeLayout>
  );
}