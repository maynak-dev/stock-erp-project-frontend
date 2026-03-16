import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import ShopModal from './ShopModal';
import { useShops } from '../../hooks/useShops';
import { useAuth } from '../../contexts/AuthContext';
import { S } from '../../styles';
import toast from 'react-hot-toast';

export default function ShopList() {
  const { shops, loading, error, deleteShop, refetch } = useShops();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const canEdit = ['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER'].includes(user?.role);

  const handleEdit = (s) => { setEditingShop(s); setIsModalOpen(true); };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this shop?')) {
      try { await deleteShop(id); toast.success('Shop deleted'); refetch(); }
      catch { toast.error('Failed to delete'); }
    }
  };
  const handleClose = () => { setIsModalOpen(false); setEditingShop(null); };

  if (loading) return <div style={S.stateBox}>Loading shops…</div>;
  if (error) return <div style={{...S.stateBox,color:'var(--rose)'}}>Error: {error}</div>;

  return (
    <div>
      <div style={S.topBar}>
        <div><h1 style={S.pageTitle}>Shops</h1><p style={S.pageSub}>{shops.length} shops</p></div>
        {canEdit && (
          <button style={S.btnPrimary} onClick={()=>setIsModalOpen(true)}
            onMouseEnter={e=>e.currentTarget.style.opacity='.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <PlusIcon style={{width:14,height:14}}/> Add Shop
          </button>
        )}
      </div>
      <div style={S.tableCard}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={S.th}>Name</th><th style={S.th}>Address</th><th style={S.th}>Location</th>
              {canEdit && <th style={S.thRight}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {shops.map(shop => (
              <tr key={shop.id} style={S.tr}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={S.tdBold}>{shop.name}</td>
                <td style={S.td}>{shop.address || '—'}</td>
                <td style={S.td}>{shop.location?.name}</td>
                {canEdit && (
                  <td style={S.tdRight}>
                    <div style={{display:'flex',justifyContent:'flex-end',gap:'6px'}}>
                      <button style={S.iconBtn('var(--accent-soft)')} onClick={()=>handleEdit(shop)}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--accent-d)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(108,99,255,.1)'}>
                        <PencilIcon style={{width:13,height:13}}/>
                      </button>
                      <button style={S.iconBtn('var(--rose)')} onClick={()=>handleDelete(shop.id)}
                        onMouseEnter={e=>e.currentTarget.style.background='rgba(255,90,126,.2)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(255,90,126,.1)'}>
                        <TrashIcon style={{width:13,height:13}}/>
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {shops.length === 0 && <div style={S.stateBox}>No shops found</div>}
      </div>
      <ShopModal isOpen={isModalOpen} onClose={handleClose} shop={editingShop} onSuccess={()=>{refetch();handleClose();}}/>
    </div>
  );
}
