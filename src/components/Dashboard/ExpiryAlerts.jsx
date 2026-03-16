import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format } from 'date-fns';

export default function ExpiryAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get('/expiry?days=7')
      .then(res => setAlerts(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Expiring Soon (7 days)</h2>
      {alerts.length === 0 ? (
        <p className="text-gray-500">No items expiring soon.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {alerts.map((item) => (
            <li key={item.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                <p className="text-sm text-gray-500">Batch: {item.batchNumber}</p>
              </div>
              <div className="text-sm text-red-600 font-semibold">
                {format(new Date(item.expiryDate), 'dd/MM/yyyy')}
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <Link to="/expiry" className="text-sm text-indigo-600 hover:text-indigo-900">
          View all expiry alerts →
        </Link>
      </div>
    </div>
  );
}