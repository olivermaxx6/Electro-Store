import { useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';

const FaviconUpdater: React.FC = () => {
  const { storeSettings } = useStore();

  useEffect(() => {
    if (storeSettings.favicon) {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());

      // Create new favicon link
      const faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/x-icon';
      faviconLink.href = storeSettings.favicon;
      
      // Add to document head
      document.head.appendChild(faviconLink);

      // Also add apple-touch-icon for mobile devices
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = storeSettings.favicon;
      document.head.appendChild(appleTouchIcon);
    }
  }, [storeSettings.favicon]);

  return null; // This component doesn't render anything
};

export default FaviconUpdater;
