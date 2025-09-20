import { useEffect, useState } from 'react';
import { ThemeLayout, ThemeCard, ThemeInput, ThemeButton, ThemeAlert, ThemeSelect, ThemeTextarea } from '@shared/theme';
import { useCurrency } from '../../store/currencyStore';
import { listServiceCategories, createServiceCategory, updateServiceCategory, deleteServiceCategory, listServices, createService, updateService, deleteService, authStore } from '../../lib/api';

export default function ServicesPage() {
  const { formatAmount } = useCurrency();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  // Form states for creating new category
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryOrdering, setNewCategoryOrdering] = useState('0');
  
  // Form states for editing category
  const [eCategoryName, setECategoryName] = useState('');
  const [eCategoryDescription, setECategoryDescription] = useState('');
  const [eCategoryOrdering, setECategoryOrdering] = useState('0');
  
  // Form states for creating new service
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newRating, setNewRating] = useState('0.0');
  const [newReviewCount, setNewReviewCount] = useState('0');
  const [newOverview, setNewOverview] = useState('');
  const [newIncludedFeatures, setNewIncludedFeatures] = useState('');
  const [newProcessSteps, setNewProcessSteps] = useState('');
  const [newKeyFeatures, setNewKeyFeatures] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newAvailability, setNewAvailability] = useState('');
  
  // Form states for editing service
  const [eName, setEName] = useState('');
  const [eDescription, setEDescription] = useState('');
  const [ePrice, setEPrice] = useState('');
  const [eImage, setEImage] = useState(null);
  const [eFiles, setEFiles] = useState([]);
  const [eCategoryId, setECategoryId] = useState('');
  const [eRating, setERating] = useState('0.0');
  const [eReviewCount, setEReviewCount] = useState('0');
  const [eOverview, setEOverview] = useState('');
  const [eIncludedFeatures, setEIncludedFeatures] = useState('');
  const [eProcessSteps, setEProcessSteps] = useState('');
  const [eKeyFeatures, setEKeyFeatures] = useState('');
  const [eContactPhone, setEContactPhone] = useState('');
  const [eContactEmail, setEContactEmail] = useState('');
  const [eAvailability, setEAvailability] = useState('');

  useEffect(() => {
    console.log('[ServicesPage] mounted');
    loadServices();
    loadCategories();
  }, []);

  useEffect(() => {
    console.log('[ServicesPage] Categories updated:', categories);
  }, [categories]);

  // Helper functions to parse JSON fields
  const parseFeaturesList = (text) => {
    if (!text.trim()) return [];
    return text.split('\n').map(item => item.trim()).filter(item => item);
  };

  const parseProcessSteps = (text) => {
    if (!text.trim()) return [];
    return text.split('\n').map(step => {
      const parts = step.split('|');
      if (parts.length >= 2) {
        return {
          title: parts[0].trim(),
          description: parts[1].trim(),
          duration: parts[2] ? parts[2].trim() : ''
        };
      }
      return { title: step.trim(), description: '', duration: '' };
    }).filter(step => step.title);
  };

  const resetNewForm = () => {
    setNewName('');
    setNewDescription('');
    setNewPrice('');
    setNewImage(null);
    setNewCategoryId('');
    setNewRating('0.0');
    setNewReviewCount('0');
    setNewOverview('');
    setNewIncludedFeatures('');
    setNewProcessSteps('');
    setNewKeyFeatures('');
    setNewContactPhone('');
    setNewContactEmail('');
    setNewAvailability('');
  };

  const resetEditForm = () => {
    setEName('');
    setEDescription('');
    setEPrice('');
    setEImage(null);
    setEFiles([]);
    setECategoryId('');
    setERating('0.0');
    setEReviewCount('0');
    setEOverview('');
    setEIncludedFeatures('');
    setEProcessSteps('');
    setEKeyFeatures('');
    setEContactPhone('');
    setEContactEmail('');
    setEAvailability('');
  };

  const resetCategoryForm = () => {
    setNewCategoryName('');
  };

  const loadCategories = async () => {
    try {
      console.log('[ServicesPage] Loading categories from API...');
      console.log('[ServicesPage] API endpoint: /api/admin/service-categories/');
      console.log('[ServicesPage] Auth token exists:', !!authStore.access());
      console.log('[ServicesPage] Auth token:', authStore.access() ? 'Present' : 'Missing');
      const response = await listServiceCategories();
      console.log('[ServicesPage] Categories response type:', typeof response);
      console.log('[ServicesPage] Categories response:', response);
      console.log('[ServicesPage] Categories response.data:', response.data);
      console.log('[ServicesPage] Categories response.data.results:', response.data?.results);
      console.log('[ServicesPage] Is response.data an array?', Array.isArray(response.data));
      console.log('[ServicesPage] Is response.data.results an array?', Array.isArray(response.data?.results));
      console.log('[ServicesPage] Response status:', response.status || 'No status');
      console.log('[ServicesPage] Response headers:', response.headers || 'No headers');
      
      // Handle different response structures - axios wraps the response in .data
      let categoriesData = [];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        categoriesData = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        // Paginated response with results array
        categoriesData = response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        // Single object response - wrap in array
        categoriesData = [response.data];
      } else {
        // Fallback to empty array
        categoriesData = [];
      }
      
      console.log('[ServicesPage] Categories data to set:', categoriesData);
      console.log('[ServicesPage] Is categoriesData an array?', Array.isArray(categoriesData));
      
      setCategories(categoriesData);
      console.log('[ServicesPage] Categories set successfully, count:', categoriesData.length);
    } catch (err) {
      console.error('[ServicesPage] Failed to load categories:', err);
      console.error('[ServicesPage] Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      setCategories([]); // Set empty array on error
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        setMsg({ kind: 'error', text: 'Authentication required. Please sign in again.' });
      } else {
        setMsg({ kind: 'error', text: `Failed to load categories: ${err.message || 'Unknown error'}` });
      }
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      setMsg({ kind: 'error', text: 'Category name is required.' });
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      console.log('[ServicesPage] Creating category:', newCategoryName.trim());
      const response = await createServiceCategory({
        name: newCategoryName.trim(),
        description: '',
        ordering: categories.length + 1,
        is_active: true
      });
      
      console.log('[ServicesPage] Category created response:', response);
      const newCategory = response.data; // Extract data from axios response
      setCategories(prev => [newCategory, ...prev]);
      resetCategoryForm();
      setShowCategoryForm(false);
      setMsg({ kind: 'success', text: 'Category created successfully!' });
    } catch (err) {
      console.error('[ServicesPage] Failed to create category:', err);
      setMsg({ kind: 'error', text: 'Failed to create category.' });
    } finally {
      setBusy(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    setBusy(true);
    setMsg(null);
    try {
      console.log('[ServicesPage] Deleting category:', categoryId);
      await deleteServiceCategory(categoryId);
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      setMsg({ kind: 'success', text: 'Category deleted successfully!' });
    } catch (err) {
      console.error('[ServicesPage] Failed to delete category:', err);
      setMsg({ kind: 'error', text: 'Failed to delete category.' });
    } finally {
      setBusy(false);
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory(category);
    setECategoryName(category.name || '');
    setShowCategoryForm(false); // Hide the add form when editing
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !eCategoryName.trim()) {
      setMsg({ kind: 'error', text: 'Category name is required.' });
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      console.log('[ServicesPage] Updating category:', editingCategory.id, 'to:', eCategoryName.trim());
      const updatedCategory = await updateServiceCategory(editingCategory.id, {
        name: eCategoryName.trim(),
        description: editingCategory.description || '',
        ordering: editingCategory.ordering || 0,
        is_active: editingCategory.is_active !== false
      });
      
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? updatedCategory : c));
      setEditingCategory(null);
      resetCategoryEditForm();
      setMsg({ kind: 'success', text: 'Category updated successfully!' });
    } catch (err) {
      console.error('[ServicesPage] Failed to update category:', err);
      setMsg({ kind: 'error', text: 'Failed to update category.' });
    } finally {
      setBusy(false);
    }
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    resetCategoryEditForm();
  };

  const resetCategoryEditForm = () => {
    setECategoryName('');
  };

  const loadServices = async () => {
    try {
      console.log('[ServicesPage] Loading services from API...');
      console.log('[ServicesPage] API endpoint: /api/admin/services/');
      console.log('[ServicesPage] Auth token exists:', !!authStore.access());
      console.log('[ServicesPage] Auth token:', authStore.access() ? 'Present' : 'Missing');
      const response = await listServices();
      console.log('[ServicesPage] Services response type:', typeof response);
      console.log('[ServicesPage] Services response:', response);
      console.log('[ServicesPage] Services response.data:', response.data);
      console.log('[ServicesPage] Services response.data.results:', response.data?.results);
      console.log('[ServicesPage] Is response.data an array?', Array.isArray(response.data));
      console.log('[ServicesPage] Is response.data.results an array?', Array.isArray(response.data?.results));
      console.log('[ServicesPage] Response status:', response.status || 'No status');
      console.log('[ServicesPage] Response headers:', response.headers || 'No headers');
      
      // Handle different response structures - axios wraps the response in .data
      let servicesData = [];
      
      if (Array.isArray(response.data)) {
        // Direct array response
        servicesData = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        // Paginated response with results array
        servicesData = response.data.results;
      } else if (response.data && typeof response.data === 'object') {
        // Single object response - wrap in array
        servicesData = [response.data];
      } else {
        // Fallback to empty array
        servicesData = [];
      }
      
      console.log('[ServicesPage] Services data to set:', servicesData);
      console.log('[ServicesPage] Is servicesData an array?', Array.isArray(servicesData));
      
      setServices(servicesData);
      console.log('[ServicesPage] Services set successfully, count:', servicesData.length);
    } catch (err) {
      console.error('[ServicesPage] Failed to load services:', err);
      console.error('[ServicesPage] Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        config: err.config
      });
      setServices([]); // Set empty array on error
      
      // Check if it's an authentication error
      if (err.response?.status === 401) {
        setMsg({ kind: 'error', text: 'Authentication required. Please sign in again.' });
      } else {
        setMsg({ kind: 'error', text: `Failed to load services: ${err.message || 'Unknown error'}` });
      }
    }
  };

  const createService = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDescription.trim() || !newPrice) {
      setMsg({ kind: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      // Mock service creation - replace with actual API call
      const selectedCategory = categories.find(c => c.id && c.id.toString() === newCategoryId);
      const newService = {
        id: Date.now(),
        name: newName.trim(),
        description: newDescription.trim(),
        price: parseFloat(newPrice),
        image: newImage ? URL.createObjectURL(newImage) : '/api/placeholder/300/200',
        category: selectedCategory || null,
        category_id: newCategoryId ? parseInt(newCategoryId) : null,
        rating: parseFloat(newRating),
        review_count: parseInt(newReviewCount),
        overview: newOverview.trim(),
        included_features: parseFeaturesList(newIncludedFeatures),
        process_steps: parseProcessSteps(newProcessSteps),
        key_features: parseFeaturesList(newKeyFeatures),
        contact_info: {
          phone: newContactPhone.trim(),
          email: newContactEmail.trim()
        },
        availability: newAvailability.trim(),
        created_at: new Date().toISOString()
      };
      
      setServices(prev => [newService, ...prev]);
      resetNewForm();
      setMsg({ kind: 'success', text: 'Service created successfully!' });
    } catch (err) {
      setMsg({ kind: 'error', text: 'Failed to create service.' });
    } finally {
      setBusy(false);
    }
  };

  const updateService = async (e) => {
    e.preventDefault();
    if (!editing || !eName.trim() || !eDescription.trim() || !ePrice) {
      setMsg({ kind: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    setBusy(true);
    setMsg(null);
    try {
      // Mock service update - replace with actual API call
      const selectedCategory = categories.find(c => c.id && c.id.toString() === eCategoryId);
      const updatedService = {
        ...editing,
        name: eName.trim(),
        description: eDescription.trim(),
        price: parseFloat(ePrice),
        image: eImage ? URL.createObjectURL(eImage) : editing.image,
        category: selectedCategory || null,
        category_id: eCategoryId ? parseInt(eCategoryId) : null,
        rating: parseFloat(eRating),
        review_count: parseInt(eReviewCount),
        overview: eOverview.trim(),
        included_features: parseFeaturesList(eIncludedFeatures),
        process_steps: parseProcessSteps(eProcessSteps),
        key_features: parseFeaturesList(eKeyFeatures),
        contact_info: {
          phone: eContactPhone.trim(),
          email: eContactEmail.trim()
        },
        availability: eAvailability.trim()
      };
      
      setServices(prev => prev.map(s => s.id === editing.id ? updatedService : s));
      setEditing(updatedService);
      setMsg({ kind: 'success', text: 'Service updated successfully!' });
    } catch (err) {
      setMsg({ kind: 'error', text: 'Failed to update service.' });
    } finally {
      setBusy(false);
    }
  };

  const deleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    setBusy(true);
    setMsg(null);
    try {
      // Mock service deletion - replace with actual API call
      setServices(prev => prev.filter(s => s.id !== serviceId));
      if (editing && editing.id === serviceId) {
        setEditing(null);
      }
      setMsg({ kind: 'success', text: 'Service deleted successfully!' });
    } catch (err) {
      setMsg({ kind: 'error', text: 'Failed to delete service.' });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (service) => {
    setEditing(service);
    setEName(service.name || '');
    setEDescription(service.description || '');
    setEPrice(service.price ? service.price.toString() : '');
    setEImage(null);
    setEFiles([]);
    setECategoryId(service.category_id ? service.category_id.toString() : '');
    setERating(service.rating ? service.rating.toString() : '0.0');
    setEReviewCount(service.review_count ? service.review_count.toString() : '0');
    setEOverview(service.overview || '');
    setEIncludedFeatures(service.included_features ? service.included_features.join('\n') : '');
    setEProcessSteps(service.process_steps ? service.process_steps.map(step => 
      `${step.title}|${step.description}|${step.duration || ''}`
    ).join('\n') : '');
    setEKeyFeatures(service.key_features ? service.key_features.join('\n') : '');
    setEContactPhone(service.contact_info?.phone || '');
    setEContactEmail(service.contact_info?.email || '');
    setEAvailability(service.availability || '');
  };

  const cancelEdit = () => {
    setEditing(null);
    resetEditForm();
  };

  return (
    <ThemeLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🛠️</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Service Management</h1>
          </div>

          {/* Alert Messages */}
          {msg && (
            <ThemeAlert 
              message={msg.text} 
              type={msg.kind === 'success' ? 'success' : 'error'}
              onClose={() => setMsg(null)}
            />
          )}

          {/* Service Categories Management */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📂</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Service Categories</h2>
              </div>
              <ThemeButton 
                onClick={() => setShowCategoryForm(!showCategoryForm)}
                variant="primary" 
                icon="➕"
                className="whitespace-nowrap min-w-fit flex-shrink-0"
              >
                {showCategoryForm ? 'Cancel' : 'Add Category'}
              </ThemeButton>
            </div>

            {/* Add Category Form */}
            {showCategoryForm && (
              <form onSubmit={createCategory} className="space-y-4 mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Category Name *
                    </label>
                    <ThemeInput
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <ThemeButton 
                      type="submit" 
                      disabled={busy} 
                      loading={busy} 
                      variant="success" 
                      icon="💾"
                      className="whitespace-nowrap"
                    >
                      Create Category
                    </ThemeButton>
                  </div>
                </div>
              </form>
            )}

            {/* Edit Category Form */}
            {editingCategory && (
              <form onSubmit={updateCategory} className="space-y-4 mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">✏️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Edit Category</h3>
                </div>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Category Name *
                    </label>
                    <ThemeInput
                      value={eCategoryName}
                      onChange={(e) => setECategoryName(e.target.value)}
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <ThemeButton 
                      type="button"
                      onClick={cancelEditCategory}
                      variant="warning" 
                      icon="❌"
                      className="whitespace-nowrap"
                    >
                      Cancel
                    </ThemeButton>
                    <ThemeButton 
                      type="submit" 
                      disabled={busy} 
                      loading={busy} 
                      variant="success" 
                      icon="💾"
                      className="whitespace-nowrap"
                    >
                      Update
                    </ThemeButton>
                  </div>
                </div>
              </form>
            )}

            {/* Categories List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(categories) && categories.filter(category => category && category.id && category.name).map(category => (
                <div key={category.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                      {category.name}
                    </h3>
                    <div className="flex gap-1">
                      <ThemeButton 
                        onClick={() => startEditCategory(category)}
                        variant="warning" 
                        icon="✏️"
                        className="min-w-fit flex-shrink-0 text-xs px-2"
                        title="Edit Category"
                      />
                      <ThemeButton 
                        onClick={() => deleteCategory(category.id)}
                        variant="danger" 
                        icon="🗑️"
                        className="min-w-fit flex-shrink-0 text-xs px-2"
                        title="Delete Category"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Services: {services.filter(s => s.category_id === category.id).length}</span>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📂</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">No categories found</div>
                  <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">Create your first category using the form above</div>
                </div>
              )}
            </div>
          </section>

          {/* Add Service */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">➕</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add New Service</h2>
            </div>
            
            <form onSubmit={createService} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Service Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Service Name *
                  </label>
                  <ThemeInput
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter service name"
                    required
                  />
                </div>

                {/* Service Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Price *
                  </label>
                  <ThemeInput
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Service Category */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Service Category
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">No Category</option>
                  {Array.isArray(categories) && categories.filter(category => category && category.id && category.name).map(category => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No categories available. Create a category first.
                  </p>
                )}
              </div>

              {/* Service Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Description *
                </label>
                <ThemeTextarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe your service in detail..."
                  rows={4}
                  required
                />
              </div>

              {/* Rating and Reviews */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Rating (0.0-5.0)
                  </label>
                  <ThemeInput
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={newRating}
                    onChange={(e) => setNewRating(e.target.value)}
                    placeholder="0.0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Review Count
                  </label>
                  <ThemeInput
                    type="number"
                    min="0"
                    value={newReviewCount}
                    onChange={(e) => setNewReviewCount(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Service Overview */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Service Overview
                </label>
                <ThemeTextarea
                  value={newOverview}
                  onChange={(e) => setNewOverview(e.target.value)}
                  placeholder="Detailed service overview and description..."
                  rows={3}
                />
              </div>

              {/* Included Features */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Included Features (one per line)
                </label>
                <ThemeTextarea
                  value={newIncludedFeatures}
                  onChange={(e) => setNewIncludedFeatures(e.target.value)}
                  placeholder="Data collection and integration setup&#10;Custom dashboard development&#10;Predictive analytics models&#10;..."
                  rows={4}
                />
              </div>

              {/* Process Steps */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Process Steps (format: Title | Description | Duration)
                </label>
                <ThemeTextarea
                  value={newProcessSteps}
                  onChange={(e) => setNewProcessSteps(e.target.value)}
                  placeholder="Data Discovery | Identify data sources and business requirements | 3-5 days&#10;Data Integration | Set up data pipelines and integration systems | 1 week&#10;..."
                  rows={4}
                />
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Key Features (one per line)
                </label>
                <ThemeTextarea
                  value={newKeyFeatures}
                  onChange={(e) => setNewKeyFeatures(e.target.value)}
                  placeholder="Data Visualization&#10;Predictive Analytics&#10;Custom Dashboards&#10;Real-time Reports"
                  rows={3}
                />
              </div>

              {/* Contact Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Contact Phone
                  </label>
                  <ThemeInput
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Contact Email
                  </label>
                  <ThemeInput
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Availability
                </label>
                <ThemeInput
                  value={newAvailability}
                  onChange={(e) => setNewAvailability(e.target.value)}
                  placeholder="Available 24/7, Monday to Friday, etc."
                />
              </div>

              {/* Service Image */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Service Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                />
                {newImage && (
                  <div className="mt-2">
                    <img 
                      src={URL.createObjectURL(newImage)} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <ThemeButton 
                  type="submit" 
                  disabled={busy} 
                  loading={busy} 
                  variant="primary" 
                  icon="➕"
                  className="whitespace-nowrap min-w-fit flex-shrink-0"
                >
                  Create Service
                </ThemeButton>
              </div>
            </form>
          </section>

          {/* Manage Services */}
          <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📋</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manage Services</h2>
            </div>

            <div className="space-y-4">
              {services.map(service => (
                <div key={service.id} className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-4">
                    {/* Service Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                    </div>

                    {/* Service Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                        {service.name}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-2">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatAmount(service.price)}
                        </span>
                        {service.rating && service.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{service.rating}</span>
                            {service.review_count && service.review_count > 0 && (
                              <span>({service.review_count} reviews)</span>
                            )}
                          </span>
                        )}
                        <span>
                          Created: {new Date(service.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {service.category && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                            📂 {service.category.name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <ThemeButton 
                        onClick={() => startEdit(service)}
                        variant="warning" 
                        icon="✏️"
                        className="min-w-fit flex-shrink-0 px-2"
                        title="Edit Service"
                      />
                      <ThemeButton 
                        onClick={() => deleteService(service.id)}
                        variant="danger" 
                        icon="🗑️"
                        className="min-w-fit flex-shrink-0 px-2"
                        title="Delete Service"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {services.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🛠️</span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 font-medium">No services found</div>
                  <div className="text-sm text-slate-500 dark:text-slate-500 mt-1">Create your first service using the form above</div>
                </div>
              )}
            </div>
          </section>

          {/* Edit Service */}
          {editing && (
            <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">✏️</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Edit Service</h2>
              </div>
              
              <form onSubmit={updateService} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Service Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Service Name *
                    </label>
                    <ThemeInput
                      value={eName}
                      onChange={(e) => setEName(e.target.value)}
                      placeholder="Enter service name"
                      required
                    />
                  </div>

                  {/* Service Price */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Price *
                    </label>
                    <ThemeInput
                      type="number"
                      step="0.01"
                      min="0"
                      value={ePrice}
                      onChange={(e) => setEPrice(e.target.value)}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                {/* Service Category */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Service Category
                  </label>
                  <select
                    value={eCategoryId}
                    onChange={(e) => setECategoryId(e.target.value)}
                    className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">No Category</option>
                    {Array.isArray(categories) && categories.filter(category => category && category.id && category.name).map(category => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {categories.length === 0 && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No categories available. Create a category first.
                    </p>
                  )}
                </div>

                {/* Service Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Description *
                  </label>
                  <ThemeTextarea
                    value={eDescription}
                    onChange={(e) => setEDescription(e.target.value)}
                    placeholder="Describe your service in detail..."
                    rows={4}
                    required
                  />
                </div>

                {/* Rating and Reviews */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Rating (0.0-5.0)
                    </label>
                    <ThemeInput
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={eRating}
                      onChange={(e) => setERating(e.target.value)}
                      placeholder="0.0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Review Count
                    </label>
                    <ThemeInput
                      type="number"
                      min="0"
                      value={eReviewCount}
                      onChange={(e) => setEReviewCount(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Service Overview */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Service Overview
                  </label>
                  <ThemeTextarea
                    value={eOverview}
                    onChange={(e) => setEOverview(e.target.value)}
                    placeholder="Detailed service overview and description..."
                    rows={3}
                  />
                </div>

                {/* Included Features */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Included Features (one per line)
                  </label>
                  <ThemeTextarea
                    value={eIncludedFeatures}
                    onChange={(e) => setEIncludedFeatures(e.target.value)}
                    placeholder="Data collection and integration setup&#10;Custom dashboard development&#10;Predictive analytics models&#10;..."
                    rows={4}
                  />
                </div>

                {/* Process Steps */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Process Steps (format: Title | Description | Duration)
                  </label>
                  <ThemeTextarea
                    value={eProcessSteps}
                    onChange={(e) => setEProcessSteps(e.target.value)}
                    placeholder="Data Discovery | Identify data sources and business requirements | 3-5 days&#10;Data Integration | Set up data pipelines and integration systems | 1 week&#10;..."
                    rows={4}
                  />
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Key Features (one per line)
                  </label>
                  <ThemeTextarea
                    value={eKeyFeatures}
                    onChange={(e) => setEKeyFeatures(e.target.value)}
                    placeholder="Data Visualization&#10;Predictive Analytics&#10;Custom Dashboards&#10;Real-time Reports"
                    rows={3}
                  />
                </div>

                {/* Contact Information */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Contact Phone
                    </label>
                    <ThemeInput
                      value={eContactPhone}
                      onChange={(e) => setEContactPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Contact Email
                    </label>
                    <ThemeInput
                      type="email"
                      value={eContactEmail}
                      onChange={(e) => setEContactEmail(e.target.value)}
                      placeholder="support@example.com"
                    />
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Availability
                  </label>
                  <ThemeInput
                    value={eAvailability}
                    onChange={(e) => setEAvailability(e.target.value)}
                    placeholder="Available 24/7, Monday to Friday, etc."
                  />
                </div>

                {/* Service Image */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Service Image
                  </label>
                  <div className="flex items-center gap-4">
                    {editing.image && (
                      <img 
                        src={editing.image} 
                        alt="Current" 
                        className="w-20 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEImage(e.target.files[0])}
                      className="block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                    />
                  </div>
                  {eImage && (
                    <div className="mt-2">
                      <img 
                        src={URL.createObjectURL(eImage)} 
                        alt="New preview" 
                        className="w-32 h-20 object-cover rounded-xl border border-slate-200 dark:border-slate-600"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <ThemeButton 
                    type="button"
                    onClick={cancelEdit}
                    variant="warning" 
                    icon="❌"
                    className="whitespace-nowrap min-w-fit flex-shrink-0"
                  >
                    Cancel
                  </ThemeButton>
                  <ThemeButton 
                    type="submit" 
                    disabled={busy} 
                    loading={busy} 
                    variant="success" 
                    icon="💾"
                    className="whitespace-nowrap min-w-fit flex-shrink-0"
                  >
                    Save Changes
                  </ThemeButton>
                </div>
              </form>
            </section>
          )}
        </div>
      </ThemeLayout>
  );
}