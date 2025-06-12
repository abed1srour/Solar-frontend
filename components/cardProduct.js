'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProductCard({ product }) {
  const [selectedPriceType, setSelectedPriceType] = useState('customer');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Get the current price based on selection
  const getCurrentPrice = () => {
    switch (selectedPriceType) {
      case 'customer':
        return product.priceCustomer;
      case 'engineer':
        return product.priceEngineer;
      case 'original':
        return product.originalPrice;
      default:
        return product.priceCustomer;
    }
  };

  // Function to format price as whole number
  const formatPrice = (price) => {
    if (!price) return '0';
    return Math.round(price).toString();
  };

  // Handle image loading
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-orange-500 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
      {/* Product Image */}
      <div className="relative h-64" style={{ backgroundColor: '#ffffff' }}>
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        )}
        
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span>Image not available</span>
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-scale-down transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ padding: '8px' }}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
        
        <div className="absolute top-3 left-3">
          <span className="inline-block bg-orange-500 text-black px-2 py-1 rounded-full text-xs font-medium">
            {product.category}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-white truncate">
          {product.name}
        </h3>

        {/* Price Type Selection */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedPriceType('customer')}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              selectedPriceType === 'customer'
                ? 'bg-orange-500 text-black'
                : 'bg-gray-800 text-white border border-gray-700 hover:border-gray-600'
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => setSelectedPriceType('engineer')}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              selectedPriceType === 'engineer'
                ? 'bg-orange-500 text-black'
                : 'bg-gray-800 text-white border border-gray-700 hover:border-gray-600'
            }`}
          >
            Engineer
          </button>
          <button
            onClick={() => setSelectedPriceType('original')}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              selectedPriceType === 'original'
                ? 'bg-orange-500 text-black'
                : 'bg-gray-800 text-white border border-gray-700 hover:border-gray-600'
            }`}
          >
            Original
          </button>
        </div>

        {/* Pricing */}
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">
              ${formatPrice(getCurrentPrice())}
            </div>
            <div className="ml-2 text-sm text-gray-400">
              {selectedPriceType === 'customer' && 'Customer Price'}
              {selectedPriceType === 'engineer' && 'Engineer Price'}
              {selectedPriceType === 'original' && 'Buy Price'}
            </div>
          </div>
        </div>

        {/* Stock Status */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${
              product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'
            }`}
          ></div>
          <span
            className={`text-xs font-medium ${
              product.stock > 0 ? 'text-orange-500' : 'text-red-500'
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
          {product.description}
        </p>
      </div>
    </div>
  );
}
