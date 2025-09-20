import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface TitleUpdaterProps {
  pageTitle?: string;
}

const TitleUpdater: React.FC<TitleUpdaterProps> = ({ pageTitle }) => {
  const storeSettings = useSelector((state: RootState) => state.storeSettings.storeSettings);

  useEffect(() => {
    const storeName = storeSettings?.store_name || 'Storefront';
    
    if (pageTitle) {
      document.title = `${storeName} - ${pageTitle}`;
    } else {
      document.title = storeName;
    }
  }, [storeSettings?.store_name, pageTitle]);

  return null; // This component doesn't render anything
};

export default TitleUpdater;
