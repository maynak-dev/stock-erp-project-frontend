import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, TagIcon } from '@heroicons/react/24/outline';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '../hooks/useCategories';
import { useAuth } from '../contexts/AuthContext';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ModalShell, { M, Field, TextArea } from '../components/ModalShell';
import toast from 'react-hot-toast';
import api from '../services/api';

const schema = z.object({
  name:        z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
});

const T = {
  pageTitle: { fontSize:'20px', fontWeight:700, color:'var(--t1)', letterSpacing:'-.02em', margin:0 },
  pageSub:   { fontSize:'12px', color:'var(--t3)', marginTop:'4px' },
  tableCard: { background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'14px', overflow:'hidden' },
  th:        { padding:'12px 18px', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.08em', textTransform:'uppercase', textAlign:'left', background:'var(--bg-surface)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' },
  thRight:   { padding:'12px 18px', fontSize:'10px', fontWeight:600, color:'var(--t3)', letterSpacing:'.08em', textTransform:'uppercase', textAlign:'right', background:'var(--bg-surface)', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' },
  tr:        { borderBottom:'1px solid var(--border)', transition:'background .12s' },
  td:        { padding:'13px 18px', fontSize:'13px', color:'var(--t2)', whiteSpace:'nowrap' },
  tdBold:    { padding:'13px 18px', fontSize:'13px', fontWeight:600, color:'var(--t1)', whiteSpace:'nowrap' },
  tdRight:   { padding:'13px 18px', fontSize:'13px', textAlign:'right', whiteSpace:'nowrap' },
  stateBox:  { padding:'48px', textAlign:'center', fontSize:'13px', color:'var(--t3)' },
  btnPrimary:{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'9px 16px', background:'linear-gradient(135deg,var(--accent),#8b83ff)', border:'none', borderRadius:'9px', fontSize:'13px', fontWeight:600, color:'#fff', cursor:'pointer', fontFamily:'Sora,sans-serif', boxShadow:'0 4px 16px var(--accent-g)', transition:'opacity .15s', whiteSpace:'nowrap' },
  iconBtn:   (c) => ({ width:'30px', height:'30px', borderRadius:'7px', border:`1px solid ${c}22`, background:`${c}10`, display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .15s', color:c }),
  badge:     { display:'inline-flex', alignItems:'center', padding:'3px 9px', borderRadius:'20px', fontSize:'11px', fontWeight:600, color:'var(--accent-soft)', background:'var(--accent-d)', border:'1px solid rgba(108,99,255,.2)' },
};

function CategoryModal({ isOpen, onClose, category, onSuccess, companyId }) {
  const { register, handleSubmit, formState:{ errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: category ? { name: category.name, description: category.description || '' } : { name:'', description:'' },
  });
  const { user } = useAuth();

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, companyId: companyId || user.companyId };
      if (category) await api.put(`/categories/${category.id}`, payload);
      else await api.post('/categories', payload);
      toast.success(category ? 'Category updated' : 'Category created');
      onSuccess();
      handleClose();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title={category ? 'Edit Category' : 'Add Category'}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field label="Category Name" name="name" register={register} errors={errors} required/>
        <TextArea label="Description (optional)" name="description" register={register}/>
        <div style={M.footer}>
          <button type="button" onClick={handleClose} style={M.btnCancel}>Cancel</button>
          <button type="submit" disabled={isSubmitting} style={{ ...M.btnSubmit, opacity: isSubmitting ? .6 : 1 }}>
            {isSubmitting ? 'Saving…' : category ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export default function CategoriesPage() {
  const { categories, loading, error, refetch, deleteCategory } = useCategories();
  const { user } = useAuth();
  const canEdit = ['SUPER_ADMIN','COMPANY_ADMIN'].includes(user?.role);
  const [showAdd,    setShowAdd]    = useState(false);
  const [editItem,   setEditItem]   = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleting,   setDeleting]   = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteCategory(deleteItem.id); toast.success('Category deleted'); refetch(); setDeleteItem(null); }
    catch { toast.error('Failed to delete'); }
    finally { setDeleting(false); }
  };

  if (loading) return <div style={T.stateBox}>Loading…</div>;
  if (error)   return <div style={{ ...T.stateBox, color:'var(--rose)' }}>Error: {error}</div>;

  return (
    <div>
      <div className="page-top-bar" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div><h1 style={T.pageTitle}>Categories</h1><p style={T.pageSub}>{categories.length} categories</p></div>
        {canEdit && (
          <button style={T.btnPrimary} onClick={() => setShowAdd(true)}
            onMouseEnter={e => e.currentTarget.style.opacity='.88'} onMouseLeave={e => e.currentTarget.style.opacity='1'}>
            <PlusIcon style={{ width:14, height:14 }}/> Add Category
          </button>
        )}
      </div>

      <div style={T.tableCard}>
        <div className="table-scroll">
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead><tr>
              <th style={T.th}>Name</th>
              <th style={T.th}>Description</th>
              <th style={T.th}>Company</th>
              <th style={T.th}>Products</th>
              {canEdit && <th style={T.thRight}>Actions</th>}
            </tr></thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} style={T.tr}
                  onMouseEnter={e => e.currentTarget.style.background='var(--bg-elevated)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={T.tdBold}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:'var(--accent-d)', border:'1px solid rgba(108,99,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <TagIcon style={{ width:'13px', height:'13px', color:'var(--accent-soft)' }}/>
                      </div>
                      {cat.name}
                    </div>
                  </td>
                  <td style={{ ...T.td, maxWidth:'240px', overflow:'hidden', textOverflow:'ellipsis' }}>{cat.description || '—'}</td>
                  <td style={T.td}>{cat.company?.name || '—'}</td>
                  <td style={T.td}>
                    <span style={T.badge}>{cat._count?.products ?? 0} products</span>
                  </td>
                  {canEdit && (
                    <td style={T.tdRight}>
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:'6px' }}>
                        <button style={T.iconBtn('var(--accent-soft)')} onClick={() => setEditItem(cat)}
                          onMouseEnter={e => e.currentTarget.style.background='var(--accent-d)'}
                          onMouseLeave={e => e.currentTarget.style.background='rgba(108,99,255,.1)'}>
                          <PencilIcon style={{ width:13, height:13 }}/>
                        </button>
                        <button style={T.iconBtn('var(--rose)')} onClick={() => setDeleteItem(cat)}
                          onMouseEnter={e => e.currentTarget.style.background='rgba(255,90,126,.2)'}
                          onMouseLeave={e => e.currentTarget.style.background='rgba(255,90,126,.1)'}>
                          <TrashIcon style={{ width:13, height:13 }}/>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {categories.length === 0 && (
          <div style={{ ...T.stateBox, display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
            <TagIcon style={{ width:'28px', height:'28px', color:'var(--t3)' }}/>
            No categories yet
          </div>
        )}
      </div>

      <CategoryModal isOpen={showAdd} onClose={() => setShowAdd(false)} onSuccess={() => { refetch(); setShowAdd(false); }} companyId={user?.companyId}/>
      <CategoryModal isOpen={!!editItem} onClose={() => setEditItem(null)} category={editItem} onSuccess={() => { refetch(); setEditItem(null); }}/>
      <DeleteConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Category" message={`Delete "${deleteItem?.name}"? Products in this category won't be deleted — they'll just become uncategorised.`}/>
    </div>
  );
}
