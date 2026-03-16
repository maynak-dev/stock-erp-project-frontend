import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { useReports } from '../hooks/useReports';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { S } from '../styles';
import { modalStyles as M, onFocus, onBlur } from '../styles';

const COLORS = ['#6c63ff','#0fcfb0','#f5a623','#ff5a7e','#8b83ff'];

const tabBase = {
  padding:'8px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:500,
  cursor:'pointer', border:'none', fontFamily:'Sora,sans-serif',
  transition:'all .15s', outline:'none',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'var(--bg-elevated)',border:'1px solid var(--border2)',borderRadius:'8px',padding:'10px 14px',fontSize:'12px',color:'var(--t1)',boxShadow:'0 8px 24px rgba(0,0,0,.4)'}}>
      <div style={{color:'var(--t3)',marginBottom:'4px'}}>{label}</div>
      {payload.map(p=><div key={p.name} style={{fontWeight:600,color:p.fill}}>{p.name}: {p.value}</div>)}
    </div>
  );
};

export default function ReportsPage() {
  const { user } = useAuth();
  const { fetchStockReport, fetchExpiryReport, fetchReturnReport, fetchSalesReport } = useReports();
  const [stockData,  setStockData]  = useState([]);
  const [expiryData, setExpiryData] = useState([]);
  const [returnData, setReturnData] = useState([]);
  const [salesData,  setSalesData]  = useState([]);
  const [filters, setFilters] = useState({ companyId: user?.companyId||'', locationId:'', shopId:'', startDate:'', endDate:'' });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    const run = async () => {
      try {
        const [s,e,r,sl] = await Promise.all([
          fetchStockReport(filters), fetchExpiryReport(filters),
          fetchReturnReport(filters), fetchSalesReport(filters),
        ]);
        setStockData(s); setExpiryData(e); setReturnData(r); setSalesData(sl);
      } catch(err) { console.error(err); }
    };
    run();
  }, [filters]);

  const handleFilter = (e) => setFilters(f=>({...f,[e.target.name]:e.target.value}));

  const TABS = ['Stock Report','Expiry Report','Return Report','Sales Report'];

  const STATUS = {
    PENDING:   { color:'var(--amber)',       bg:'rgba(245,166,35,.1)',   border:'rgba(245,166,35,.2)'   },
    APPROVED:  { color:'var(--teal)',        bg:'rgba(15,207,176,.1)',   border:'rgba(15,207,176,.2)'   },
    REJECTED:  { color:'var(--rose)',        bg:'rgba(255,90,126,.1)',   border:'rgba(255,90,126,.2)'   },
    COMPLETED: { color:'var(--accent-soft)', bg:'var(--accent-d)',       border:'rgba(108,99,255,.2)'   },
  };

  return (
    <div>
      <div style={S.topBar}>
        <div><h1 style={S.pageTitle}>Reports</h1><p style={S.pageSub}>Analytics & data export</p></div>
      </div>

      {/* Filters */}
      <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'16px 20px',marginBottom:'20px',display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'12px'}}>
        {[
          ['companyId','Company'],['locationId','Location'],['shopId','Shop'],
          ['startDate','Start Date','date'],['endDate','End Date','date'],
        ].map(([name,label,type='text'])=>(
          <div key={name}>
            <label style={{...M.label,display:'block',marginBottom:'5px'}}>{label}</label>
            {type==='date'
              ? <input type="date" name={name} value={filters[name]} onChange={handleFilter} style={{...M.input,padding:'8px 12px',fontSize:'12px'}} onFocus={onFocus} onBlur={onBlur}/>
              : <select name={name} value={filters[name]} onChange={handleFilter} style={{...M.select,padding:'8px 12px',fontSize:'12px'}} onFocus={onFocus} onBlur={onBlur}>
                  <option value="">All {label}s</option>
                </select>
            }
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <Tab.Group selectedIndex={selected} onChange={setSelected}>
        <div style={{display:'flex',gap:'4px',marginBottom:'16px',background:'var(--bg-surface)',border:'1px solid var(--border)',borderRadius:'12px',padding:'5px'}}>
          {TABS.map((t,i)=>(
            <Tab key={t} style={{...tabBase,background:selected===i?'var(--bg-card)':'transparent',color:selected===i?'var(--accent-soft)':'var(--t3)',borderColor:selected===i?'var(--border2)':'transparent',flex:1,border:selected===i?'1px solid var(--border2)':'1px solid transparent'}}>
              {t}
            </Tab>
          ))}
        </div>

        <Tab.Panels>
          {/* Stock Report */}
          <Tab.Panel>
            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'24px'}}>
              <h2 style={{fontSize:'14px',fontWeight:600,color:'var(--t1)',marginBottom:'20px'}}>Stock Summary by Status</h2>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={stockData} margin={{top:0,right:0,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="name" tick={{fill:'var(--t3)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'var(--t3)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{fontSize:'12px',color:'var(--t2)'}}/>
                  <Bar dataKey="value" fill="#6c63ff" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Tab.Panel>

          {/* Expiry Report */}
          <Tab.Panel>
            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'24px'}}>
              <h2 style={{fontSize:'14px',fontWeight:600,color:'var(--t1)',marginBottom:'20px'}}>Expiring Items Distribution</h2>
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie data={expiryData} cx="50%" cy="50%" innerRadius={70} outerRadius={130}
                    paddingAngle={3} dataKey="value" labelLine={false}
                    label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                    {expiryData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} strokeWidth={0}/>)}
                  </Pie>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{fontSize:'12px',color:'var(--t2)'}}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Tab.Panel>

          {/* Return Report */}
          <Tab.Panel>
            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',overflow:'hidden'}}>
              <div style={{padding:'18px 20px',borderBottom:'1px solid var(--border)'}}>
                <h2 style={{fontSize:'14px',fontWeight:600,color:'var(--t1)'}}>Return Requests</h2>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr>
                    {['Request #','Shop','Date','Status'].map(h=>(
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {returnData.map(item=>{
                    const st = STATUS[item.status]||{color:'var(--t2)',bg:'var(--bg-elevated)',border:'var(--border2)'};
                    return (
                      <tr key={item.id} style={S.tr}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{...S.td,...S.mono}}>{item.requestNumber}</td>
                        <td style={S.td}>{item.shop?.name}</td>
                        <td style={{...S.td,...S.mono}}>{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td style={S.td}><span style={S.badge(st.color,st.bg,st.border)}>{item.status}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {returnData.length === 0 && <div style={S.stateBox}>No return data</div>}
            </div>
          </Tab.Panel>

          {/* Sales Report */}
          <Tab.Panel>
            <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',padding:'24px'}}>
              <h2 style={{fontSize:'14px',fontWeight:600,color:'var(--t1)',marginBottom:'20px'}}>Sales Overview</h2>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={salesData} margin={{top:0,right:0,left:-10,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
                  <XAxis dataKey="date" tick={{fill:'var(--t3)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fill:'var(--t3)',fontSize:11}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Legend wrapperStyle={{fontSize:'12px',color:'var(--t2)'}}/>
                  <Bar dataKey="sales" fill="#0fcfb0" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
              {salesData.length === 0 && (
                <div style={{textAlign:'center',marginTop:'20px',fontSize:'13px',color:'var(--t3)'}}>
                  Sales report not yet implemented
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
