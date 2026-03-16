import { useState, useEffect } from 'react';
import { CurrencyDollarIcon, CubeIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StatsCards from '../components/Dashboard/StatsCards';
import ExpiryAlerts from '../components/Dashboard/ExpiryAlerts';
import StockChart from '../components/Dashboard/StockChart';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState([
    { name: 'Total Stock Value', value: '$0',  icon: CurrencyDollarIcon },
    { name: 'Total Items',       value: '0',   icon: CubeIcon },
    { name: 'Expiring Soon',     value: '0',   icon: ClockIcon },
    { name: 'Pending Returns',   value: '0',   icon: ArrowPathIcon },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stockRes, expiryRes, returnsRes] = await Promise.all([
          api.get('/stock'),
          api.get('/expiry?days=7'),
          api.get('/returns?status=PENDING'),
        ]);
        const totalItems = stockRes.data.reduce((sum, item) => sum + item.quantity, 0);
        setStats([
          { name: 'Total Stock Value', value: `$${totalItems * 10}`, icon: CurrencyDollarIcon },
          { name: 'Total Items',       value: totalItems.toString(),             icon: CubeIcon },
          { name: 'Expiring Soon',     value: expiryRes.data.length.toString(),  icon: ClockIcon },
          { name: 'Pending Returns',   value: returnsRes.data.length.toString(), icon: ArrowPathIcon },
        ]);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontSize:'22px', fontWeight:700, color:'var(--t1)', letterSpacing:'-.02em', margin:0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize:'13px', color:'var(--t3)', marginTop:'4px' }}>
          Overview of your stock and operations
        </p>
      </div>

      <StatsCards stats={stats}/>

      {/* KEY FIX: alignItems:'start' stops the grid from stretching both cells
          to the tallest one — each card now shrinks to its own content height   */}
      <div style={{
        marginTop:'24px',
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:'20px',
        alignItems:'start',
      }}>
        <ExpiryAlerts/>
        <StockChart/>
      </div>
    </div>
  );
}