import { useState } from 'react';
import { CheckIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import ReturnModal from './ReturnModal';
import { useReturns } from '../../hooks/useReturns';
import { useAuth } from '../../contexts/AuthContext';
import { S } from '../../styles';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS = {
  PENDING:   { color:'var(--amber)',       bg:'rgba(245,166,35,.1)',   border:'rgba(245,166,35,.2)'   },
  APPROVED:  { color:'var(--teal)',        bg:'rgba(15,207,176,.1)',   border:'rgba(15,207,176,.2)'   },
  REJECTED:  { color:'var(--rose)',        bg:'rgba(255,90,126,.1)',   border:'rgba(255,90,126,.2)'   },
  COMPLETED: { color:'var(--accent-soft)', bg:'var(--accent-d)',       border:'rgba(108,99,255,.2)'   },
};

export default function ReturnList() {
  const { returns, loading, error, approveReturn, rejectReturn, refetch } = useReturns();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canCreate = ['SHOP_OWNER','SHOP_EMPLOYEE'].includes(user?.role);
  const canApprove = ['COMPANY_ADMIN','SUPER_ADMIN'].includes(user?.role);

  const handleApprove = async (id) => {
    if (window.confirm('Approve this return?')) {
      try { await approveReturn(id); toast.success('Return approved'); }
      catch { toast.error('Failed to approve'); }
    }
  };
  const handleReject = async (id) => {
    if (window.confirm('Reject this return?')) {
      try { await rejectReturn(id); toast.success('Return rejected'); }
      catch { toast.error('Failed to reject'); }
    }
  };

  if (loading) return <div style={S.stateBox}>Loading returns…</div>;
  if (error) return <div style={{...S.stateBox,color:'var(--rose)'}}>Error: {error}</div>;

  return (
    <div>
      <div style={S.topBar}>
        <div><h1 style={S.pageTitle}>Return Requests</h1><p style={S.pageSub}>{returns.length} requests</p></div>
        {canCreate && (
          <button style={S.btnPrimary} onClick={()=>setIsModalOpen(true)}
            onMouseEnter={e=>e.currentTarget.style.opacity='.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <PlusIcon style={{width:14,height:14}}/> New Return Request
          </button>
        )}
      </div>
      <div style={S.tableCard}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={S.th}>Request #</th><th style={S.th}>Shop</th><th style={S.th}>Date</th>
              <th style={S.th}>Status</th><th style={S.th}>Items</th>
              {canApprove && <th style={S.thRight}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {returns.map(ret => {
              const st = STATUS[ret.status] || {color:'var(--t2)',bg:'var(--bg-elevated)',border:'var(--border2)'};
              return (
                <tr key={ret.id} style={S.tr}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{...S.tdBold,...S.mono}}>{ret.requestNumber}</td>
                  <td style={S.td}>{ret.shop?.name}</td>
                  <td style={{...S.td,...S.mono}}>{format(new Date(ret.createdAt),'dd/MM/yyyy')}</td>
                  <td style={S.td}><span style={S.badge(st.color,st.bg,st.border)}>{ret.status}</span></td>
                  <td style={S.td}><span style={{color:'var(--t3)'}}>{ret.items?.length} item(s)</span></td>
                  {canApprove && (
                    <td style={S.tdRight}>
                      {ret.status === 'PENDING' && (
                        <div style={{display:'flex',justifyContent:'flex-end',gap:'6px'}}>
                          <button style={S.iconBtn('var(--teal)')} onClick={()=>handleApprove(ret.id)} title="Approve"
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(15,207,176,.2)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(15,207,176,.1)'}>
                            <CheckIcon style={{width:13,height:13}}/>
                          </button>
                          <button style={S.iconBtn('var(--rose)')} onClick={()=>handleReject(ret.id)} title="Reject"
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,90,126,.2)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,90,126,.1)'}>
                            <XMarkIcon style={{width:13,height:13}}/>
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
        {returns.length === 0 && <div style={S.stateBox}>No return requests</div>}
      </div>
      <ReturnModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSuccess={()=>{refetch();setIsModalOpen(false);}}/>
    </div>
  );
}
