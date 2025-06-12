'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import ProductForm from '@/components/ProductForm';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Use Render backend URL
        const apiUrl = 'https://solar-backend-opi8.onrender.com';
        const res = await fetch(`${apiUrl}/api/products/${id}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch product: ${res.status}`);
        }
        
        const data = await res.json();
        setProduct(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Could not load the product. It may have been deleted or the server is unavailable.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Product</h1>
            <p className="text-gray-400 mt-1">Update an existing product in your inventory</p>
          </div>
          <button 
            onClick={() => router.push('/products/list')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
          >
            <ArrowLeft size={18} />
            Back to List
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-gray-800 rounded-xl p-10 border border-gray-700 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Product Not Found</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/products/list')}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-black font-medium rounded-lg transition-colors"
            >
              Return to Product List
            </button>
          </div>
        )}

        {/* Form */}
        {!loading && !error && product && (
          <ProductForm mode="edit" initialData={product} />
        )}
      </div>
    </div>
  );
}
