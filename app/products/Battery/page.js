'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/cardProduct';
import { Filter, ChevronDown } from 'lucide-react';

export default function BatteryProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price-asc');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Use Render backend URL
        const apiUrl = 'https://solar-backend-opi8.onrender.com';
        const res = await fetch(`${apiUrl}/api/products`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }
        
        const allProducts = await res.json();
        // Filter for Battery category
        const batteries = allProducts.filter(product => product.category === 'Battery');
        setProducts(batteries);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch batteries:', err);
        setError('Could not load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.priceCustomer - b.priceCustomer;
      case 'price-desc':
        return b.priceCustomer - a.priceCustomer;
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  return (
    <div className="py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Batteries</h1>
            <p className="text-gray-400 mt-1">Energy storage solutions for your solar power system</p>
          </div>
          
          <div className="flex items-center bg-gray-800 rounded-lg border border-gray-700 p-2">
            <Filter size={18} className="text-gray-400 mr-2" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white border-none outline-none pr-8 appearance-none"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            <ChevronDown size={16} className="text-gray-400 ml-1" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-red-400">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-gray-400 text-lg">No batteries found in our inventory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
