import { useState, useEffect } from 'react';
import { CurrencyDollarIcon, CubeIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StatsCards from '../components/Dashboard/StatsCards';
import ExpiryAlerts from '../components/Dashboard/ExpiryAlerts';
import StockChart from '../components/Dashboard/StockChart';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: 'Total Stock Value', value: '$0', icon: CurrencyDollarIcon },
    { name: 'Total Items', value: '0', icon: CubeIcon },
    { name: 'Expiring Soon', value: '0', icon: ClockIcon },
    { name: 'Pending Returns', value: '0', icon: ArrowPathIcon },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stockRes, expiryRes, returnsRes] = await Promise.all([
          api.get('/stock'),
          api.get('/expiry?days=7'),
          api.get('/returns?status=PENDING')
        ]);

        const totalItems = stockRes.data.reduce((sum, item) => sum + item.quantity, 0);
        // For total value, you'd need price * quantity; here we just use count
        setStats([
          { name: 'Total Stock Value', value: `$${totalItems * 10}`, icon: CurrencyDollarIcon }, // placeholder
          { name: 'Total Items', value: totalItems.toString(), icon: CubeIcon },
          { name: 'Expiring Soon', value: expiryRes.data.length.toString(), icon: ClockIcon },
          { name: 'Pending Returns', value: returnsRes.data.length.toString(), icon: ArrowPathIcon },
        ]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      <StatsCards stats={stats} />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpiryAlerts />
        <StockChart />
      </div>
    </div>
  );
}