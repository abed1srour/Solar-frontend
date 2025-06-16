"use client";

import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProductDashboardPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
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

  // Metrics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + (p.qrPool ? p.qrPool.length : 0), 0);
  const lowStockProducts = products.filter(p => (p.qrPool ? p.qrPool.length : 0) < 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <h1 className="text-3xl font-bold text-white mb-4">Product Dashboard</h1>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
                <span className="text-4xl font-bold text-orange-500">{totalProducts}</span>
                <span className="text-gray-300 mt-2">Total Products</span>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
                <span className="text-4xl font-bold text-green-400">{totalStock}</span>
                <span className="text-gray-300 mt-2">Total Stock (QR Units)</span>
              </div>
              <div className="bg-gray-800 rounded-xl p-6 flex flex-col items-center">
                <span className="text-4xl font-bold text-red-400">{lowStockProducts.length}</span>
                <span className="text-gray-300 mt-2">Low Stock Products (&lt; 5)</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-gray-800 rounded-xl p-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">Stock per Product</h2>
              {products.length > 0 ? (
                <Bar
                  data={{
                    labels: products.map((p) => p.name),
                    datasets: [
                      {
                        label: 'Stock (QRs)',
                        data: products.map((p) => (p.qrPool ? p.qrPool.length : 0)),
                        backgroundColor: products.map((p) =>
                          (p.qrPool && p.qrPool.length < 5)
                            ? 'rgba(239, 68, 68, 0.8)' // red-500 for low stock
                            : 'rgba(251, 146, 60, 0.8)' // orange-400 for normal
                        ),
                        borderRadius: 6,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      title: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#fb923c',
                        bodyColor: '#fff',
                        borderColor: '#fb923c',
                        borderWidth: 1,
                      },
                    },
                    scales: {
                      x: {
                        ticks: { color: '#fff', font: { weight: 'bold' } },
                        grid: { color: 'rgba(55,65,81,0.5)' },
                      },
                      y: {
                        beginAtZero: true,
                        ticks: { color: '#fb923c', font: { weight: 'bold' } },
                        grid: { color: 'rgba(55,65,81,0.5)' },
                      },
                    },
                  }}
                  height={80}
                />
              ) : (
                <div className="text-gray-400">No products to display.</div>
              )}
            </div>

            {/* Product Table */}
            <div className="bg-gray-800 rounded-xl p-6 mt-8">
              <h2 className="text-xl font-semibold mb-4">Product Stock Table</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Stock (QRs)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {products.map((p) => (
                      <tr key={p._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{p.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{p.category}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{p.qrPool ? p.qrPool.length : 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 