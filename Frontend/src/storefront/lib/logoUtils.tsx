/**
 * Utility function to construct proper logo URLs
 * Handles both relative and absolute URLs consistently across the application
 */
export const getLogoUrl = (logoPath: string | null | undefined): string | null => {
  if (!logoPath) return null;
  
  // If it's already a full URL, return as is
  if (logoPath.startsWith('http')) {
    return logoPath;
  }
  
  // If it's a relative path, construct the full URL with backend server
  return `http://127.0.0.1:8001${logoPath}`;
};

/**
 * Logo component with consistent error handling
 */
export const LogoImage: React.FC<{
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackText?: string;
}> = ({ src, alt, className = "w-8 h-8 rounded-full object-cover", fallbackText = "S" }) => {
  const logoUrl = getLogoUrl(src);
  
  if (!logoUrl) {
    return (
      <div className={`${className} bg-red-600 dark:bg-blue-600 flex items-center justify-center`}>
        <span className="text-white font-bold text-lg">
          {fallbackText}
        </span>
      </div>
    );
  }
  
  return (
    <img 
      src={logoUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        console.error('Logo failed to load:', src);
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
      }}
    />
  );
};
