import { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import FormRow from '../../components/ui/FormRow';
import { ThemeLayout, ThemeCard, ThemeInput, ThemeSelect, ThemeButton, ThemeAlert, FormSection } from '@shared/theme';
import { useCurrency, currencyOptions } from '../../store/currencyStore';
import { getStoreSettings, updateStoreSettings } from '../../lib/api';

export default function SettingsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currency, setCurrency, getCurrentCurrency } = useCurrency();

  useEffect(()=>{ (async()=>{
    try {
      setLoading(true);
      setError(null);
      const { data } = await getStoreSettings();
      setData(data);
      // Update local currency store to match backend
      setCurrency(data.currency);
    } catch (err) {
      setError(err.message || 'Failed to load settings');
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  })(); }, []);

  const save = async (e) => {
    e.preventDefault();
    
    // Validate tax rate is not negative
    if (parseFloat(data.tax_rate) < 0) {
      alert('Tax rate cannot be negative. Please enter a value of 0 or greater.');
      return;
    }
    
    // Validate shipping rate is not negative
    if (parseFloat(data.shipping_rate) < 0) {
      alert('Shipping rate cannot be negative. Please enter a value of 0 or greater.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Update backend settings
      await updateStoreSettings({
        currency: data.currency,
        tax_rate: parseFloat(data.tax_rate),
        shipping_rate: parseFloat(data.shipping_rate)
      });
      
      // Update local currency store
      setCurrency(data.currency);
      
      alert('Settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to save settings');
      console.error('Error saving settings:', err);
      alert('Failed to save settings: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!data) return (
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

  return (
    <ThemeLayout>
      <FormSection title="Global Settings" icon="⚙️" color="primary">
        <form onSubmit={save} className="space-y-6">
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
              label={`Shipping rate (${currencyOptions.find(c => c.code === data.currency)?.symbol || '£'})`}
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
        </form>
      </FormSection>
    </ThemeLayout>
  );
}
