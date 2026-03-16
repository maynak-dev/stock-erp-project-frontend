import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../contexts/AuthContext';
import { differenceInDays } from 'date-fns';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#6c63ff','#0fcfb0','#f5a623','#ff5a7e','#8b83ff'];

const inp = { width:'100%', padding:'8px 12px', background:'var(--bg-elevated)', border:'1px solid var(--border2)', borderRadius:'8px', fontSize:'12px', color:'var(--t1)', fontFamily:'Sora,sans-serif', outline:'none', appearance:'none', boxSizing:'border-box' };
const lbl = { display:'block', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:'5px' };

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border2)', borderRadius:'8px', padding:'10px 14px', fontSize:'12px', color:'var(--t1)', boxShadow:'0 8px 24px rgba(0,0,0,.5)' }}>
      {label && <div style={{ color:'var(--t3)', marginBottom:'4px' }}>{label}</div>}
      {payload.map(p => <div key={p.name} style={{ fontWeight:600, color:p.fill||p.color }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

function transformStock(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.reduce((acc, item) => {
    const name = (item.status || 'UNKNOWN').replace(/_/g, ' ');
    const qty  = item._sum?.quantity ?? 0;
    const ex   = acc.find(d => d.name === name);
    if (ex) ex.value += qty; else acc.push({ name, value: qty });
    return acc;
  }, []);
}

function transformExpiry(raw) {
  if (!Array.isArray(raw)) return [];
  const b = { 'Expired':0, '1–3 days':0, '4–7 days':0, '8–30 days':0 };
  raw.forEach(item => {
    const d = differenceInDays(new Date(item.expiryDate), new Date());
    if (d <= 0) b['Expired']++; else if (d <= 3) b['1–3 days']++; else if (d <= 7) b['4–7 days']++; else b['8–30 days']++;
  });
  return Object.entries(b).filter(([,v]) => v > 0).map(([name, value]) => ({ name, value }));
}

const STATUS_BADGE = {
  PENDING:   { color:'var(--amber)',       bg:'rgba(245,166,35,.1)',  border:'rgba(245,166,35,.2)'  },
  APPROVED:  { color:'var(--teal)',        bg:'rgba(15,207,176,.1)', border:'rgba(15,207,176,.2)'  },
  REJECTED:  { color:'var(--rose)',        bg:'rgba(255,90,126,.1)', border:'rgba(255,90,126,.2)'  },
  COMPLETED: { color:'var(--accent-soft)', bg:'var(--accent-d)',     border:'rgba(108,99,255,.2)'  },
};

const th = { padding:'12px 18px', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.08em', textTransform:'uppercase', textAlign:'left', background:'var(--bg-surface)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' };
const td = { padding:'12px 18px', fontSize:'13px', color:'var(--t2)', whiteSpace:'nowrap' };

export default function ReportsPage() {
  const { user } = useAuth();
  const { fetchStockReport, fetchExpiryReport, fetchReturnReport, fetchSalesReport } = useReports();
  const [stockData,  setStockData]  = useState([]);
  const [expiryData, setExpiryData] = useState([]);
  const [returnData, setReturnData] = useState([]);
  const [salesData,  setSalesData]  = useState([]);
  const [selected,   setSelected]   = useState(0);
  const [filters,    setFilters]    = useState({ companyId: user?.companyId || '', locationId:'', shopId:'', startDate:'', endDate:'' });

  useEffect(() => {
    const run = async () => {
      try {
        const [s,e,r,sl] = await Promise.all([fetchStockReport(filters), fetchExpiryReport(filters), fetchReturnReport(filters), fetchSalesReport(filters)]);
        setStockData(transformStock(s));
        setExpiryData(transformExpiry(e));
        setReturnData(Array.isArray(r) ? r : []);
        setSalesData(Array.isArray(sl) ? sl : []);
      } catch(err) { console.error(err); }
    };
    run();
  }, [filters]);

  const handleFilter = e => setFilters(f => ({ ...f, [e.target.name]: e.target.value }));
  const TABS = ['Stock','Expiry','Returns','Sales'];
  const axisProps = { tick:{ fill:'var(--t3)', fontSize:11 }, axisLine:false, tickLine:false };

  return (
    <div>
      <div style={{ marginBottom:'20px' }}>
        <h1 style={{ fontSize:'20px', fontWeight:700, color:'var(--t1)', letterSpacing:'-.02em', margin:0 }}>Reports</h1>
        <p style={{ fontSize:'12px', color:'var(--t3)', marginTop:'4px' }}>Analytics &amp; data export</p>
      </div>

      {/* Filters — responsive grid via CSS class */}
      <div className="reports-filter-grid" style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'16px 20px', marginBottom:'20px' }}>
        <div><label style={lbl}>Company</label><select name="companyId" value={filters.companyId} onChange={handleFilter} style={inp}><option value="">All Companies</option></select></div>
        <div><label style={lbl}>Location</label><select name="locationId" value={filters.locationId} onChange={handleFilter} style={inp}><option value="">All Locations</option></select></div>
        <div><label style={lbl}>Shop</label><select name="shopId" value={filters.shopId} onChange={handleFilter} style={inp}><option value="">All Shops</option></select></div>
        <div><label style={lbl}>Start Date</label><input type="date" name="startDate" value={filters.startDate} onChange={handleFilter} style={inp}/></div>
        <div><label style={lbl}>End Date</label><input type="date" name="endDate" value={filters.endDate} onChange={handleFilter} style={inp}/></div>
      </div>

      {/* Tabs — scrollable on mobile via CSS class */}
      <Tab.Group selectedIndex={selected} onChange={setSelected}>
        <div className="reports-tab-bar">
          {TABS.map((t, i) => (
            <Tab key={t} style={{
              padding:'8px 16px', borderRadius:'8px', fontSize:'13px', fontWeight:500,
              cursor:'pointer', fontFamily:'Sora,sans-serif', outline:'none',
              transition:'all .15s', whiteSpace:'nowrap', flex:1,
              background: selected===i ? 'var(--bg-card)' : 'transparent',
              color:       selected===i ? 'var(--accent-soft)' : 'var(--t3)',
              border:      selected===i ? '1px solid var(--border2)' : '1px solid transparent',
            }}>
              {t} Report
            </Tab>
          ))}
        </div>

        <Tab.Panels>
          {/* Stock */}
          <Tab.Panel>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px' }}>
              <h2 style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)', marginBottom:'16px' }}>Stock Summary by Status</h2>
              {stockData.length === 0
                ? <div style={{ padding:'40px 0', textAlign:'center', fontSize:'13px', color:'var(--t3)' }}>No stock data</div>
                : <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stockData} margin={{ top:0, right:0, left:-10, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                      <XAxis dataKey="name" {...axisProps}/>
                      <YAxis {...axisProps}/>
                      <Tooltip content={<DarkTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize:'12px', color:'var(--t2)' }}/>
                      <Bar dataKey="value" name="Quantity" fill="#6c63ff" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>
          </Tab.Panel>

          {/* Expiry */}
          <Tab.Panel>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px' }}>
              <h2 style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)', marginBottom:'16px' }}>Expiring Items by Urgency</h2>
              {expiryData.length === 0
                ? <div style={{ padding:'40px 0', textAlign:'center', fontSize:'13px', color:'var(--t3)' }}>No expiring items in selected range</div>
                : <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={expiryData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value" labelLine={false} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                        {expiryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0}/>)}
                      </Pie>
                      <Tooltip content={<DarkTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize:'12px', color:'var(--t2)' }}/>
                    </PieChart>
                  </ResponsiveContainer>
              }
            </div>
          </Tab.Panel>

          {/* Returns */}
          <Tab.Panel>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}>
                <h2 style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)', margin:0 }}>Return Requests</h2>
              </div>
              <div className="table-scroll">
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr>
                    {['Request #','Shop','Date','Status'].map(h => <th key={h} style={th}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {returnData.map(item => {
                      const st = STATUS_BADGE[item.status] || { color:'var(--t2)', bg:'var(--bg-elevated)', border:'var(--border2)' };
                      return (
                        <tr key={item.id}
                          style={{ borderBottom:'1px solid var(--border)', transition:'background .12s' }}
                          onMouseEnter={e => e.currentTarget.style.background='var(--bg-elevated)'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <td style={{ ...td, fontFamily:'JetBrains Mono,monospace', fontSize:'12px', fontWeight:600, color:'var(--t1)' }}>{item.requestNumber}</td>
                          <td style={td}>{item.shop?.name}</td>
                          <td style={{ ...td, fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>{format(new Date(item.createdAt), 'dd/MM/yyyy')}</td>
                          <td style={td}><span style={{ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:600, color:st.color, background:st.bg, border:`1px solid ${st.border}` }}>{item.status}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {returnData.length === 0 && <div style={{ padding:'48px', textAlign:'center', fontSize:'13px', color:'var(--t3)' }}>No return data</div>}
            </div>
          </Tab.Panel>

          {/* Sales */}
          <Tab.Panel>
            <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', padding:'20px' }}>
              <h2 style={{ fontSize:'14px', fontWeight:600, color:'var(--t1)', marginBottom:'16px' }}>Sales Overview</h2>
              {salesData.length === 0
                ? (
                  <div style={{ padding:'40px 0', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'var(--accent-d)', border:'1px solid rgba(108,99,255,.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-soft)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                    </div>
                    <div style={{ fontWeight:500, color:'var(--t2)' }}>Sales report not yet implemented</div>
                    <div style={{ fontSize:'11px', color:'var(--t3)' }}>Connect a billing module to see data here</div>
                  </div>
                )
                : <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={salesData} margin={{ top:0, right:0, left:-10, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                      <XAxis dataKey="date" {...axisProps}/>
                      <YAxis {...axisProps}/>
                      <Tooltip content={<DarkTooltip/>}/>
                      <Legend wrapperStyle={{ fontSize:'12px', color:'var(--t2)' }}/>
                      <Bar dataKey="sales" name="Sales" fill="#0fcfb0" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
              }
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
