import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { format, differenceInDays } from 'date-fns';
import { ClockIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

export default function ExpiryAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get('/expiry?days=7').then(r => setAlerts(r.data)).catch(console.error);
  }, []);

  const getUrgency = (dateStr) => {
    const days = differenceInDays(new Date(dateStr), new Date());
    if (days <= 1) return { label:'Critical', color:'var(--rose)',  bg:'rgba(255,90,126,0.1)',  border:'rgba(255,90,126,0.25)' };
    if (days <= 3) return { label:'Urgent',   color:'var(--amber)', bg:'rgba(245,166,35,0.1)',  border:'rgba(245,166,35,0.25)' };
    return               { label:'Warning',   color:'var(--teal)',  bg:'rgba(15,207,176,0.1)',  border:'rgba(15,207,176,0.25)' };
  };

  return (
    <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden', display:'flex', flexDirection:'column', alignSelf:'start' }}>

      {/* Header */}
      <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'30px', height:'30px', borderRadius:'8px', background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <ClockIcon style={{ width:'15px', height:'15px', color:'var(--amber)' }}/>
          </div>
          <div>
            <div style={{ fontSize:'13px', fontWeight:600, color:'var(--t1)' }}>Expiry Alerts</div>
            <div style={{ fontSize:'11px', color:'var(--t3)' }}>Next 7 days</div>
          </div>
        </div>
        {alerts.length > 0 && (
          <div style={{ padding:'3px 10px', borderRadius:'20px', background:'rgba(245,166,35,0.1)', border:'1px solid rgba(245,166,35,0.25)', fontSize:'12px', fontWeight:700, color:'var(--amber)' }}>
            {alerts.length}
          </div>
        )}
      </div>

      {/* Scrollable list — invisible scrollbar */}
      <div className="hide-scrollbar" style={{ overflowY:'auto', maxHeight:'270px', padding:'6px 10px', scrollbarWidth:'none', msOverflowStyle:'none' }}>
        {alerts.length === 0 ? (
          <div style={{ padding:'40px 0', textAlign:'center' }}>
            <div style={{ width:'36px', height:'36px', borderRadius:'10px', margin:'0 auto 10px', background:'rgba(15,207,176,0.1)', border:'1px solid rgba(15,207,176,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:'16px', color:'var(--teal)' }}>✓</span>
            </div>
            <div style={{ fontSize:'13px', color:'var(--t3)' }}>No items expiring soon</div>
          </div>
        ) : (
          alerts.map(item => {
            const u = getUrgency(item.expiryDate);
            return (
              <div key={item.id}
                style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 8px', borderRadius:'8px', marginBottom:'1px', transition:'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', minWidth:0 }}>
                  <div style={{ width:'7px', height:'7px', borderRadius:'50%', flexShrink:0, background:u.color, boxShadow:`0 0 6px ${u.color}` }}/>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:'13px', fontWeight:500, color:'var(--t1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'180px' }}>
                      {item.product?.name}
                    </div>
                    <div style={{ fontSize:'10px', color:'var(--t3)', fontFamily:'JetBrains Mono,monospace' }}>
                      {item.batchNumber}
                    </div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'7px', flexShrink:0 }}>
                  <div style={{ padding:'2px 7px', borderRadius:'5px', background:u.bg, border:`1px solid ${u.border}`, fontSize:'10px', fontWeight:600, color:u.color }}>
                    {u.label}
                  </div>
                  <div style={{ fontSize:'11px', color:'var(--t3)', fontFamily:'JetBrains Mono,monospace' }}>
                    {format(new Date(item.expiryDate), 'dd/MM/yy')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding:'11px 18px', borderTop:'1px solid var(--border)', flexShrink:0 }}>
        <Link to="/expiry" style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'12px', fontWeight:600, color:'var(--accent-soft)', textDecoration:'none' }}>
          View all expiry alerts
          <ArrowRightIcon style={{ width:'12px', height:'12px' }}/>
        </Link>
      </div>
    </div>
  );
}
