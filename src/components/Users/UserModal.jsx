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
  email: z.string().email('Invalid email'),
  password: z.string().min(6,'Password must be at least 6 characters').optional(),
  name: z.string().min(1,'Name is required'),
  role: z.enum(['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER','SHOP_OWNER','SHOP_EMPLOYEE']),
  companyId: z.string().optional(),
  locationId: z.string().optional(),
  shopId: z.string().optional(),
});

export default function UserModal({ isOpen, onClose, user, onSuccess }) {
  const { user: me } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shops, setShops] = useState([]);
  const { register, handleSubmit, watch, formState:{errors}, reset, setValue } = useForm({
    resolver: zodResolver(schema), defaultValues: user || { role:'SHOP_EMPLOYEE' }
  });

  const selectedRole = watch('role');
  const selectedCompany = watch('companyId');
  const selectedLocation = watch('locationId');

  useEffect(() => { api.get('/companies').then(r=>setCompanies(r.data)).catch(console.error); }, []);
  useEffect(() => {
    if (selectedCompany) api.get(`/locations?companyId=${selectedCompany}`).then(r=>setLocations(r.data)).catch(console.error);
    else setLocations([]);
  }, [selectedCompany]);
  useEffect(() => {
    if (selectedLocation) api.get(`/shops?locationId=${selectedLocation}`).then(r=>setShops(r.data)).catch(console.error);
    else setShops([]);
  }, [selectedLocation]);
  useEffect(() => {
    if (user) { reset(user); }
    else { reset({role:'SHOP_EMPLOYEE'}); if (me.role !== 'SUPER_ADMIN') setValue('companyId', me.companyId); }
  }, [user, reset, me]);

  const onSubmit = async (data) => {
    try {
      user ? await api.put(`/users/${user.id}`, data) : await api.post('/users', data);
      toast.success(user ? 'User updated' : 'User created'); onSuccess();
    } catch(e) { toast.error(e.response?.data?.message || 'Operation failed'); }
  };

  const SelectField = ({label,name,children,disabled}) => (
    <div style={M.formGroup}>
      <label style={M.label}>{label}</label>
      <select {...register(name)} disabled={disabled} style={{...M.select,opacity:disabled?.6:1}} onFocus={onFocus} onBlur={onBlur}>
        {children}
      </select>
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
                <Dialog.Title style={{...M.title,margin:0}}>{user ? 'Edit User' : 'Add User'}</Dialog.Title>
                <button onClick={onClose} style={{background:'none',border:'none',color:'var(--t3)',cursor:'pointer'}}><XMarkIcon style={{width:16,height:16}}/></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                  <div style={M.formGroup}>
                    <label style={M.label}>Name *</label>
                    <input {...register('name')} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
                    {errors.name && <p style={M.error}>{errors.name.message}</p>}
                  </div>
                  <div style={M.formGroup}>
                    <label style={M.label}>Email *</label>
                    <input type="email" {...register('email')} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
                    {errors.email && <p style={M.error}>{errors.email.message}</p>}
                  </div>
                </div>
                {!user && (
                  <div style={M.formGroup}>
                    <label style={M.label}>Password *</label>
                    <input type="password" {...register('password')} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
                    {errors.password && <p style={M.error}>{errors.password.message}</p>}
                  </div>
                )}
                <SelectField label="Role *" name="role">
                  <option value="SUPER_ADMIN">Super Admin</option>
                  <option value="COMPANY_ADMIN">Company Admin</option>
                  <option value="LOCATION_MANAGER">Location Manager</option>
                  <option value="SHOP_OWNER">Shop Owner</option>
                  <option value="SHOP_EMPLOYEE">Shop Employee</option>
                </SelectField>
                {selectedRole !== 'SUPER_ADMIN' && (
                  <SelectField label="Company" name="companyId" disabled={me.role !== 'SUPER_ADMIN' && me.companyId}>
                    <option value="">Select company</option>
                    {companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </SelectField>
                )}
                {['LOCATION_MANAGER','SHOP_OWNER','SHOP_EMPLOYEE'].includes(selectedRole) && selectedCompany && (
                  <SelectField label="Location" name="locationId">
                    <option value="">Select location</option>
                    {locations.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}
                  </SelectField>
                )}
                {['SHOP_OWNER','SHOP_EMPLOYEE'].includes(selectedRole) && selectedLocation && (
                  <SelectField label="Shop" name="shopId">
                    <option value="">Select shop</option>
                    {shops.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </SelectField>
                )}
                <div style={M.footer}>
                  <button type="button" onClick={onClose} style={M.btnCancel}>Cancel</button>
                  <button type="submit" style={M.btnSubmit}>{user ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
