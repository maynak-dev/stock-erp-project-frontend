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

const schema = z.object({ name: z.string().min(1,'Shop name is required'), address: z.string().optional(), locationId: z.string().min(1,'Location is required') });

export default function ShopModal({ isOpen, onClose, shop, onSuccess }) {
  const { user } = useAuth();
  const [locations, setLocations] = useState([]);
  const { register, handleSubmit, formState:{errors}, reset, setValue } = useForm({ resolver: zodResolver(schema), defaultValues: shop || {} });

  useEffect(() => {
    if (!isOpen) return;
    api.get('/locations').then(r => setLocations(r.data)).catch(console.error);
    if (shop) { reset(shop); } else { reset({}); if (user.role === 'LOCATION_MANAGER' && user.locationId) setValue('locationId', user.locationId); }
  }, [isOpen, shop, reset, setValue, user]);

  const onSubmit = async (data) => {
    try {
      shop ? await api.put(`/shops/${shop.id}`, data) : await api.post('/shops', data);
      toast.success(shop ? 'Shop updated' : 'Shop created'); onSuccess();
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
                <Dialog.Title style={{...M.title,margin:0}}>{shop ? 'Edit Shop' : 'Add Shop'}</Dialog.Title>
                <button onClick={onClose} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer'}}><XMarkIcon style={{width:16,height:16}}/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={M.formGroup}>
                  <label style={M.label}>Location *</label>
                  <select {...register('locationId')} disabled={user.role === 'LOCATION_MANAGER' && user.locationId} style={{...M.select,opacity:(user.role==='LOCATION_MANAGER'&&user.locationId)?'.6':'1'}} onFocus={onFocus} onBlur={onBlur}>
                    <option value="">Select location</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  {errors.locationId && <p style={M.error}>{errors.locationId.message}</p>}
                </div>
                <div style={M.formGroup}>
                  <label style={M.label}>Shop Name *</label>
                  <input {...register('name')} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
                  {errors.name && <p style={M.error}>{errors.name.message}</p>}
                </div>
                <div style={M.formGroup}>
                  <label style={M.label}>Address</label>
                  <textarea {...register('address')} rows={3} style={M.textarea} onFocus={onFocus} onBlur={onBlur}/>
                </div>
                <div style={M.footer}>
                  <button type="button" onClick={onClose} style={M.btnCancel}>Cancel</button>
                  <button type="submit" style={M.btnSubmit}>{shop ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
