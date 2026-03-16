import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { modalStyles as M, onFocus, onBlur } from '../styles';

const schema = z.object({
  stockId: z.string().min(1,'Stock item is required'),
  quantity: z.number().min(1,'Quantity must be at least 1'),
  toType: z.enum(['LOCATION','SHOP']),
  toId: z.string().min(1,'Destination is required'),
});

export default function TransferStockModal({ isOpen, onClose, onSuccess }) {
  const [stockItems, setStockItems] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const { register, handleSubmit, formState:{errors,isSubmitting}, reset, watch } = useForm({
    resolver: zodResolver(schema), defaultValues:{quantity:1,toType:'LOCATION'}
  });
  const watchToType = watch('toType');

  useEffect(() => { if (isOpen) api.get('/stock').then(r=>setStockItems(r.data)).catch(console.error); }, [isOpen]);
  useEffect(() => {
    if (watchToType) api.get(watchToType==='LOCATION'?'/locations':'/shops').then(r=>setDestinations(r.data)).catch(console.error);
  }, [watchToType]);

  const onSubmit = async (data) => {
    try { await api.post('/stock/transfer', data); toast.success('Stock transferred'); reset(); onSuccess(); onClose(); }
    catch(e) { toast.error(e.response?.data?.message || 'Transfer failed'); }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" style={{position:'fixed',inset:0,zIndex:50}} onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',backdropFilter:'blur(4px)'}}/>
        </Transition.Child>
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',zIndex:51}}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel style={M.panel}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <Dialog.Title style={{...M.title,margin:0}}>Transfer Stock</Dialog.Title>
                <button onClick={onClose} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer'}}><XMarkIcon style={{width:16,height:16}}/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={M.formGroup}>
                  <label style={M.label}>Stock Item *</label>
                  <select {...register('stockId')} style={M.select} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select stock item</option>
                    {stockItems.map(i=><option key={i.id} value={i.id}>{i.product?.name} — Batch: {i.batchNumber}, Qty: {i.quantity}</option>)}
                  </select>
                  {errors.stockId && <p style={M.error}>{errors.stockId.message}</p>}
                </div>
                <div style={M.formGroup}>
                  <label style={M.label}>Quantity *</label>
                  <input type="number" {...register('quantity',{valueAsNumber:true})} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
                  {errors.quantity && <p style={M.error}>{errors.quantity.message}</p>}
                </div>
                <div style={M.formGroup}>
                  <label style={M.label}>Transfer To *</label>
                  <select {...register('toType')} style={M.select} onFocus={onFocus} onBlur={onBlur}>
                    <option value="LOCATION">Location</option>
                    <option value="SHOP">Shop</option>
                  </select>
                </div>
                <div style={M.formGroup}>
                  <label style={M.label}>{watchToType === 'LOCATION' ? 'Location' : 'Shop'} *</label>
                  <select {...register('toId')} style={M.select} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select destination</option>
                    {destinations.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  {errors.toId && <p style={M.error}>{errors.toId.message}</p>}
                </div>
                <div style={M.footer}>
                  <button type="button" onClick={onClose} style={M.btnCancel}>Cancel</button>
                  <button type="submit" disabled={isSubmitting} style={{...M.btnSubmit,opacity:isSubmitting?.6:1}}>
                    {isSubmitting ? 'Transferring…' : 'Transfer'}
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
