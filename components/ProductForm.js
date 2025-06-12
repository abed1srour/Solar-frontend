'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Save } from 'lucide-react';

const categories = ['Panel', 'Inverter', 'Battery'];

export default function ProductForm({ mode, initialData = {} }) {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(initialData.imageUrl || '');

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    priceCustomer: initialData.priceCustomer?.toString() || '',
    priceEngineer: initialData.priceEngineer?.toString() || '',
    originalPrice: initialData.originalPrice?.toString() || '',
    category: initialData.category || 'Panel',
    imageUrl: initialData.imageUrl || '',
    stock: initialData.stock?.toString() || '10'
  });

  const [loading, setLoading] = useState(false);

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
      // Use Render backend URL
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
          stock: parseInt(formData.stock)
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
              
              <div className="aspect-square bg-gray-700 rounded-lg border border-gray-600 overflow-hidden flex items-center justify-center">
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Product preview" 
                    className="w-full h-full object-contain p-4"
                    onError={() => setPreview('')}
                  />
                ) : (
                  <div className="text-gray-500 text-center p-4">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p>Image preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe the product's features and specifications..."
            />
          </div>
          
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={() => router.push('/products/list')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              Back to List
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              <Save size={18} />
              {loading
                ? 'Saving...'
                : mode === 'edit'
                ? 'Update Product'
                : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
