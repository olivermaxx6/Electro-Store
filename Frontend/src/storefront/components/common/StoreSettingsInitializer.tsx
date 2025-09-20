import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { setStoreSettings, setError } from '../../store/storeSettingsSlice';
import { getStoreSettings } from '../../services/storeSettingsApi';

const StoreSettingsInitializer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeStoreSettings = async () => {
      try {
        const settings = await getStoreSettings();
        dispatch(setStoreSettings(settings));
      } catch (error) {
        console.error('Failed to load store settings:', error);
        dispatch(setError('Failed to load store settings'));
      }
    };

    initializeStoreSettings();
  }, [dispatch]);

  return null; // This component doesn't render anything
};

export default StoreSettingsInitializer;
