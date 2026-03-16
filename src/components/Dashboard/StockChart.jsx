import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import api from '../../services/api';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const COLORS = ['#6c63ff', '#0fcfb0', '#f5a623', '#ff5a7e'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-bright)',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '13px',
        color: 'var(--text-primary)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}>
        <div style={{ fontWeight: 600 }}>{payload[0].name}</div>
        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
          Qty: <span style={{ color: payload[0].fill, fontWeight: 700 }}>{payload[0].value}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function StockChart() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/reports/stock')
      .then(res => {
        const grouped = res.data.reduce((acc, item) => {
          const status = item.status.replace(/_/g, ' ');
          const qty = item._sum?.quantity ?? 0;
          const existing = acc.find(d => d.name === status);
          if (existing) existing.value += qty;
          else acc.push({ name: status, value: qty });
          return acc;
        }, []);
        setData(grouped);
      })
      .catch(err => { console.error(err); setError('Failed to load stock data.'); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '8px',
          background: 'var(--accent-dim)', border: '1px solid rgba(108,99,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChartBarIcon style={{ width: '16px', height: '16px', color: 'var(--accent-soft)' }} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Stock Distribution</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>By status</div>
        </div>
      </div>

      {/* Chart body */}
      <div style={{ padding: '20px' }}>
        {loading && (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            Loading chart…
          </div>
        )}
        {error && (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--rose)', fontSize: '13px' }}>
            {error}
          </div>
        )}
        {!loading && !error && data.length === 0 && (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No stock data available
          </div>
        )}
        {!loading && !error && data.length > 0 && (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'var(--text-muted)', strokeWidth: 1 }}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}