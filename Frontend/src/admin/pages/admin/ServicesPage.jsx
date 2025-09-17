import { useEffect, useState } from 'react';
import { ThemeLayout, ThemeCard, ThemeInput, ThemeButton, ThemeAlert, ThemeSelect, ThemeTextarea } from '@shared/theme';
import { useCurrency } from '../../store/currencyStore';

export default function ServicesPage() {
  const { formatAmount } = useCurrency();
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  
  // Form states for creating new service
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImage, setNewImage] = useState(null);
  
  // Form states for editing service
  const [eName, setEName] = useState('');
  const [eDescription, setEDescription] = useState('');
  const [ePrice, setEPrice] = useState('');
  const [eImage, setEImage] = useState(null);
  const [eFiles, setEFiles] = useState([]);

  useEffect(() => {
    console.log('[ServicesPage] mounted');
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockServices = [
        {
          id: 1,
          name: 'Web Development',
          description: 'Custom website development and design services',
          price: 1500.00,
          image: '/api/placeholder/300/200',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'Mobile App Development',
          description: 'iOS and Android mobile application development',
          price: 2500.00,
          image: '/api/placeholder/300/200',
          created_at: '2024-01-20T14:30:00Z'
        },
        {
          id: 3,
          name: 'SEO Optimization',
          description: 'Search engine optimization and digital marketing',
          price: 800.00,
          image: '/api/placeholder/300/200',
          created_at: '2024-01-25T09:15:00Z'
        }
      ];
      setServices(mockServices);
    } catch (err) {
      setMsg({ kind: 'error', text: 'Failed to load services.' });
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
      const newService = {
        id: Date.now(),
        name: newName.trim(),
        description: newDescription.trim(),
        price: parseFloat(newPrice),
        image: newImage ? URL.createObjectURL(newImage) : '/api/placeholder/300/200',
        created_at: new Date().toISOString()
      };
      
      setServices(prev => [newService, ...prev]);
      setNewName('');
      setNewDescription('');
      setNewPrice('');
      setNewImage(null);
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
      const updatedService = {
        ...editing,
        name: eName.trim(),
        description: eDescription.trim(),
        price: parseFloat(ePrice),
        image: eImage ? URL.createObjectURL(eImage) : editing.image
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
    setEName(service.name);
    setEDescription(service.description);
    setEPrice(service.price.toString());
    setEImage(null);
    setEFiles([]);
  };

  const cancelEdit = () => {
    setEditing(null);
    setEName('');
    setEDescription('');
    setEPrice('');
    setEImage(null);
    setEFiles([]);
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
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatAmount(service.price)}
                        </span>
                        <span>
                          Created: {new Date(service.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <ThemeButton 
                        onClick={() => startEdit(service)}
                        variant="warning" 
                        icon="✏️"
                        className="whitespace-nowrap min-w-fit flex-shrink-0"
                      >
                        Edit
                      </ThemeButton>
                      <ThemeButton 
                        onClick={() => deleteService(service.id)}
                        variant="danger" 
                        icon="🗑️"
                        className="whitespace-nowrap min-w-fit flex-shrink-0"
                      >
                        Delete
                      </ThemeButton>
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