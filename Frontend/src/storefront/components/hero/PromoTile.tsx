import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Placeholder from '../common/Placeholder';

interface PromoTileProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  image?: string | null;
  className?: string;
}

const PromoTile: React.FC<PromoTileProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  image,
  className = '',
}) => {
  return (
    <div className={`group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${className}`}>
      {/* Background Image */}
      {image ? (
        <div className="w-full h-80 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${image})` }} />
      ) : (
        <Placeholder ratio="16/9" className="w-full h-80">
          <div className="bg-gradient-to-br from-red-500 via-red-600 to-red-700 dark:from-blue-500 dark:via-blue-600 dark:to-blue-700 w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* Animated background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="text-center text-white relative z-10">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                <Sparkles className="w-10 h-10" />
              </div>
              <span className="text-sm font-medium">Promo Image</span>
            </div>
          </div>
        </Placeholder>
      )}
      
      {/* Modern Gradient Overlay - Different for light/dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/50 to-black/70 dark:from-black/40 dark:via-black/60 dark:to-black/80 transition-opacity duration-500 group-hover:opacity-90" />
      
      {/* Glassmorphism overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-white/10 to-white/5 dark:from-white/5 dark:via-white/10 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-sm" />
      
      {/* Decorative Elements with modern styling */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-600/20 to-transparent dark:from-blue-400/20 dark:to-transparent transform rotate-45 translate-x-20 -translate-y-20 transition-transform duration-500 group-hover:scale-110" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-gray-700/30 to-transparent dark:from-blue-500/30 dark:to-transparent transform -rotate-45 -translate-x-16 translate-y-16 transition-transform duration-500 group-hover:scale-110" />
      
      {/* Floating particles effect */}
      <div className="absolute top-4 right-4 w-2 h-2 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
      <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      <div className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-600 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      {/* Content Overlay with improved typography */}
      <div className="absolute inset-0 flex flex-col justify-center items-start p-8">
        <div className="space-y-6">
          {/* Title with enhanced styling */}
          <div className="space-y-2">
            <h3 className="text-white text-3xl font-bold leading-tight tracking-tight group-hover:text-white/95 transition-colors duration-300">
              {title}
            </h3>
            <div className="w-12 h-1 bg-gradient-to-r from-gray-600 to-gray-800 dark:from-blue-400 dark:to-blue-600 rounded-full transition-transform duration-500 group-hover:w-16"></div>
          </div>
          
          {/* Subtitle with better readability */}
          <p className="text-white/90 text-lg leading-relaxed max-w-xs font-medium group-hover:text-white transition-colors duration-300">
            {subtitle}
          </p>
          
          {/* CTA Button with modern design */}
          <Link
            to={ctaLink}
            className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-xl hover:bg-white/25 transition-all duration-300 border border-white/30 hover:border-white/50 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group/btn"
          >
            <span className="relative z-10 flex items-center gap-3">
              {ctaText}
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </span>
            
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-out"></div>
          </Link>
        </div>
      </div>
      
      {/* Enhanced hover effect with color-specific overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/15 via-gray-900/10 to-black/20 dark:from-blue-500/10 dark:via-blue-600/5 dark:to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Border glow effect */}
      <div className="absolute inset-0 rounded-2xl border border-white/20 dark:border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};

export default PromoTile;