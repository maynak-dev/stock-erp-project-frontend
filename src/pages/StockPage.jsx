import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import StockTable from '../components/Stock/StockTable';
import AddStockModal from '../components/Stock/AddStockModal';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function StockPage() {
  const [stock, setStock] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const fetchStock = async () => {
    const res = await api.get('/stock');
    setStock(res.data);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Stock Management</h1>
        {(user.role === 'COMPANY_ADMIN' || user.role === 'LOCATION_MANAGER' || user.role === 'SHOP_OWNER') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Stock
          </button>
        )}
      </div>

      <StockTable data={stock} />

      <AddStockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchStock}
      />
    </div>
  );
}