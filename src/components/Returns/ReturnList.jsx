import { useState } from 'react';
import { CheckIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import ReturnModal from './ReturnModal';
import { useReturns } from '../../hooks/useReturns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const T = {
  pageTitle: { fontSize:'20px', fontWeight:700, color:'var(--t1)', letterSpacing:'-.02em', margin:0 },
  pageSub:   { fontSize:'12px', color:'var(--t3)', marginTop:'4px' },
  tableCard: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden' },
  th:        { padding:'12px 18px', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.08em', textTransform:'uppercase', textAlign:'left', background:'var(--bg-surface)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' },
  thRight:   { padding:'12px 18px', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.08em', textTransform:'uppercase', textAlign:'right', background:'var(--bg-surface)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' },
  tr:        { borderBottom:'1px solid var(--border)', transition:'background .12s' },
  td:        { padding:'12px 18px', fontSize:'13px', color:'var(--t2)', whiteSpace:'nowrap' },
  tdBold:    { padding:'12px 18px', fontSize:'13px', fontWeight:600, color:'var(--t1)', whiteSpace:'nowrap' },
  tdRight:   { padding:'12px 18px', fontSize:'13px', textAlign:'right', whiteSpace:'nowrap' },
  stateBox:  { padding:'48px', textAlign:'center', fontSize:'13px', color:'var(--t3)' },
  btnPrimary:{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'linear-gradient(135deg,var(--accent),#8b83ff)', border:'none', borderRadius:'9px', fontSize:'13px', fontWeight:600, color:'#fff', cursor:'pointer', fontFamily:'Sora,sans-serif', boxShadow:'0 4px 16px var(--accent-g)', transition:'opacity .15s', whiteSpace:'nowrap' },
  iconBtn:   (c) => ({ width:'30px', height:'30px', borderRadius:'7px', border:`1px solid ${c}22`, background:`${c}10`, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .15s', color:c }),
  badge:     (color,bg,border) => ({ display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:600, color, background:bg, border:`1px solid ${border}` }),
};

const STATUS = {
  PENDING:   { color:'var(--amber)',       bg:'rgba(245,166,35,.1)',  border:'rgba(245,166,35,.2)'  },
  APPROVED:  { color:'var(--teal)',        bg:'rgba(15,207,176,.1)', border:'rgba(15,207,176,.2)'  },
  REJECTED:  { color:'var(--rose)',        bg:'rgba(255,90,126,.1)', border:'rgba(255,90,126,.2)'  },
  COMPLETED: { color:'var(--accent-soft)', bg:'var(--accent-d)',     border:'rgba(108,99,255,.2)'  },
};

export default function ReturnList() {
  const { returns, loading, error, approveReturn, rejectReturn, refetch } = useReturns();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canCreate  = ['SHOP_OWNER','SHOP_EMPLOYEE'].includes(user?.role);
  const canApprove = ['COMPANY_ADMIN','SUPER_ADMIN'].includes(user?.role);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this return?')) return;
    try { await approveReturn(id); toast.success('Return approved'); refetch(); }
    catch { toast.error('Failed to approve'); }
  };
  const handleReject = async (id) => {
    if (!window.confirm('Reject this return?')) return;
    try { await rejectReturn(id); toast.success('Return rejected'); refetch(); }
    catch { toast.error('Failed to reject'); }
  };

  if (loading) return <div style={T.stateBox}>Loading…</div>;
  if (error)   return <div style={{ ...T.stateBox, color:'var(--rose)' }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-top-bar" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div><h1 style={T.pageTitle}>Return Requests</h1><p style={T.pageSub}>{returns.length} requests</p></div>
        {canCreate && (
          <button style={T.btnPrimary} onClick={() => setIsModalOpen(true)}
            onMouseEnter={e => e.currentTarget.style.opacity='.88'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            <PlusIcon style={{ width:14, height:14 }}/> New Return
          </button>
        )}
      </div>

      <div style={T.tableCard}>
        <div className="table-scroll">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              <th style={T.th}>Request #</th>
              <th style={T.th}>Shop</th>
              <th style={T.th}>Date</th>
              <th style={T.th}>Status</th>
              <th style={T.th}>Items</th>
              {canApprove && <th style={T.thRight}>Actions</th>}
            </tr></thead>
            <tbody>
              {returns.map(ret => {
                const st = STATUS[ret.status] || { color:'var(--t2)', bg:'var(--bg-elevated)', border:'var(--border2)' };
                return (
                  <tr key={ret.id} style={T.tr}
                    onMouseEnter={e => e.currentTarget.style.background='var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ ...T.tdBold, fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>{ret.requestNumber}</td>
                    <td style={T.td}>{ret.shop?.name}</td>
                    <td style={{ ...T.td, fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>{format(new Date(ret.createdAt), 'dd/MM/yyyy')}</td>
                    <td style={T.td}><span style={T.badge(st.color, st.bg, st.border)}>{ret.status}</span></td>
                    <td style={{ ...T.td, color:'var(--t3)' }}>{ret.items?.length} item(s)</td>
                    {canApprove && (
                      <td style={T.tdRight}>
                        {ret.status === 'PENDING' && (
                          <div style={{ display:'flex', justifyContent:'flex-end', gap:'6px' }}>
                            <button style={T.iconBtn('var(--teal)')} onClick={() => handleApprove(ret.id)} title="Approve"
                              onMouseEnter={e => e.currentTarget.style.background='rgba(15,207,176,.2)'}
                              onMouseLeave={e => e.currentTarget.style.background='rgba(15,207,176,.1)'}>
                              <CheckIcon style={{ width:13, height:13 }}/>
                            </button>
                            <button style={T.iconBtn('var(--rose)')} onClick={() => handleReject(ret.id)} title="Reject"
                              onMouseEnter={e => e.currentTarget.style.background='rgba(255,90,126,.2)'}
                              onMouseLeave={e => e.currentTarget.style.background='rgba(255,90,126,.1)'}>
                              <XMarkIcon style={{ width:13, height:13 }}/>
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {returns.length === 0 && <div style={T.stateBox}>No return requests</div>}
      </div>

      <ReturnModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { refetch(); setIsModalOpen(false); }}/>
    </div>
  );
}
