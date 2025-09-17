import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Placeholder from '../common/Placeholder';

interface PromoTileProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  className?: string;
}

const PromoTile: React.FC<PromoTileProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  className = '',
}) => {
  return (
    <div className={`group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Background Image Placeholder */}
      <Placeholder ratio="16/9" className="w-full h-80">
        <div className="bg-red-600 dark:bg-blue-600 w-full h-full flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Promo Image</span>
          </div>
        </div>
      </Placeholder>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/40 to-black/60" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent/20 to-transparent transform rotate-45 translate-x-20 -translate-y-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/30 to-transparent transform -rotate-45 -translate-x-16 translate-y-16" />
      
      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-start p-8">
        <div className="space-y-4">
          <h3 className="text-white text-2xl font-bold leading-tight">{title}</h3>
          <p className="text-white/90 text-base leading-relaxed max-w-xs">{subtitle}</p>
          <Link
            to={ctaLink}
            className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-md hover:bg-white/20 transition-colors border border-white/20"
          >
            <span className="font-medium">{ctaText}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
};

export default PromoTile;