import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import CompanyModal from './CompanyModal';
import { useCompanies } from '../../hooks/useCompanies';
import { S } from '../../styles';
import toast from 'react-hot-toast';

export default function CompanyList() {
  const { companies, loading, error, deleteCompany, refetch } = useCompanies();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);

  const handleEdit = (company) => { setEditingCompany(company); setIsModalOpen(true); };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this company?')) {
      try { await deleteCompany(id); toast.success('Company deleted'); refetch(); }
      catch { toast.error('Failed to delete company'); }
    }
  };
  const handleClose = () => { setIsModalOpen(false); setEditingCompany(null); };
  const handleSuccess = () => { refetch(); handleClose(); };

  if (loading) return <div style={S.stateBox}>Loading companies…</div>;
  if (error) return <div style={{...S.stateBox, color:'var(--rose)'}}>Error: {error}</div>;

  return (
    <div>
      <div style={S.topBar}>
        <div>
          <h1 style={S.pageTitle}>Companies</h1>
          <p style={S.pageSub}>{companies.length} registered</p>
        </div>
        <button style={S.btnPrimary} onClick={() => setIsModalOpen(true)}
          onMouseEnter={e=>e.currentTarget.style.opacity='.88'}
          onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
          <PlusIcon style={{width:14,height:14}}/> Add Company
        </button>
      </div>

      <div style={S.tableCard}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={S.th}>Name</th>
              <th style={S.th}>GST</th>
              <th style={S.th}>Contact</th>
              <th style={S.th}>Address</th>
              <th style={S.thRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id} style={S.tr}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={S.tdBold}>{c.name}</td>
                <td style={{...S.td,...S.mono}}>{c.gst || '—'}</td>
                <td style={S.td}>{c.contact || '—'}</td>
                <td style={S.td}>{c.address || '—'}</td>
                <td style={S.tdRight}>
                  <div style={{display:'flex',justifyContent:'flex-end',gap:'6px'}}>
                    <button style={S.iconBtn('var(--accent-soft)')} onClick={()=>handleEdit(c)}
                      onMouseEnter={e=>{e.currentTarget.style.background='var(--accent-d)';e.currentTarget.style.borderColor='var(--accent)'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(108,99,255,.1)';e.currentTarget.style.borderColor='rgba(108,99,255,.13)'}}>
                      <PencilIcon style={{width:13,height:13}}/>
                    </button>
                    <button style={S.iconBtn('var(--rose)')} onClick={()=>handleDelete(c.id)}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,90,126,.2)'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,90,126,.1)'}}>
                      <TrashIcon style={{width:13,height:13}}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {companies.length === 0 && <div style={S.stateBox}>No companies found</div>}
      </div>

      <CompanyModal isOpen={isModalOpen} onClose={handleClose} company={editingCompany} onSuccess={handleSuccess}/>
    </div>
  );
}
