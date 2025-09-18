import { useEffect } from 'react';

const FaviconUpdater = ({ faviconUrl }) => {
  useEffect(() => {
    if (faviconUrl) {
      // Remove existing favicon links
      const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
      existingFavicons.forEach(link => link.remove());

      // Create new favicon link
      const faviconLink = document.createElement('link');
      faviconLink.rel = 'icon';
      faviconLink.type = 'image/x-icon';
      faviconLink.href = faviconUrl;
      
      // Add to document head
      document.head.appendChild(faviconLink);

      // Also add apple-touch-icon for mobile devices
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = faviconUrl;
      document.head.appendChild(appleTouchIcon);
    }
  }, [faviconUrl]);

  return null; // This component doesn't render anything
};

export default FaviconUpdater;
