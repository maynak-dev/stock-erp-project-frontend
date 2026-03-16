import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../../services/api';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function StockChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    api.get('/reports/stock-summary')
      .then(res => {
        // Transform data for pie chart
        const chartData = Object.entries(res.data).map(([status, count]) => ({
          name: status.replace(/_/g, ' '),
          value: count
        }));
        setData(chartData);
      })
      .catch(console.error);
  }, []);

  if (data.length === 0) return <div className="bg-white shadow rounded-lg p-6">Loading chart...</div>;

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
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}