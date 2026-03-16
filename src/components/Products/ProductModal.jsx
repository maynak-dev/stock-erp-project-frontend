import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { modalStyles as M, onFocus, onBlur } from '../../styles';

const schema = z.object({
  name: z.string().min(1,'Product name is required'),
  sku: z.string().min(1,'SKU is required'),
  defaultPrice: z.number().min(0,'Price must be positive'),
  shelfLifeDays: z.number().int().positive().optional().nullable(),
  companyId: z.string().min(1,'Company is required'),
});

export default function ProductModal({ isOpen, onClose, product, onSuccess }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const { register, handleSubmit, formState:{errors}, reset, setValue } = useForm({ resolver: zodResolver(schema), defaultValues: product || {} });

  useEffect(() => {
    if (!isOpen) return;
    api.get('/companies').then(r => setCompanies(r.data)).catch(console.error);
    if (product) { reset(product); }
    else { reset({}); if (user.role !== 'SUPER_ADMIN' && user.companyId) setValue('companyId', user.companyId); }
  }, [isOpen, product, reset, setValue, user]);

  const onSubmit = async (data) => {
    try {
      product ? await api.put(`/products/${product.id}`, data) : await api.post('/products', data);
      toast.success(product ? 'Product updated' : 'Product created'); onSuccess();
    } catch(e) { toast.error(e.response?.data?.message || 'Operation failed'); }
  };

  const InputField = ({label,name,type='text',required,step}) => (
    <div style={M.formGroup}>
      <label style={M.label}>{label}{required && ' *'}</label>
      <input type={type} step={step} {...register(name, type==='number'?{valueAsNumber:true}:{})} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
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
                <Dialog.Title style={{...M.title,margin:0}}>{product ? 'Edit Product' : 'Add Product'}</Dialog.Title>
                <button onClick={onClose} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer'}}><XMarkIcon style={{width:16,height:16}}/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={M.formGroup}>
                  <label style={M.label}>Company *</label>
                  <select {...register('companyId')} disabled={user.role !== 'SUPER_ADMIN' && user.companyId} style={{...M.select,opacity:(user.role!=='SUPER_ADMIN'&&user.companyId)?'.6':'1'}} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.companyId && <p style={M.error}>{errors.companyId.message}</p>}
                </div>
                <InputField label="Product Name" name="name" required/>
                <InputField label="SKU" name="sku" required/>
                <InputField label="Default Price" name="defaultPrice" type="number" step="0.01" required/>
                <InputField label="Shelf Life (days)" name="shelfLifeDays" type="number"/>
                <div style={M.footer}>
                  <button type="button" onClick={onClose} style={M.btnCancel}>Cancel</button>
                  <button type="submit" style={M.btnSubmit}>{product ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
