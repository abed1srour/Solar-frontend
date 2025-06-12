'use client';

import { ArrowLeft, Package } from 'lucide-react';
import ProductForm from '@/components/ProductForm';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Product</h1>
            <p className="text-gray-400 mt-1">Create a new product to add to your inventory</p>
          </div>
          <button 
            onClick={() => router.push('/products/list')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors border border-gray-700"
          >
            <ArrowLeft size={18} />
            Back to List
          </button>
        </div>

        {/* Form Container */}
        <ProductForm mode="add" />
      </div>
    </div>
  );
}
