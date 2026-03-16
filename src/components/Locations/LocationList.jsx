import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import LocationModal from './LocationModal';
import { useLocations } from '../../hooks/useLocations';
import { useAuth } from '../../contexts/AuthContext';
import { S } from '../../styles';
import toast from 'react-hot-toast';

export default function LocationList() {
  const { locations, loading, error, deleteLocation, refetch } = useLocations();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'COMPANY_ADMIN';

  const handleEdit = (loc) => { setEditingLocation(loc); setIsModalOpen(true); };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this location?')) {
      try { await deleteLocation(id); toast.success('Location deleted'); refetch(); }
      catch { toast.error('Failed to delete'); }
    }
  };
  const handleClose = () => { setIsModalOpen(false); setEditingLocation(null); };

  if (loading) return <div style={S.stateBox}>Loading locations…</div>;
  if (error) return <div style={{...S.stateBox,color:'var(--rose)'}}>Error: {error}</div>;

  return (
    <div>
      <div style={S.topBar}>
        <div>
          <h1 style={S.pageTitle}>Locations</h1>
          <p style={S.pageSub}>{locations.length} locations</p>
        </div>
        {canEdit && (
          <button style={S.btnPrimary} onClick={() => setIsModalOpen(true)}
            onMouseEnter={e=>e.currentTarget.style.opacity='.88'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <PlusIcon style={{width:14,height:14}}/> Add Location
          </button>
        )}
      </div>
      <div style={S.tableCard}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={S.th}>Name</th>
              <th style={S.th}>Address</th>
              <th style={S.th}>Company</th>
              {canEdit && <th style={S.thRight}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {locations.map(loc => (
              <tr key={loc.id} style={S.tr}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={S.tdBold}>{loc.name}</td>
                <td style={S.td}>{loc.address || '—'}</td>
                <td style={S.td}>{loc.company?.name}</td>
                {canEdit && (
                  <td style={S.tdRight}>
                    <div style={{display:'flex',justifyContent:'flex-end',gap:'6px'}}>
                      <button style={S.iconBtn('var(--accent-soft)')} onClick={()=>handleEdit(loc)}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--accent-d)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(108,99,255,.1)'}>
                        <PencilIcon style={{width:13,height:13}}/>
                      </button>
                      <button style={S.iconBtn('var(--rose)')} onClick={()=>handleDelete(loc.id)}
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
        {locations.length === 0 && <div style={S.stateBox}>No locations found</div>}
      </div>
      <LocationModal isOpen={isModalOpen} onClose={handleClose} location={editingLocation} onSuccess={()=>{refetch();handleClose();}}/>
    </div>
  );
}
