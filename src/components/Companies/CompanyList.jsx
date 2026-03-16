import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import AddCompanyModal from './AddCompanyModal';
import EditCompanyModal from './EditCompanyModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import { useCompanies } from '../../hooks/useCompanies';
import toast from 'react-hot-toast';

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
};

export default function CompanyList() {
  const { companies, loading, error, deleteCompany, refetch } = useCompanies();
  const [showAdd,    setShowAdd]    = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteCompany(deleteItem.id); toast.success('Company deleted'); refetch(); setDeleteItem(null); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  if (loading) return <div style={T.stateBox}>Loading…</div>;
  if (error)   return <div style={{ ...T.stateBox, color:'var(--rose)' }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-top-bar" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div><h1 style={T.pageTitle}>Companies</h1><p style={T.pageSub}>{companies.length} registered</p></div>
        <button style={T.btnPrimary} onClick={() => setShowAdd(true)}
          onMouseEnter={e => e.currentTarget.style.opacity='.88'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          <PlusIcon style={{ width:14, height:14 }}/> Add Company
        </button>
      </div>

      <div style={T.tableCard}>
        <div className="table-scroll">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              <th style={T.th}>Name</th><th style={T.th}>GST</th>
              <th style={T.th}>Contact</th><th style={T.th}>Address</th>
              <th style={T.thRight}>Actions</th>
            </tr></thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id} style={T.tr}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={T.tdBold}>{c.name}</td>
                  <td style={{ ...T.td, fontFamily:'JetBrains Mono,monospace', fontSize:'12px' }}>{c.gst || '—'}</td>
                  <td style={T.td}>{c.contact || '—'}</td>
                  <td style={T.td}>{c.address || '—'}</td>
                  <td style={T.tdRight}>
                    <div style={{ display:'flex', justifyContent:'flex-end', gap:'6px' }}>
                      <button style={T.iconBtn('var(--accent-soft)')} onClick={() => setEditItem(c)}
                        onMouseEnter={e => e.currentTarget.style.background='var(--accent-d)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(108,99,255,.1)'}>
                        <PencilIcon style={{ width:13, height:13 }}/>
                      </button>
                      <button style={T.iconBtn('var(--rose)')} onClick={() => setDeleteItem(c)}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(255,90,126,.2)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(255,90,126,.1)'}>
                        <TrashIcon style={{ width:13, height:13 }}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {companies.length === 0 && <div style={T.stateBox}>No companies found</div>}
      </div>

      <AddCompanyModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { refetch(); setShowAdd(false); }}/>
      <EditCompanyModal isOpen={!!editItem} onClose={() => setEditItem(null)} company={editItem} onSuccess={() => { refetch(); setEditItem(null); }}/>
      <DeleteConfirmModal
        isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Company"
        message={`Are you sure you want to delete "${deleteItem?.name}"? All associated data will be permanently removed.`}
      />
    </div>
  );
}
