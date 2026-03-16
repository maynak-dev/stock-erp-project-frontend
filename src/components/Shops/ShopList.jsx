import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import AddShopModal from './AddShopModal';
import EditShopModal from './EditShopModal';
import { useShops } from '../../hooks/useShops';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const T = {
  pageTitle:{ fontSize:'20px',fontWeight:700,color:'var(--t1)',letterSpacing:'-.02em',margin:0 },
  pageSub:  { fontSize:'12px',color:'var(--t3)',marginTop:'4px' },
  topBar:   { display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'20px' },
  tableCard:{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'14px',overflow:'hidden' },
  th:       { padding:'12px 18px',fontSize:'10px',fontWeight:600,color:'var(--t3)',letterSpacing:'.08em',textTransform:'uppercase',textAlign:'left',background:'var(--bg-surface)',borderBottom:'1px solid var(--border)' },
  thRight:  { padding:'12px 18px',fontSize:'10px',fontWeight:600,color:'var(--t3)',letterSpacing:'.08em',textTransform:'uppercase',textAlign:'right',background:'var(--bg-surface)',borderBottom:'1px solid var(--border)' },
  tr:       { borderBottom:'1px solid var(--border)',transition:'background .12s' },
  td:       { padding:'13px 18px',fontSize:'13px',color:'var(--t2)',whiteSpace:'nowrap' },
  tdBold:   { padding:'13px 18px',fontSize:'13px',fontWeight:600,color:'var(--t1)',whiteSpace:'nowrap' },
  tdRight:  { padding:'13px 18px',fontSize:'13px',textAlign:'right',whiteSpace:'nowrap' },
  stateBox: { padding:'48px',textAlign:'center',fontSize:'13px',color:'var(--t3)' },
  btnPrimary:{ display:'inline-flex',alignItems:'center',gap:'6px',padding:'9px 16px',background:'linear-gradient(135deg,var(--accent),#8b83ff)',border:'none',borderRadius:'9px',fontSize:'13px',fontWeight:600,color:'#fff',cursor:'pointer',fontFamily:'Sora,sans-serif',boxShadow:'0 4px 16px var(--accent-g)',transition:'opacity .15s' },
  iconBtn:(c)=>({ width:'30px',height:'30px',borderRadius:'7px',border:`1px solid ${c}22`,background:`${c}10`,display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .15s',color:c }),
};

export default function ShopList() {
  const { shops, loading, error, deleteShop, refetch } = useShops();
  const { user } = useAuth();
  const canEdit = ['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER'].includes(user?.role);
  const [showAdd,  setShowAdd]  = useState(false);
  const [editItem, setEditItem] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shop?')) return;
    try { await deleteShop(id); toast.success('Shop deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div style={T.stateBox}>Loading…</div>;
  if (error)   return <div style={{ ...T.stateBox, color:'var(--rose)' }}>Error: {error}</div>;

  return (
    <div>
      <div style={T.topBar}>
        <div><h1 style={T.pageTitle}>Shops</h1><p style={T.pageSub}>{shops.length} shops</p></div>
        {canEdit && (
          <button style={T.btnPrimary} onClick={() => setShowAdd(true)}
            onMouseEnter={e => e.currentTarget.style.opacity='.88'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            <PlusIcon style={{ width:14,height:14 }}/> Add Shop
          </button>
        )}
      </div>
      <div style={T.tableCard}>
        <table style={{ width:'100%',borderCollapse:'collapse' }}>
          <thead><tr>
            <th style={T.th}>Name</th><th style={T.th}>Address</th><th style={T.th}>Location</th>
            {canEdit && <th style={T.thRight}>Actions</th>}
          </tr></thead>
          <tbody>
            {shops.map(shop => (
              <tr key={shop.id} style={T.tr}
                onMouseEnter={e => e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <td style={T.tdBold}>{shop.name}</td>
                <td style={T.td}>{shop.address || '—'}</td>
                <td style={T.td}>{shop.location?.name || '—'}</td>
                {canEdit && (
                  <td style={T.tdRight}>
                    <div style={{ display:'flex',justifyContent:'flex-end',gap:'6px' }}>
                      <button style={T.iconBtn('var(--accent-soft)')} onClick={() => setEditItem(shop)}
                        onMouseEnter={e => e.currentTarget.style.background='var(--accent-d)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(108,99,255,.1)'}>
                        <PencilIcon style={{ width:13,height:13 }}/>
                      </button>
                      <button style={T.iconBtn('var(--rose)')} onClick={() => handleDelete(shop.id)}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,90,126,.2)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(255,90,126,.1)'}>
                        <TrashIcon style={{ width:13,height:13 }}/>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {shops.length === 0 && <div style={T.stateBox}>No shops found</div>}
      </div>
      <AddShopModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { refetch(); setShowAdd(false); }}/>
      <EditShopModal isOpen={!!editItem} onClose={() => setEditItem(null)} shop={editItem} onSuccess={() => { refetch(); setEditItem(null); }}/>
    </div>
  );
}
