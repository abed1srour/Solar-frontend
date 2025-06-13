import React, { useEffect, useState } from 'react';

export default function BarcodesPage() {
  const [barcodes, setBarcodes] = useState([]);
  const [newBarcode, setNewBarcode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchBarcodes = async () => {
    const res = await fetch('https://solar-backend-opi8.onrender.com/api/barcodes');
    const data = await res.json();
    setBarcodes(data);
  };

  useEffect(() => {
    fetchBarcodes();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    await fetch('https://solar-backend-opi8.onrender.com/api/barcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: newBarcode, label: newLabel })
    });
    setNewBarcode('');
    setNewLabel('');
    setLoading(false);
    fetchBarcodes();
  };

  const handleDelete = async (id) => {
    await fetch(`https://solar-backend-opi8.onrender.com/api/barcodes/${id}`, { method: 'DELETE' });
    fetchBarcodes();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-800 rounded-xl shadow-lg border border-gray-700 mt-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Barcodes Management</h1>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newBarcode}
          onChange={e => setNewBarcode(e.target.value)}
          placeholder="Barcode value (QR or barcode)"
          className="flex-1 py-2 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white"
          required
        />
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder="Label (optional)"
          className="flex-1 py-2 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          Add
        </button>
      </form>
      <ul className="divide-y divide-gray-700">
        {barcodes.map(b => (
          <li key={b._id} className="flex items-center justify-between py-2">
            <div>
              <span className="text-white font-mono">{b.value}</span>
              {b.label && <span className="ml-2 text-gray-400">({b.label})</span>}
            </div>
            <button
              onClick={() => handleDelete(b._id)}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
} 