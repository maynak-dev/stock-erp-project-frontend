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
  name: z.string().min(1,'Location name is required'),
  address: z.string().optional(),
  companyId: z.string().min(1,'Company is required'),
});

export default function LocationModal({ isOpen, onClose, location, onSuccess }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const { register, handleSubmit, formState:{errors}, reset, setValue } = useForm({ resolver: zodResolver(schema), defaultValues: location || {} });

  useEffect(() => {
    if (!isOpen) return;
    api.get('/companies').then(r => setCompanies(r.data)).catch(console.error);
    if (location) { reset(location); }
    else { reset({}); if (user.role !== 'SUPER_ADMIN' && user.companyId) setValue('companyId', user.companyId); }
  }, [isOpen, location, reset, setValue, user]);

  const onSubmit = async (data) => {
    try {
      location ? await api.put(`/locations/${location.id}`, data) : await api.post('/locations', data);
      toast.success(location ? 'Location updated' : 'Location created'); onSuccess();
    } catch(e) { toast.error(e.response?.data?.message || 'Operation failed'); }
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
                <Dialog.Title style={{...M.title,margin:0}}>{location ? 'Edit Location' : 'Add Location'}</Dialog.Title>
                <button onClick={onClose} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer'}}><XMarkIcon style={{width:16,height:16}}/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={M.formGroup}>
                  <label style={M.label}>Company *</label>
                  <select {...register('companyId')} disabled={user.role !== 'SUPER_ADMIN' && user.companyId} style={{...M.select,opacity:(user.role !== 'SUPER_ADMIN' && user.companyId)?'.6':'1'}} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select company</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.companyId && <p style={M.error}>{errors.companyId.message}</p>}
                </div>
                <div style={M.formGroup}>
                  <label style={M.label}>Location Name *</label>
                  <input {...register('name')} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
                  {errors.name && <p style={M.error}>{errors.name.message}</p>}
                </div>
                <div style={M.formGroup}>
                  <label style={M.label}>Address</label>
                  <textarea {...register('address')} rows={3} style={M.textarea} onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <div style={M.footer}>
                  <button type="button" onClick={onClose} style={M.btnCancel}>Cancel</button>
                  <button type="submit" style={M.btnSubmit}>{location ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
