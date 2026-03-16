import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../../services/api';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function StockChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // FIX: Changed '/reports/stock-summary' → '/reports/stock' (correct backend route)
    api.get('/reports/stock')
      .then(res => {
        // FIX: Backend returns array of { productId, status, _sum: { quantity } }
        // (not an object of { status: count }) — so we group by status manually
        const grouped = res.data.reduce((acc, item) => {
          const status = item.status.replace(/_/g, ' ');
          const qty = item._sum?.quantity ?? 0;
          const existing = acc.find(d => d.name === status);
          if (existing) {
            existing.value += qty;
          } else {
            acc.push({ name: status, value: qty });
          }
          return acc;
        }, []);
        setData(grouped);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load stock data.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="bg-white shadow rounded-lg p-6 text-gray-500">Loading chart...</div>;
  }

  if (error) {
    return <div className="bg-white shadow rounded-lg p-6 text-red-500">{error}</div>;
  }

  if (data.length === 0) {
    return <div className="bg-white shadow rounded-lg p-6 text-gray-500">No stock data available.</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Stock Distribution</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Quantity']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}