import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import UserModal from './UserModal';
import { useUsers } from '../../hooks/useUsers';
import { useAuth } from '../../contexts/AuthContext';
import { S } from '../../styles';
import toast from 'react-hot-toast';

const ROLE_BADGE = {
  SUPER_ADMIN:      { color:'var(--rose)',        bg:'rgba(255,90,126,.1)',   border:'rgba(255,90,126,.2)'   },
  COMPANY_ADMIN:    { color:'var(--amber)',        bg:'rgba(245,166,35,.1)',   border:'rgba(245,166,35,.2)'   },
  LOCATION_MANAGER: { color:'var(--teal)',         bg:'rgba(15,207,176,.1)',   border:'rgba(15,207,176,.2)'   },
  SHOP_OWNER:       { color:'var(--accent-soft)',  bg:'var(--accent-d)',       border:'rgba(108,99,255,.2)'   },
  SHOP_EMPLOYEE:    { color:'var(--t2)',           bg:'var(--bg-elevated)',    border:'var(--border2)'        },
};

export default function UserList() {
  const { users, loading, error, deleteUser, refetch } = useUsers();
  const { user: me } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const canEdit = ['SUPER_ADMIN','COMPANY_ADMIN'].includes(me?.role);

  const handleEdit = (u) => { setEditingUser(u); setIsModalOpen(true); };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      try { await deleteUser(id); toast.success('User deleted'); refetch(); }
      catch { toast.error('Failed to delete'); }
    }
  };
  const handleClose = () => { setIsModalOpen(false); setEditingUser(null); };

  if (loading) return <div style={S.stateBox}>Loading users…</div>;
  if (error) return <div style={{...S.stateBox,color:'var(--rose)'}}>Error: {error}</div>;

  return (
    <div>
      <div style={S.topBar}>
        <div><h1 style={S.pageTitle}>Users</h1><p style={S.pageSub}>{users.length} users</p></div>
        {canEdit && (
          <button style={S.btnPrimary} onClick={()=>setIsModalOpen(true)}
            onMouseEnter={e=>e.currentTarget.style.opacity='.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <PlusIcon style={{width:14,height:14}}/> Add User
          </button>
        )}
      </div>
      <div style={S.tableCard}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={S.th}>Name</th><th style={S.th}>Email</th><th style={S.th}>Role</th>
              <th style={S.th}>Company</th><th style={S.th}>Location / Shop</th>
              {canEdit && <th style={S.thRight}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const rb = ROLE_BADGE[u.role] || ROLE_BADGE.SHOP_EMPLOYEE;
              return (
                <tr key={u.id} style={S.tr}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={S.tdBold}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{width:'28px',height:'28px',borderRadius:'7px',background:'linear-gradient(135deg,var(--accent),var(--teal))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:700,color:'#fff',flexShrink:0}}>
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      {u.name}
                      {u.id === me?.id && <span style={{fontSize:'10px',color:'var(--accent-soft)',background:'var(--accent-d)',padding:'1px 6px',borderRadius:'4px'}}>You</span>}
                    </div>
                  </td>
                  <td style={{...S.td,...S.mono}}>{u.email}</td>
                  <td style={S.td}><span style={S.badge(rb.color,rb.bg,rb.border)}>{u.role.replace(/_/g,' ')}</span></td>
                  <td style={S.td}>{u.company?.name || '—'}</td>
                  <td style={S.td}>{u.location?.name || u.shop?.name || '—'}</td>
                  {canEdit && (
                    <td style={S.tdRight}>
                      <div style={{display:'flex',justifyContent:'flex-end',gap:'6px'}}>
                        <button style={S.iconBtn('var(--accent-soft)')} onClick={()=>handleEdit(u)}
                          onMouseEnter={e=>e.currentTarget.style.background='var(--accent-d)'}
                          onMouseLeave={e=>e.currentTarget.style.background='rgba(108,99,255,.1)'}>
                          <PencilIcon style={{width:13,height:13}}/>
                        </button>
                        {u.id !== me?.id && (
                          <button style={S.iconBtn('var(--rose)')} onClick={()=>handleDelete(u.id)}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,90,126,.2)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,90,126,.1)'}>
                            <TrashIcon style={{width:13,height:13}}/>
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <div style={S.stateBox}>No users found</div>}
      </div>
      <UserModal isOpen={isModalOpen} onClose={handleClose} user={editingUser} onSuccess={()=>{refetch();handleClose();}}/>
    </div>
  );
}
