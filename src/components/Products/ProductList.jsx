import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import ProductModal from './ProductModal';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../contexts/AuthContext';
import { S } from '../../styles';
import toast from 'react-hot-toast';

export default function ProductList() {
  const { products, loading, error, deleteProduct, refetch } = useProducts();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const canEdit = ['SUPER_ADMIN','COMPANY_ADMIN'].includes(user?.role);

  const handleEdit = (p) => { setEditingProduct(p); setIsModalOpen(true); };
  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      try { await deleteProduct(id); toast.success('Product deleted'); refetch(); }
      catch { toast.error('Failed to delete'); }
    }
  };
  const handleClose = () => { setIsModalOpen(false); setEditingProduct(null); };

  if (loading) return <div style={S.stateBox}>Loading products…</div>;
  if (error) return <div style={{...S.stateBox,color:'var(--rose)'}}>Error: {error}</div>;

  return (
    <div>
      <div style={S.topBar}>
        <div><h1 style={S.pageTitle}>Products</h1><p style={S.pageSub}>{products.length} products</p></div>
        {canEdit && (
          <button style={S.btnPrimary} onClick={()=>setIsModalOpen(true)}
            onMouseEnter={e=>e.currentTarget.style.opacity='.88'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <PlusIcon style={{width:14,height:14}}/> Add Product
          </button>
        )}
      </div>
      <div style={S.tableCard}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={S.th}>Name</th><th style={S.th}>SKU</th><th style={S.th}>Price</th>
              <th style={S.th}>Shelf Life</th><th style={S.th}>Company</th>
              {canEdit && <th style={S.thRight}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={S.tr}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-elevated)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={S.tdBold}>{p.name}</td>
                <td style={{...S.td,...S.mono}}>{p.sku}</td>
                <td style={S.td}><span style={{color:'var(--teal)',fontWeight:600}}>${p.defaultPrice}</span></td>
                <td style={S.td}>{p.shelfLifeDays ? `${p.shelfLifeDays}d` : '—'}</td>
                <td style={S.td}>{p.company?.name}</td>
                {canEdit && (
                  <td style={S.tdRight}>
                    <div style={{display:'flex',justifyContent:'flex-end',gap:'6px'}}>
                      <button style={S.iconBtn('var(--accent-soft)')} onClick={()=>handleEdit(p)}
                        onMouseEnter={e=>e.currentTarget.style.background='var(--accent-d)'}
                        onMouseLeave={e=>e.currentTarget.style.background='rgba(108,99,255,.1)'}>
                        <PencilIcon style={{width:13,height:13}}/>
                      </button>
                      <button style={S.iconBtn('var(--rose)')} onClick={()=>handleDelete(p.id)}
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
        {products.length === 0 && <div style={S.stateBox}>No products found</div>}
      </div>
      <ProductModal isOpen={isModalOpen} onClose={handleClose} product={editingProduct} onSuccess={()=>{refetch();handleClose();}}/>
    </div>
  );
}
