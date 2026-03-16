import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const COLORS = ['#6c63ff', '#0fcfb0', '#f5a623', '#ff5a7e'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border2)',
      borderRadius: '8px', padding: '10px 14px', fontSize: '12px',
      color: 'var(--t1)', boxShadow: '0 8px 24px rgba(0,0,0,.5)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '2px' }}>{payload[0].name}</div>
      <div style={{ color: payload[0].fill, fontWeight: 700 }}>
        {payload[0].value} units
      </div>
    </div>
  );
};

export default function StockChart() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [active,  setActive]  = useState(null);

  useEffect(() => {
    api.get('/reports/stock')
      .then(res => {
        const grouped = res.data.reduce((acc, item) => {
          const status = item.status.replace(/_/g, ' ');
          const qty    = item._sum?.quantity ?? 0;
          const found  = acc.find(d => d.name === status);
          if (found) found.value += qty;
          else acc.push({ name: status, value: qty });
          return acc;
        }, []);
        setData(grouped);
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: '14px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0,
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '8px',
          background: 'var(--accent-d)', border: '1px solid rgba(108,99,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <ChartBarIcon style={{ width: '15px', height: '15px', color: 'var(--accent-soft)' }}/>
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t1)' }}>Stock Distribution</div>
          <div style={{ fontSize: '11px', color: 'var(--t3)' }}>By status</div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px', flex: 1 }}>
        {loading && (
          <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '13px', color: 'var(--t3)' }}>
            Loading…
          </div>
        )}
        {error && (
          <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '13px', color: 'var(--rose)' }}>
            {error}
          </div>
        )}
        {!loading && !error && data.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '13px', color: 'var(--t3)' }}>
            No stock data available
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>

            {/* Donut — no labels, no labelLine — chart fills its space cleanly */}
            <div style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%" cy="50%"
                    innerRadius={52} outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    onMouseEnter={(_, i) => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    stroke="none"
                  >
                    {data.map((_, i) => (
                      <Cell
                        key={i}
                        fill={COLORS[i % COLORS.length]}
                        opacity={active === null || active === i ? 1 : 0.4}
                        style={{ cursor: 'pointer', transition: 'opacity .2s' }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                </PieChart>
              </ResponsiveContainer>

              {/* Centre label — total units */}
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--t1)', lineHeight: 1 }}>
                  {total.toLocaleString()}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--t3)', marginTop: '3px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  units
                </div>
              </div>
            </div>

            {/* Custom legend — sits to the right, no wasted vertical space */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data.map((entry, i) => {
                const pct = total > 0 ? ((entry.value / total) * 100).toFixed(1) : 0;
                const color = COLORS[i % COLORS.length];
                return (
                  <div key={entry.name}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    style={{
                      cursor: 'default',
                      opacity: active === null || active === i ? 1 : 0.45,
                      transition: 'opacity .2s',
                    }}>
                    {/* Label row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 5px ${color}` }}/>
                        <span style={{ fontSize: '12px', color: 'var(--t2)', fontWeight: 500 }}>{entry.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--t3)' }}>{entry.value.toLocaleString()}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color, minWidth: '36px', textAlign: 'right' }}>{pct}%</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: '3px', borderRadius: '2px', background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        width: `${pct}%`, background: color,
                        transition: 'width .4s ease',
                      }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}