import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ModalShell, { M, Field, Select } from '../ModalShell';

const schema = z.object({
  email:    z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name:     z.string().min(1, 'Name is required'),
  role:     z.enum(['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER','SHOP_OWNER','SHOP_EMPLOYEE']),
  companyId:  z.string().optional(),
  locationId: z.string().optional(),
  shopId:     z.string().optional(),
});

export default function AddUserModal({ isOpen, onClose, onSuccess }) {
  const { user: me } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shops,     setShops]     = useState([]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email:'', password:'', name:'', role:'SHOP_EMPLOYEE', companyId:'', locationId:'', shopId:'' },
  });

  const selectedRole     = watch('role');
  const selectedCompany  = watch('companyId');
  const selectedLocation = watch('locationId');

  useEffect(() => {
    api.get('/companies').then(r => setCompanies(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    reset({ email:'', password:'', name:'', role:'SHOP_EMPLOYEE', companyId:'', locationId:'', shopId:'' });
    if (me.role !== 'SUPER_ADMIN' && me.companyId) setValue('companyId', me.companyId);
  }, [isOpen, reset, setValue, me]);

  useEffect(() => {
    if (selectedCompany) {
      api.get(`/locations?companyId=${selectedCompany}`).then(r => setLocations(r.data)).catch(console.error);
    } else { setLocations([]); }
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedLocation) {
      api.get(`/shops?locationId=${selectedLocation}`).then(r => setShops(r.data)).catch(console.error);
    } else { setShops([]); }
  }, [selectedLocation]);

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (data) => {
    try {
      await api.post('/users', data);
      toast.success('User created');
      reset();
      onSuccess();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create'); }
  };

  const isCompanyLocked = me.role !== 'SUPER_ADMIN' && !!me.companyId;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title="Add User">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Field label="Full Name" name="name" register={register} errors={errors} required />
          <Field label="Email" name="email" type="email" register={register} errors={errors} required />
        </div>
        <Field label="Password" name="password" type="password" register={register} errors={errors} required />
        <Select label="Role" name="role" register={register} errors={errors} required>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="COMPANY_ADMIN">Company Admin</option>
          <option value="LOCATION_MANAGER">Location Manager</option>
          <option value="SHOP_OWNER">Shop Owner</option>
          <option value="SHOP_EMPLOYEE">Shop Employee</option>
        </Select>
        {selectedRole !== 'SUPER_ADMIN' && (
          <Select label="Company" name="companyId" register={register} errors={errors} disabled={isCompanyLocked}>
            <option value="">Select company</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        )}
        {['LOCATION_MANAGER','SHOP_OWNER','SHOP_EMPLOYEE'].includes(selectedRole) && selectedCompany && (
          <Select label="Location" name="locationId" register={register} errors={errors}>
            <option value="">Select location</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </Select>
        )}
        {['SHOP_OWNER','SHOP_EMPLOYEE'].includes(selectedRole) && selectedLocation && (
          <Select label="Shop" name="shopId" register={register} errors={errors}>
            <option value="">Select shop</option>
            {shops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        )}
        <div style={M.footer}>
          <button type="button" onClick={handleClose} style={M.btnCancel}>Cancel</button>
          <button type="submit" disabled={isSubmitting} style={{ ...M.btnSubmit, opacity: isSubmitting ? .6 : 1 }}>
            {isSubmitting ? 'Creating…' : 'Create User'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
