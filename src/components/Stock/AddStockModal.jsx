import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { modalStyles as M, onFocus, onBlur } from '../../styles';

const schema = z.object({
  productId: z.string().min(1,'Product is required'),
  batchNumber: z.string().min(1,'Batch number is required'),
  manufacturingDate: z.string().min(1,'Manufacturing date is required'),
  expiryDate: z.string().min(1,'Expiry date is required'),
  quantity: z.number().min(1,'Quantity must be at least 1'),
  price: z.number().min(0).optional(),
});

export default function AddStockModal({ isOpen, onClose, onSuccess }) {
  const [products, setProducts] = useState([]);
  const { register, handleSubmit, formState:{errors}, reset } = useForm({ resolver: zodResolver(schema), defaultValues:{quantity:1} });

  useEffect(() => {
    if (isOpen) api.get('/products').then(r=>setProducts(r.data)).catch(console.error);
  }, [isOpen]);

  const onSubmit = async (data) => {
    try { await api.post('/stock', data); toast.success('Stock added'); reset(); onSuccess(); onClose(); }
    catch(e) { toast.error(e.response?.data?.message || 'Failed to add stock'); }
  };

  const Field = ({label,name,type='text',required,step}) => (
    <div style={M.formGroup}>
      <label style={M.label}>{label}{required&&' *'}</label>
      <input type={type} step={step} {...register(name,type==='number'?{valueAsNumber:true}:{})} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
      {errors[name] && <p style={M.error}>{errors[name].message}</p>}
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" style={{position:'fixed',inset:0,zIndex:50}} onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.65)',backdropFilter:'blur(4px)'}}/>
        </Transition.Child>
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',zIndex:51,overflowY:'auto'}}>
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel style={M.panel}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
                <Dialog.Title style={{...M.title,margin:0}}>Add New Stock</Dialog.Title>
                <button onClick={onClose} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer'}}><XMarkIcon style={{width:16,height:16}}/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={M.formGroup}>
                  <label style={M.label}>Product *</label>
                  <select {...register('productId')} style={M.select} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {errors.productId && <p style={M.error}>{errors.productId.message}</p>}
                </div>
                <Field label="Batch Number" name="batchNumber" required/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <Field label="Manufacturing Date" name="manufacturingDate" type="date" required/>
                  <Field label="Expiry Date" name="expiryDate" type="date" required/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <Field label="Quantity" name="quantity" type="number" required/>
                  <Field label="Price (optional)" name="price" type="number" step="0.01"/>
                </div>
                <div style={M.footer}>
                  <button type="button" onClick={onClose} style={M.btnCancel}>Cancel</button>
                  <button type="submit" style={M.btnSubmit}>Add Stock</button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
