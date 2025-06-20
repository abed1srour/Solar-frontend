'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Save, Camera, X } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

const categories = ['Panel', 'Inverter', 'Battery'];

export default function ProductForm({ mode, initialData = {} }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(initialData.imageUrl || '');
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef(null);
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [qrPool, setQrPool] = useState(initialData.qrPool || []);
  const [showAddQrScanner, setShowAddQrScanner] = useState(false);
  const [showRemoveQrScanner, setShowRemoveQrScanner] = useState(false);
  const [qrActionLoading, setQrActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    priceCustomer: initialData.priceCustomer?.toString() || '',
    priceEngineer: initialData.priceEngineer?.toString() || '',
    originalPrice: initialData.originalPrice?.toString() || '',
    category: initialData.category || 'Panel',
    imageUrl: initialData.imageUrl || '',
    stock: initialData.stock?.toString() || '10',
    barcode: initialData.barcode || ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let html5QrCode;
    if (showScanner) {
      const qrRegionId = 'qr-reader';
      html5QrCode = new Html5Qrcode(qrRegionId);
      Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
          html5QrCode.start(
            cameras[0].id,
            {
              fps: 10,
              qrbox: { width: 250, height: 250 }
            },
            (decodedText, decodedResult) => {
              setFormData((prev) => ({ ...prev, barcode: decodedText }));
              // Save the barcode to the database
              fetch('https://solar-backend-opi8.onrender.com/api/barcodes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  value: decodedText,
                  label: formData.name || 'Product Barcode'
                })
              }).catch(error => console.error('Error saving barcode:', error));
              stopScanner();
              html5QrCode.stop().then(() => html5QrCode.clear());
            },
            (errorMessage) => {
              // Optionally handle scan errors
            }
          ).catch(err => {
            alert('Unable to start the camera.');
            stopScanner();
          });
        } else {
          alert('No camera found.');
          stopScanner();
        }
      }).catch(err => {
        alert('Camera access error.');
        stopScanner();
      });
      setScanning(true);
    }
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().then(() => html5QrCode.clear());
      }
      setScanning(false);
    };
  }, [showScanner, formData.name]);

  const stopScanner = () => {
    setShowScanner(false);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Update preview for image URL
    if (name === 'imageUrl') {
      setPreview(value);
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.priceCustomer || isNaN(parseFloat(formData.priceCustomer)) || parseFloat(formData.priceCustomer) <= 0) {
      newErrors.priceCustomer = 'Valid customer price is required';
    }
    
    if (!formData.priceEngineer || isNaN(parseFloat(formData.priceEngineer)) || parseFloat(formData.priceEngineer) <= 0) {
      newErrors.priceEngineer = 'Valid engineer price is required';
    } else if (parseFloat(formData.priceEngineer) >= parseFloat(formData.priceCustomer)) {
      newErrors.priceEngineer = 'Engineer price should be lower than customer price';
    }
    
    if (formData.originalPrice && (isNaN(parseFloat(formData.originalPrice)) || parseFloat(formData.originalPrice) <= 0)) {
      newErrors.originalPrice = 'Original price must be a valid number';
    }
    
    if (!formData.imageUrl.trim()) {
      newErrors.imageUrl = 'Image URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL starting with http:// or https://';
    }
    
    if (!formData.stock || isNaN(parseInt(formData.stock))) {
      newErrors.stock = 'Valid stock quantity is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const apiUrl = 'https://solar-backend-opi8.onrender.com';
      const endpoint = mode === 'edit'
        ? `${apiUrl}/api/products/${initialData._id}`
        : `${apiUrl}/api/products`;

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          priceCustomer: parseFloat(formData.priceCustomer),
          priceEngineer: parseFloat(formData.priceEngineer),
          originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
          category: formData.category,
          imageUrl: formData.imageUrl,
          stock: parseInt(formData.stock),
          barcode: formData.barcode
        })
      });

      if (!res.ok) throw new Error('Failed to submit product');
      router.push('/products/list');
    } catch (err) {
      console.error(err.message);
      setErrors({
        form: 'Failed to save product. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch latest qrPool if in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData._id) {
      fetch(`https://solar-backend-opi8.onrender.com/api/products/${initialData._id}`)
        .then(res => res.json())
        .then(data => setQrPool(data.qrPool || []));
    }
  }, [mode, initialData._id]);

  // Add QR to pool handler
  const handleAddQr = async (qr) => {
    setQrActionLoading(true);
    try {
      const res = await fetch(`https://solar-backend-opi8.onrender.com/api/products/${initialData._id}/qr-pool/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr })
      });
      if (!res.ok) throw new Error('Failed to add QR');
      const updated = await res.json();
      setQrPool(updated.qrPool);
    } catch (err) {
      alert('Failed to add QR: ' + err.message);
    } finally {
      setQrActionLoading(false);
      setShowAddQrScanner(false);
    }
  };

  // Remove QR from pool handler
  const handleRemoveQr = async (qr) => {
    setQrActionLoading(true);
    try {
      const res = await fetch(`https://solar-backend-opi8.onrender.com/api/products/${initialData._id}/qr-pool/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr })
      });
      if (!res.ok) throw new Error('Failed to remove QR');
      const updated = await res.json();
      setQrPool(updated.qrPool);
    } catch (err) {
      alert('Failed to remove QR: ' + err.message);
    } finally {
      setQrActionLoading(false);
      setShowRemoveQrScanner(false);
    }
  };

  // Scanner for adding QR
  useEffect(() => {
    let html5QrCode;
    if (showAddQrScanner) {
      const qrRegionId = 'qr-add-reader';
      html5QrCode = new Html5Qrcode(qrRegionId);
      Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
          html5QrCode.start(
            cameras[0].id,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              handleAddQr(decodedText);
              html5QrCode.stop().then(() => html5QrCode.clear());
            },
            () => {}
          ).catch(() => {
            alert('Unable to start the camera.');
            setShowAddQrScanner(false);
          });
        } else {
          alert('No camera found.');
          setShowAddQrScanner(false);
        }
      }).catch(() => {
        alert('Camera access error.');
        setShowAddQrScanner(false);
      });
    }
    return () => {
      if (html5QrCode) html5QrCode.stop().then(() => html5QrCode.clear());
    };
  }, [showAddQrScanner]);

  // Scanner for removing QR
  useEffect(() => {
    let html5QrCode;
    if (showRemoveQrScanner) {
      const qrRegionId = 'qr-remove-reader';
      html5QrCode = new Html5Qrcode(qrRegionId);
      Html5Qrcode.getCameras().then(cameras => {
        if (cameras && cameras.length) {
          html5QrCode.start(
            cameras[0].id,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              handleRemoveQr(decodedText);
              html5QrCode.stop().then(() => html5QrCode.clear());
            },
            () => {}
          ).catch(() => {
            alert('Unable to start the camera.');
            setShowRemoveQrScanner(false);
          });
        } else {
          alert('No camera found.');
          setShowRemoveQrScanner(false);
        }
      }).catch(() => {
        alert('Camera access error.');
        setShowRemoveQrScanner(false);
      });
    }
    return () => {
      if (html5QrCode) html5QrCode.stop().then(() => html5QrCode.clear());
    };
  }, [showRemoveQrScanner]);

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{errors.form}</p>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full py-3 px-4 bg-gray-700 border ${errors.name ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g. 500W Solar Panel"
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full py-3 px-4 bg-gray-700 border ${errors.category ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Customer Price ($)</label>
                  <input
                    type="number"
                    name="priceCustomer"
                    value={formData.priceCustomer}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full py-3 px-4 bg-gray-700 border ${errors.priceCustomer ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g. 299.99"
                  />
                  {errors.priceCustomer && <p className="mt-1 text-sm text-red-500">{errors.priceCustomer}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Engineer Price ($)</label>
                  <input
                    type="number"
                    name="priceEngineer"
                    value={formData.priceEngineer}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full py-3 px-4 bg-gray-700 border ${errors.priceEngineer ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    placeholder="e.g. 249.99"
                  />
                  {errors.priceEngineer && <p className="mt-1 text-sm text-red-500">{errors.priceEngineer}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Original Price ($) <span className="text-gray-500 text-xs">(Buy/cost price)</span>
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full py-3 px-4 bg-gray-700 border ${errors.originalPrice ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g. 200.00"
                />
                {errors.originalPrice && <p className="mt-1 text-sm text-red-500">{errors.originalPrice}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className={`w-full py-3 px-4 bg-gray-700 border ${errors.stock ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="e.g. 10"
                />
                {errors.stock && <p className="mt-1 text-sm text-red-500">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Barcode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleChange}
                    className="flex-1 py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Scan or enter barcode"
                  />
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className={`w-full py-3 px-4 bg-gray-700 border ${errors.imageUrl ? 'border-red-500' : 'border-gray-600'} rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.imageUrl && <p className="mt-1 text-sm text-red-500">{errors.imageUrl}</p>}
              </div>
              
              {preview && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Image Preview</label>
                  <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe the product's features and specifications..."
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <ArrowLeft className="h-5 w-5 inline-block mr-2" />
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5 inline-block mr-2" />
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Scan Barcode or QR Code</h3>
              <button
                onClick={stopScanner}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div id="qr-reader" style={{ width: '100%' }} />
            {scanning && <div className="text-gray-400 text-center mt-2">Point your camera at a barcode or QR code</div>}
          </div>
        </div>
      )}

      {/* QR Pool Management UI (only in edit mode) */}
      {mode === 'edit' && initialData._id && (
        <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold text-white">QR Pool (Stock: {qrPool.length})</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddQrScanner(true)}
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                disabled={qrActionLoading}
              >
                + Scan QR to Add
              </button>
              <button
                type="button"
                onClick={() => setShowRemoveQrScanner(true)}
                className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={qrActionLoading}
              >
                - Scan QR to Remove
              </button>
            </div>
          </div>
          <ul className="divide-y divide-gray-800 max-h-40 overflow-y-auto">
            {qrPool.length === 0 && <li className="text-gray-400 py-2">No QR codes in pool.</li>}
            {qrPool.map(qr => (
              <li key={qr} className="flex items-center justify-between py-2">
                <span className="text-white font-mono text-xs">{qr}</span>
                <button
                  type="button"
                  className="px-2 py-1 bg-red-700 text-white rounded text-xs hover:bg-red-800"
                  onClick={() => handleRemoveQr(qr)}
                  disabled={qrActionLoading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Add QR Scanner Modal */}
      {showAddQrScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Scan QR to Add</h3>
              <button
                onClick={() => setShowAddQrScanner(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div id="qr-add-reader" style={{ width: '100%' }} />
            {qrActionLoading && <div className="text-gray-400 text-center mt-2">Processing...</div>}
          </div>
        </div>
      )}

      {/* Remove QR Scanner Modal */}
      {showRemoveQrScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">Scan QR to Remove</h3>
              <button
                onClick={() => setShowRemoveQrScanner(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div id="qr-remove-reader" style={{ width: '100%' }} />
            {qrActionLoading && <div className="text-gray-400 text-center mt-2">Processing...</div>}
          </div>
        </div>
      )}
    </div>
  );
}
