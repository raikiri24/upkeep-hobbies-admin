import React, { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  fallbackClassName = '' 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleImageLoad = () => {
    setHasError(false);
    setIsLoading(false);
  };

  if (!src) {
    return <ImageIcon className={`text-slate-600 w-5 h-5 ${fallbackClassName}`} />;
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 ${className} ${fallbackClassName}`}>
        <div className="flex flex-col items-center text-slate-500">
          <X className="w-6 h-6 mb-1" />
          <span className="text-xs">Failed to load</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        crossOrigin="anonymous"
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{ display: hasError ? 'none' : 'block' }}
      />
    </div>
  );
};