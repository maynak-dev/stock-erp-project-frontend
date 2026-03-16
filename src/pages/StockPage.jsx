import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import StockTable from '../components/Stock/StockTable';
import AddStockModal from '../components/Stock/AddStockModal';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function StockPage() {
  const [stock, setStock] = useState([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { user } = useAuth();
  const canAdd = ['COMPANY_ADMIN', 'LOCATION_MANAGER', 'SHOP_OWNER'].includes(user?.role);

  const fetchStock = async () => {
    try { const r = await api.get('/stock'); setStock(r.data); }
    catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStock(); }, []);

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:700, color:'var(--t1)', letterSpacing:'-.02em', margin:0 }}>
            Stock Management
          </h1>
          <p style={{ fontSize:'12px', color:'var(--t3)', marginTop:'4px' }}>
            {stock.length} items in inventory
          </p>
        </div>
        {canAdd && (
          <button
            onClick={() => setIsAddOpen(true)}
            style={{
              display:'inline-flex', alignItems:'center', gap:'6px',
              padding:'9px 16px',
              background:'linear-gradient(135deg, var(--accent), #8b83ff)',
              border:'none', borderRadius:'9px',
              fontSize:'13px', fontWeight:600, color:'#fff',
              cursor:'pointer', fontFamily:'Sora, sans-serif',
              boxShadow:'0 4px 16px var(--accent-g)', transition:'opacity .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <PlusIcon style={{ width:14, height:14 }}/> Add Stock
          </button>
        )}
      </div>

      <StockTable data={stock}/>

      <AddStockModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={fetchStock}
      />
    </div>
  );
}