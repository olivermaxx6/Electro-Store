import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    // Use requestAnimationFrame to ensure DOM is ready
    const scrollToTop = () => {
      // Check if we're at the top already to avoid unnecessary scrolling
      if (window.scrollY > 0) {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      }
    };

    // Use requestAnimationFrame for better timing
    requestAnimationFrame(scrollToTop);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
