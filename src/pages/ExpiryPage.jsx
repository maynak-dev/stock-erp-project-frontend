import { useState, useEffect } from 'react';
import api from '../services/api';
import { format } from 'date-fns';
import { S } from '../styles';

const urgency = (daysLeft) => {
  if (daysLeft <= 0)  return { label:'Expired', color:'var(--rose)',        bg:'rgba(255,90,126,.1)',   border:'rgba(255,90,126,.2)'   };
  if (daysLeft <= 3)  return { label:`${daysLeft}d`, color:'var(--rose)',   bg:'rgba(255,90,126,.1)',   border:'rgba(255,90,126,.2)'   };
  if (daysLeft <= 7)  return { label:`${daysLeft}d`, color:'var(--amber)',  bg:'rgba(245,166,35,.1)',   border:'rgba(245,166,35,.2)'   };
  return                     { label:`${daysLeft}d`, color:'var(--teal)',   bg:'rgba(15,207,176,.1)',   border:'rgba(15,207,176,.2)'   };
};

export default function ExpiryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/expiry?days=30').then(r=>{setItems(r.data);setLoading(false);}).catch(console.error);
  }, []);

  if (loading) return <div style={S.stateBox}>Loading expiry data…</div>;

  return (
    <div>
      <div style={S.topBar}>
        <div>
          <h1 style={S.pageTitle}>Expiry Alerts</h1>
          <p style={S.pageSub}>Items expiring within 30 days</p>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          {[['Expired','var(--rose)'],['≤7 days','var(--amber)'],['≤30 days','var(--teal)']].map(([label,color])=>(
            <div key={label} style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'var(--t3)'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:color,boxShadow:`0 0 4px ${color}`}}/>
              {label}
            </div>
          ))}
        </div>
      </div>
      <div style={S.tableCard}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={S.th}>Product</th><th style={S.th}>Batch</th><th style={S.th}>Qty</th>
              <th style={S.th}>Expiry Date</th><th style={S.th}>Days Left</th><th style={S.th}>Location / Shop</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000);
              const u = urgency(daysLeft);
              return (
                <tr key={item.id} style={S.tr}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={S.tdBold}>{item.product.name}</td>
                  <td style={{...S.td,...S.mono}}>{item.batchNumber}</td>
                  <td style={{...S.td,fontWeight:600,color:'var(--teal)'}}>{item.quantity}</td>
                  <td style={{...S.td,...S.mono}}>{format(new Date(item.expiryDate),'dd/MM/yyyy')}</td>
                  <td style={S.td}>
                    <span style={S.badge(u.color,u.bg,u.border)}>{u.label}</span>
                  </td>
                  <td style={S.td}>{item.shop?.name || item.location?.name || item.company?.name || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && <div style={S.stateBox}>No items expiring within 30 days 🎉</div>}
      </div>
    </div>
  );
}
