import { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';

const T = {
  pageTitle: { fontSize:'20px', fontWeight:700, color:'var(--t1)', letterSpacing:'-.02em', margin:0 },
  pageSub:   { fontSize:'12px', color:'var(--t3)', marginTop:'4px' },
  tableCard: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden' },
  th:        { padding:'12px 18px', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.08em', textTransform:'uppercase', textAlign:'left', background:'var(--bg-surface)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' },
  tr:        { borderBottom:'1px solid var(--border)', transition:'background .12s' },
  td:        { padding:'12px 18px', fontSize:'13px', color:'var(--t2)', whiteSpace:'nowrap' },
  tdBold:    { padding:'12px 18px', fontSize:'13px', fontWeight:600, color:'var(--t1)', whiteSpace:'nowrap' },
  stateBox:  { padding:'48px', textAlign:'center', fontSize:'13px', color:'var(--t3)' },
  badge:     (color,bg,border) => ({ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:600, color, background:bg, border:`1px solid ${border}` }),
};

const urgency = (d) => {
  if (d <= 0) return { label:'Expired', color:'var(--rose)',  bg:'rgba(255,90,126,.1)', border:'rgba(255,90,126,.2)' };
  if (d <= 3) return { label:`${d}d`,   color:'var(--rose)',  bg:'rgba(255,90,126,.1)', border:'rgba(255,90,126,.2)' };
  if (d <= 7) return { label:`${d}d`,   color:'var(--amber)', bg:'rgba(245,166,35,.1)', border:'rgba(245,166,35,.2)' };
  return             { label:`${d}d`,   color:'var(--teal)',  bg:'rgba(15,207,176,.1)', border:'rgba(15,207,176,.2)' };
};

export default function ExpiryPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/expiry?days=30')
      .then(r => { setItems(r.data); setLoading(false); })
      .catch(console.error);
  }, []);

  if (loading) return <div style={T.stateBox}>Loading expiry data…</div>;

  return (
    <div>
      <div className="page-top-bar" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={T.pageTitle}>Expiry Alerts</h1>
          <p style={T.pageSub}>Items expiring within 30 days</p>
        </div>
        {/* Legend */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
          {[['Expired','var(--rose)'],['≤7 days','var(--amber)'],['≤30 days','var(--teal)']].map(([label, color]) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'var(--t3)' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:color, boxShadow:`0 0 4px ${color}` }}/>
              {label}
            </div>
          ))}
        </div>
      </div>

      <div style={T.tableCard}>
        <div className="table-scroll">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              <th style={T.th}>Product</th>
              <th style={T.th}>Batch</th>
              <th style={T.th}>Qty</th>
              <th style={T.th}>Expiry Date</th>
              <th style={T.th}>Days Left</th>
              <th style={T.th}>Location / Shop</th>
            </tr></thead>
            <tbody>
              {items.map(item => {
                const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000);
                const u = urgency(daysLeft);
                return (
                  <tr key={item.id} style={T.tr}
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={T.tdBold}>{item.product.name}</td>
                    <td style={{ ...T.td, fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>{item.batchNumber}</td>
                    <td style={{ ...T.td, fontWeight:600, color:'var(--teal)' }}>{item.quantity}</td>
                    <td style={{ ...T.td, fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>{format(new Date(item.expiryDate), 'dd/MM/yyyy')}</td>
                    <td style={T.td}><span style={T.badge(u.color, u.bg, u.border)}>{u.label}</span></td>
                    <td style={T.td}>{item.shop?.name || item.location?.name || item.company?.name || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <div style={T.stateBox}>No items expiring within 30 days 🎉</div>}
      </div>
    </div>
  );
}
