'use client';

import { useEffect, useState } from 'react';
import { Edit3, Trash2, Search, Package, Filter, Grid, List, PlusCircle, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Use Render backend URL
      const apiUrl = 'https://solar-backend-opi8.onrender.com';
      const res = await fetch(`${apiUrl}/api/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setProductToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      // Use Render backend URL
      const apiUrl = 'https://solar-backend-opi8.onrender.com';
      const res = await fetch(`${apiUrl}/api/products/${productToDelete}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      await fetchProducts();
    } catch (err) {
      console.error(err.message);
    } finally {
      setShowConfirmDialog(false);
      setProductToDelete(null);
    }
  };

  // Function to format price as whole number
  const formatPrice = (price) => {
    if (!price) return '0';
    return Math.round(price).toString();
  };

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Filter products by search term and category
  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header with action buttons */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Product Inventory</h1>
            <p className="text-gray-400 mt-1">Manage your solar products inventory</p>
          </div>
          <button 
            onClick={() => router.push('/products/add')}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-black font-medium py-2 px-4 rounded-lg transition-all"
          >
            <PlusCircle size={18} />
            Add New Product
          </button>
        </div>

        {/* Search and filters */}
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-4 items-center">
              <div className="relative inline-block">
                <div className="flex items-center gap-2 bg-orange-500 rounded-lg px-3 py-2 text-black cursor-pointer">
                  <Tag size={18} className="text-black" />
                  <select 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-orange-500 text-black border-none focus:ring-0 font-medium appearance-none cursor-pointer pr-8"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <Filter className="h-4 w-4 text-black absolute right-3 pointer-events-none" />
                </div>
                <style jsx>{`
                  select option {
                    background-color: #1f2937;
                    color: white;
                  }
                `}</style>
              </div>
              
              <div className="flex items-center gap-0 border border-gray-600 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-black' : 'bg-gray-700 text-gray-300'}`}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-black' : 'bg-gray-700 text-gray-300'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Product Grid View */}
            {viewMode === 'grid' && (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((product) => (
                  <div key={product._id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-orange-500 transition-all shadow-lg hover:shadow-orange-500/10">
                    <div className="relative h-48" style={{ backgroundColor: '#ffffff' }}>
                      {/* Loading spinner */}
                      <div className="absolute inset-0 flex items-center justify-center" id={`loader-${product._id}`}>
                        <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                      </div>
                      
                      <img 
                        src={product.imageUrl || 'https://via.placeholder.com/400x300'} 
                        alt={product.name} 
                        className="w-full h-full object-scale-down"
                        style={{ padding: '8px', maxHeight: '100%', maxWidth: '100%' }}
                        loading="lazy"
                        onLoad={() => {
                          document.getElementById(`loader-${product._id}`)?.classList.add('hidden');
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                          document.getElementById(`loader-${product._id}`)?.classList.add('hidden');
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-block bg-orange-500 text-black px-2 py-1 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                      <p className="text-sm text-gray-400 line-clamp-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-orange-500">${formatPrice(product.priceCustomer)}</span>
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-xs font-medium ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <button
                          onClick={() => router.push(`/products/edit/${product._id}`)}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <Edit3 className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => confirmDelete(product._id)}
                          className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Product List View */}
            {viewMode === 'list' && (
              <div className="overflow-hidden rounded-xl border border-gray-700 divide-y divide-gray-700">
                {filtered.map((product) => (
                  <div key={product._id} className="flex flex-col sm:flex-row bg-gray-800 hover:bg-gray-750 p-4 gap-4">
                    <div className="sm:w-24 sm:h-24 h-40 flex-shrink-0" style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem' }}>
                      {/* Loading spinner */}
                      <div className="absolute inset-0 flex items-center justify-center" id={`loader-list-${product._id}`}>
                        <div className="w-6 h-6 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                      </div>
                      
                      <img 
                        src={product.imageUrl || 'https://via.placeholder.com/400x300'} 
                        alt={product.name} 
                        className="w-full h-full object-scale-down rounded-lg" 
                        style={{ padding: '4px' }}
                        loading="lazy"
                        onLoad={() => {
                          document.getElementById(`loader-list-${product._id}`)?.classList.add('hidden');
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                          document.getElementById(`loader-list-${product._id}`)?.classList.add('hidden');
                        }}
                      />
                    </div>
                    <div className="flex-grow space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                          <span className="inline-block bg-orange-500 text-black px-2 py-0.5 rounded-full text-xs font-medium mt-1">
                            {product.category}
                          </span>
                        </div>
                        <span className="text-xl font-bold text-orange-500">${formatPrice(product.priceCustomer)}</span>
                      </div>
                      <p className="text-sm text-gray-400">{product.description}</p>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`ml-1 text-xs font-medium ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0 sm:w-32 flex-shrink-0 justify-end">
                      <button
                        onClick={() => router.push(`/products/edit/${product._id}`)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit3 className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => confirmDelete(product._id)}
                        className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
                <Package className="mx-auto h-16 w-16 text-gray-600" />
                <h3 className="mt-4 text-xl font-medium text-white">No products found</h3>
                <p className="mt-2 text-gray-400">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
                  className="mt-4 px-4 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Are you sure?</h3>
              <p className="text-gray-400 mb-6">
                Do you really want to delete this product? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
