import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { format, differenceInDays } from 'date-fns';

// ─── Design tokens (inline — no styles.js dependency) ─────────────────────
const T = {
  pageTitle: { fontSize:'20px', fontWeight:700, color:'var(--t1)', letterSpacing:'-.02em', margin:0 },
  pageSub:   { fontSize:'12px', color:'var(--t3)', marginTop:'4px' },
  topBar:    { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' },
  label:     { display:'block', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.06em',
               textTransform:'uppercase', marginBottom:'5px' },
  input:     { width:'100%', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border2)',
               borderRadius:'8px', fontSize:'12px', color:'var(--t1)', fontFamily:'Sora,sans-serif',
               outline:'none', boxSizing:'border-box' },
  select:    { width:'100%', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border2)',
               borderRadius:'8px', fontSize:'12px', color:'var(--t1)', fontFamily:'Sora,sans-serif',
               outline:'none', appearance:'none', boxSizing:'border-box' },
  card:      { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden' },
  th:        { padding:'12px 18px', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.08em',
               textTransform:'uppercase', textAlign:'left', background:'var(--bg-surface)', borderBottom:'1px solid var(--border)' },
  td:        { padding:'13px 18px', fontSize:'13px', color:'var(--t2)', whiteSpace:'nowrap' },
  tdBold:    { padding:'13px 18px', fontSize:'13px', fontWeight:600, color:'var(--t1)', whiteSpace:'nowrap' },
  stateBox:  { padding:'48px', textAlign:'center', fontSize:'13px', color:'var(--t3)' },
  badge: (color, bg, border) => ({
    display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:'20px',
    fontSize:'11px', fontWeight:600, color, background:bg, border:`1px solid ${border}`,
  }),
};

const COLORS = ['#6c63ff', '#0fcfb0', '#f5a623', '#ff5a7e', '#8b83ff'];

const STATUS_BADGE = {
  PENDING:   { color:'var(--amber)',       bg:'rgba(245,166,35,.1)',  border:'rgba(245,166,35,.2)'  },
  APPROVED:  { color:'var(--teal)',        bg:'rgba(15,207,176,.1)',  border:'rgba(15,207,176,.2)'  },
  REJECTED:  { color:'var(--rose)',        bg:'rgba(255,90,126,.1)', border:'rgba(255,90,126,.2)'  },
  COMPLETED: { color:'var(--accent-soft)', bg:'var(--accent-d)',      border:'rgba(108,99,255,.2)'  },
};

// Custom dark tooltip for Recharts
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border2)', borderRadius:'8px',
                  padding:'10px 14px', fontSize:'12px', color:'var(--t1)', boxShadow:'0 8px 24px rgba(0,0,0,.5)' }}>
      {label && <div style={{ color:'var(--t3)', marginBottom:'4px' }}>{label}</div>}
      {payload.map(p => (
        <div key={p.name} style={{ fontWeight:600, color:p.fill || p.color }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

// ── Data transformers ──────────────────────────────────────────────────────

// Stock: [{ productId, status, _sum:{ quantity } }] → [{ name, value }] grouped by status
function transformStock(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.reduce((acc, item) => {
    const name = (item.status || 'UNKNOWN').replace(/_/g, ' ');
    const qty  = item._sum?.quantity ?? 0;
    const existing = acc.find(d => d.name === name);
    if (existing) existing.value += qty;
    else acc.push({ name, value: qty });
    return acc;
  }, []);
}

// Expiry: full stock objects → [{ name, value }] bucketed by days remaining
function transformExpiry(raw) {
  if (!Array.isArray(raw)) return [];
  const buckets = { 'Expired':0, '1–3 days':0, '4–7 days':0, '8–30 days':0 };
  raw.forEach(item => {
    const days = differenceInDays(new Date(item.expiryDate), new Date());
    if      (days <= 0)  buckets['Expired']++;
    else if (days <= 3)  buckets['1–3 days']++;
    else if (days <= 7)  buckets['4–7 days']++;
    else                 buckets['8–30 days']++;
  });
  return Object.entries(buckets)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { user } = useAuth();
  const { fetchStockReport, fetchExpiryReport, fetchReturnReport, fetchSalesReport } = useReports();

  const [stockData,  setStockData]  = useState([]);
  const [expiryData, setExpiryData] = useState([]);
  const [returnData, setReturnData] = useState([]);
  const [salesData,  setSalesData]  = useState([]);
  const [selected,   setSelected]   = useState(0);
  const [filters, setFilters] = useState({
    companyId: user?.companyId || '', locationId:'', shopId:'', startDate:'', endDate:'',
  });

  useEffect(() => {
    const run = async () => {
      try {
        // Stock — transform raw groupBy result into chart-ready { name, value }
        const rawStock = await fetchStockReport(filters);
        setStockData(transformStock(rawStock));

        // Expiry — transform full stock objects into bucketed counts
        const rawExpiry = await fetchExpiryReport(filters);
        setExpiryData(transformExpiry(rawExpiry));

        // Returns — array of return request objects (used in table, no transform needed)
        const rawReturns = await fetchReturnReport(filters);
        setReturnData(Array.isArray(rawReturns) ? rawReturns : []);

        // Sales — backend returns { message } placeholder, guard against non-array
        const rawSales = await fetchSalesReport(filters);
        setSalesData(Array.isArray(rawSales) ? rawSales : []);
      } catch (err) {
        console.error('Reports fetch error:', err);
      }
    };
    run();
  }, [filters]);

  const handleFilter = (e) => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));

  const TABS = ['Stock Report', 'Expiry Report', 'Return Report', 'Sales Report'];

  const tabStyle = (i) => ({
    padding:'8px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:500,
    cursor:'pointer', fontFamily:'Sora,sans-serif', outline:'none', flex:1,
    transition:'all .15s',
    background: selected === i ? 'var(--bg-card)' : 'transparent',
    color:       selected === i ? 'var(--accent-soft)' : 'var(--t3)',
    border:      selected === i ? '1px solid var(--border2)' : '1px solid transparent',
  });

  const chartMargin = { top:4, right:8, left:-10, bottom:0 };
  const axisProps = { tick:{ fill:'var(--t3)', fontSize:11 }, axisLine:false, tickLine:false };

  return (
    <div>
      <div style={T.topBar}>
        <div>
          <h1 style={T.pageTitle}>Reports</h1>
          <p style={T.pageSub}>Analytics &amp; data export</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...T.card, padding:'16px 20px', marginBottom:'20px',
                    display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'12px' }}>
        <div>
          <label style={T.label}>Company</label>
          <select name="companyId" value={filters.companyId} onChange={handleFilter} style={T.select}>
            <option value="">All Companies</option>
          </select>
        </div>
        <div>
          <label style={T.label}>Location</label>
          <select name="locationId" value={filters.locationId} onChange={handleFilter} style={T.select}>
            <option value="">All Locations</option>
          </select>
        </div>
        <div>
          <label style={T.label}>Shop</label>
          <select name="shopId" value={filters.shopId} onChange={handleFilter} style={T.select}>
            <option value="">All Shops</option>
          </select>
        </div>
        <div>
          <label style={T.label}>Start Date</label>
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilter} style={T.input}/>
        </div>
        <div>
          <label style={T.label}>End Date</label>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilter} style={T.input}/>
        </div>
      </div>

      {/* Tab bar */}
      <Tab.Group selectedIndex={selected} onChange={setSelected}>
        <div style={{ display:'flex', gap:'4px', marginBottom:'16px', background:'var(--bg-surface)',
                      border:'1px solid var(--border)', borderRadius:'12px', padding:'5px' }}>
          {TABS.map((t, i) => (
            <Tab key={t} style={tabStyle(i)}>{t}</Tab>
          ))}
        </div>

        <Tab.Panels>

          {/* ── Stock Report ─────────────────────────────────────────── */}
          <Tab.Panel>
            <div style={{ ...T.card, padding:'24px' }}>
              <h2 style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)', marginBottom:'20px' }}>
                Stock Summary by Status
              </h2>
              {stockData.length === 0
                ? <div style={T.stateBox}>No stock data available</div>
                : (
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={stockData} margin={chartMargin}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                      <XAxis dataKey="name" {...axisProps}/>
                      <YAxis {...axisProps}/>
                      <Tooltip content={<DarkTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize:'12px', color:'var(--t2)' }}/>
                      <Bar dataKey="value" name="Quantity" fill="#6c63ff" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </div>
          </Tab.Panel>

          {/* ── Expiry Report ─────────────────────────────────────────── */}
          <Tab.Panel>
            <div style={{ ...T.card, padding:'24px' }}>
              <h2 style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)', marginBottom:'20px' }}>
                Expiring Items by Urgency
              </h2>
              {expiryData.length === 0
                ? <div style={T.stateBox}>No expiring items in selected range</div>
                : (
                  <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                      <Pie data={expiryData} cx="50%" cy="50%"
                        innerRadius={70} outerRadius={130} paddingAngle={3}
                        dataKey="value" labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {expiryData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0}/>
                        ))}
                      </Pie>
                      <Tooltip content={<DarkTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize:'12px', color:'var(--t2)' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                )
              }
            </div>
          </Tab.Panel>

          {/* ── Return Report ─────────────────────────────────────────── */}
          <Tab.Panel>
            <div style={T.card}>
              <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
                <h2 style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)', margin:0 }}>Return Requests</h2>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr>
                    {['Request #','Shop','Date','Status'].map(h => (
                      <th key={h} style={T.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {returnData.map(item => {
                    const st = STATUS_BADGE[item.status] || { color:'var(--t2)', bg:'var(--bg-elevated)', border:'var(--border2)' };
                    return (
                      <tr key={item.id}
                        style={{ borderBottom:'1px solid var(--border)', transition:'background .12s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ ...T.tdBold, fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>{item.requestNumber}</td>
                        <td style={T.td}>{item.shop?.name}</td>
                        <td style={{ ...T.td, fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>
                          {format(new Date(item.createdAt), 'dd/MM/yyyy')}
                        </td>
                        <td style={T.td}><span style={T.badge(st.color, st.bg, st.border)}>{item.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {returnData.length === 0 && <div style={T.stateBox}>No return data</div>}
            </div>
          </Tab.Panel>

          {/* ── Sales Report ──────────────────────────────────────────── */}
          <Tab.Panel>
            <div style={{ ...T.card, padding:'24px' }}>
              <h2 style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)', marginBottom:'20px' }}>
                Sales Overview
              </h2>
              {salesData.length === 0
                ? (
                  <div style={{ ...T.stateBox, display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'var(--accent-d)',
                                  border:'1px solid rgba(108,99,255,.2)', display:'flex', alignItems:'center',
                                  justifyContent:'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-soft)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                    </div>
                    <div style={{ fontWeight:500, color:'var(--t2)' }}>Sales report not yet implemented</div>
                    <div style={{ fontSize:'11px', color:'var(--t3)' }}>Connect a billing module to see data here</div>
                  </div>
                )
                : (
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart data={salesData} margin={chartMargin}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                      <XAxis dataKey="date" {...axisProps}/>
                      <YAxis {...axisProps}/>
                      <Tooltip content={<DarkTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize:'12px', color:'var(--t2)' }}/>
                      <Bar dataKey="sales" name="Sales" fill="#0fcfb0" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                )
              }
            </div>
          </Tab.Panel>

        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}