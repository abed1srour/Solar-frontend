'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function ProductCard({ product, onDelete }) {
  const [selectedPriceType, setSelectedPriceType] = useState('customer');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let codeReader;
    if (showScanner) {
      codeReader = new BrowserMultiFormatReader();
      codeReader
        .listVideoInputDevices()
        .then((videoInputDevices) => {
          const selectedDeviceId = videoInputDevices[0]?.deviceId;
          codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
            if (result && result.getText() === product.barcode) {
              onDelete(product._id);
              stopScanner();
              codeReader.reset();
            }
          });
        });
      setScanning(true);
    }
    return () => {
      if (codeReader) codeReader.reset();
      setScanning(false);
    };
    // eslint-disable-next-line
  }, [showScanner]);

  const stopScanner = () => {
    setShowScanner(false);
  };

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

        {/* Barcode Section */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Barcode: {product.barcode || 'Not set'}</span>
          <button
            onClick={() => setShowScanner(true)}
            className="px-3 py-1 bg-orange-500 text-black rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <Camera className="h-4 w-4" />
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

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Scan Barcode or QR Code to Delete</h3>
              <button
                onClick={stopScanner}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <video ref={videoRef} className="w-full rounded" autoPlay muted playsInline />
            {scanning && <div className="text-gray-400 text-center mt-2">Point your camera at a barcode or QR code</div>}
          </div>
        </div>
      )}
    </div>
  );
}