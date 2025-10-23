import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import FormRow from '../../components/ui/FormRow';
import { ThemeLayout, ThemeCard, ThemeInput, ThemeSelect, ThemeButton, ThemeAlert, FormSection } from '@theme';
import { useCurrency, currencyOptions } from '../../store/currencyStore';
import { getStoreSettings, updateStoreSettings } from '../../lib/api';
import FaviconUpdater from '../../components/common/FaviconUpdater';

export default function SettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [storeLogoFile, setStoreLogoFile] = useState(null);
  const [aboutUsFile, setAboutUsFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const { currency, setCurrency, getCurrentCurrency } = useCurrency();

  useEffect(()=>{ (async()=>{
    try {
      console.log('[SETTINGS] Starting to load settings...');
      setLoading(true);
      setError(null);
      
      console.log('[SETTINGS] Calling getStoreSettings API...');
      const response = await getStoreSettings();
      console.log('[SETTINGS] API Response:', response);
      
      // The API returns the data directly, not wrapped in a 'data' property
      const settingsData = response;
      console.log('[SETTINGS] Settings data:', settingsData);
      
      // Validate that we received valid settings data
      if (!settingsData || typeof settingsData !== 'object') {
        throw new Error('Invalid settings data received from server');
      }
      
      setData(settingsData);
      // Update local currency store to match backend (with fallback)
      setCurrency(settingsData.currency || 'GBP');
      console.log('[SETTINGS] Settings loaded successfully');
    } catch (err) {
      console.error('[SETTINGS] Error loading settings:', err);
      console.error('[SETTINGS] Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      
      // More specific error messages
      let errorMessage = 'Failed to load settings';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You may not have admin permissions.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('[SETTINGS] Loading finished');
    }
  })(); }, []);

  const save = async (e) => {
    e.preventDefault();
    
    // Validate tax rate is not negative
    if (parseFloat(data.tax_rate) < 0) {
      setMsg({ kind: 'error', text: 'Tax rate cannot be negative. Please enter a value of 0 or greater.' });
      return;
    }
    
    // Validate shipping rates are not negative
    if (parseFloat(data.shipping_rate) < 0) {
      setMsg({ kind: 'error', text: 'Shipping rate cannot be negative. Please enter a value of 0 or greater.' });
      return;
    }
    
    if (parseFloat(data.standard_shipping_rate || 0) < 0) {
      setMsg({ kind: 'error', text: 'Standard shipping rate cannot be negative. Please enter a value of 0 or greater.' });
      return;
    }
    
    if (parseFloat(data.express_shipping_rate || 0) < 0) {
      setMsg({ kind: 'error', text: 'Express shipping rate cannot be negative. Please enter a value of 0 or greater.' });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Create FormData for file uploads
      const formData = new FormData();
      formData.append('store_name', data.store_name);
      formData.append('currency', data.currency);
      formData.append('tax_rate', parseFloat(data.tax_rate));
      formData.append('shipping_rate', parseFloat(data.shipping_rate));
      formData.append('standard_shipping_rate', parseFloat(data.standard_shipping_rate || 0));
      formData.append('express_shipping_rate', parseFloat(data.express_shipping_rate || 0));
      formData.append('street_address', data.street_address || '');
      formData.append('city', data.city || '');
      formData.append('postcode', data.postcode || '');
      formData.append('country', data.country || '');
      formData.append('phone', data.phone || '');
      formData.append('email', data.email || '');
      formData.append('monday_friday_hours', data.monday_friday_hours || '');
      formData.append('saturday_hours', data.saturday_hours || '');
      formData.append('sunday_hours', data.sunday_hours || '');
      
      if (storeLogoFile) {
        formData.append('store_logo', storeLogoFile);
      }
      if (aboutUsFile) {
        formData.append('about_us_picture', aboutUsFile);
      }
      if (faviconFile) {
        formData.append('favicon', faviconFile);
      }
      
      // Update backend settings
      await updateStoreSettings(formData);
      
      // Update local currency store
      setCurrency(data.currency);
      
      // Clear file inputs
      setStoreLogoFile(null);
      setAboutUsFile(null);
      setFaviconFile(null);
      
      setMsg({ kind: 'success', text: 'Settings saved successfully!' });
    } catch (err) {
      setError(err.message || 'Failed to save settings');
      console.error('Error saving settings:', err);
      setMsg({ kind: 'error', text: 'Failed to save settings: ' + (err.message || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  };

  if (!data && !error) return (
    <ThemeLayout>
      <ThemeCard>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚙️</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 font-medium">Loading settings...</div>
        </div>
      </ThemeCard>
    </ThemeLayout>
  );

  if (error) return (
    <ThemeLayout>
      <ThemeCard>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-red-200 to-red-300 dark:from-red-600 dark:to-red-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <div className="text-red-600 dark:text-red-400 font-medium">Error loading settings</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </ThemeCard>
    </ThemeLayout>
  );

  return (
    <ThemeLayout>
      <FaviconUpdater faviconUrl={data?.favicon} />
      
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
      
      <form onSubmit={save} className="space-y-8">
        <FormSection title="Store Settings" icon="🏪" color="primary">
          <div className="space-y-6">
            <ThemeInput
              label="Store Name"
              value={data.store_name || ''} 
              onChange={e=>setData(d=>({...d,store_name:e.target.value}))}
              placeholder="Enter store name"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Store Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setStoreLogoFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                />
                {data.store_logo && (
                  <div className="mt-2">
                    <img src={data.store_logo} alt="Current logo" className="h-16 w-16 object-cover rounded" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  About Us Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setAboutUsFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                />
                {data.about_us_picture && (
                  <div className="mt-2">
                    <img src={data.about_us_picture} alt="Current about us picture" className="h-16 w-16 object-cover rounded" />
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Favicon
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(32x32px recommended)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFaviconFile(e.target.files[0])}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
                />
                {data.favicon && (
                  <div className="mt-2">
                    <img src={data.favicon} alt="Current favicon" className="h-8 w-8 object-cover rounded" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </FormSection>
        
        <FormSection title="Store Location" icon="📍" color="primary">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemeInput
                label="Street Address"
                value={data.street_address || ''} 
                onChange={e=>setData(d=>({...d,street_address:e.target.value}))}
                placeholder="Enter street address"
              />
              
              <ThemeInput
                label="City"
                value={data.city || ''} 
                onChange={e=>setData(d=>({...d,city:e.target.value}))}
                placeholder="Enter city"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemeInput
                label="Postcode"
                value={data.postcode || ''} 
                onChange={e=>setData(d=>({...d,postcode:e.target.value}))}
                placeholder="Enter postcode"
              />
              
              <ThemeInput
                label="Country"
                value={data.country || ''} 
                onChange={e=>setData(d=>({...d,country:e.target.value}))}
                placeholder="Enter country"
              />
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> The store address will be displayed on the Find Us page and used for map integration.
              </div>
            </div>
          </div>
        </FormSection>
        
        <FormSection title="Contact Information" icon="📞" color="primary">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemeInput
                label="Phone"
                value={data.phone || ''} 
                onChange={e=>setData(d=>({...d,phone:e.target.value}))}
                placeholder="+1 (555) 123-4567"
              />
              
              <ThemeInput
                label="Email"
                type="email"
                value={data.email || ''} 
                onChange={e=>setData(d=>({...d,email:e.target.value}))}
                placeholder="info@yourstore.com"
              />
            </div>
          </div>
        </FormSection>
        
        <FormSection title="Business Hours" icon="🕒" color="primary">
          <div className="space-y-6">
            <ThemeInput
              label="Monday - Friday"
              value={data.monday_friday_hours || ''} 
              onChange={e=>setData(d=>({...d,monday_friday_hours:e.target.value}))}
              placeholder="9:00 AM - 6:00 PM"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemeInput
                label="Saturday"
                value={data.saturday_hours || ''} 
                onChange={e=>setData(d=>({...d,saturday_hours:e.target.value}))}
                placeholder="10:00 AM - 4:00 PM"
              />
              
              <ThemeInput
                label="Sunday"
                value={data.sunday_hours || ''} 
                onChange={e=>setData(d=>({...d,sunday_hours:e.target.value}))}
                placeholder="Closed"
              />
            </div>
            
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Business hours will be displayed on the Find Us page and contact sections.
              </div>
            </div>
          </div>
        </FormSection>
        
        <FormSection title="Global Settings" icon="⚙️" color="primary">
          <div className="space-y-6">
          <ThemeSelect
            label="Currency"
            value={data.currency} 
            onChange={e=>setData(d=>({...d,currency:e.target.value}))}
            options={currencyOptions.map(currency => ({ 
              value: currency.code, 
              label: `${currency.symbol} ${currency.name} (${currency.code})` 
            }))}
          />
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Selected: <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currencyOptions.find(c => c.code === data.currency)?.symbol || '£'}
              </span> {currencyOptions.find(c => c.code === data.currency)?.name || 'British Pound'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThemeInput
              label="Tax rate (%)"
              type="number" 
              step="0.01" 
              min="0"
              value={data.tax_rate} 
              onChange={e=>{
                const value = parseFloat(e.target.value);
                // Prevent negative values
                if (value < 0) return;
                setData(d=>({...d,tax_rate:e.target.value}));
              }} 
              placeholder="0.00"
            />
            
            <ThemeInput
              label={`Legacy Shipping rate (${currencyOptions.find(c => c.code === data.currency)?.symbol || '£'})`}
              type="number" 
              step="0.01" 
              min="0"
              value={data.shipping_rate} 
              onChange={e=>{
                const value = parseFloat(e.target.value);
                // Prevent negative values
                if (value < 0) return;
                setData(d=>({...d,shipping_rate:e.target.value}));
              }} 
              placeholder="0.00"
            />
          </div>
          
          {/* Individual Shipping Options */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">Shipping Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ThemeInput
                label={`Standard Shipping (${currencyOptions.find(c => c.code === data.currency)?.symbol || '£'})`}
                type="number" 
                step="0.01" 
                min="0"
                value={data.standard_shipping_rate || 0} 
                onChange={e=>{
                  const value = parseFloat(e.target.value);
                  // Prevent negative values
                  if (value < 0) return;
                  setData(d=>({...d,standard_shipping_rate:e.target.value}));
                }} 
                placeholder="0.00"
                helperText="5-7 business days"
              />
              
              <ThemeInput
                label={`Express Shipping (${currencyOptions.find(c => c.code === data.currency)?.symbol || '£'})`}
                type="number" 
                step="0.01" 
                min="0"
                value={data.express_shipping_rate || 0} 
                onChange={e=>{
                  const value = parseFloat(e.target.value);
                  // Prevent negative values
                  if (value < 0) return;
                  setData(d=>({...d,express_shipping_rate:e.target.value}));
                }} 
                placeholder="0.00"
                helperText="2-3 business days"
              />
            </div>
          </div>
          
            <div className="flex justify-end">
              <ThemeButton 
                type="submit" 
                variant="success" 
                icon="💾"
                className="whitespace-nowrap min-w-fit flex-shrink-0"
              >
                Save Settings
              </ThemeButton>
            </div>
          </div>
        </FormSection>
      </form>
    </ThemeLayout>
  );
}
