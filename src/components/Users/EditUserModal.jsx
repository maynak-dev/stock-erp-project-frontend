import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ModalShell, { M, Field, Select } from '../ModalShell';

const schema = z.object({
  email:      z.string().email('Invalid email'),
  name:       z.string().min(1, 'Name is required'),
  role:       z.enum(['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER','SHOP_OWNER','SHOP_EMPLOYEE']),
  companyId:  z.string().optional(),
  locationId: z.string().optional(),
  shopId:     z.string().optional(),
});

export default function EditUserModal({ isOpen, onClose, user, onSuccess }) {
  const { user: me } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shops,     setShops]     = useState([]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedRole     = watch('role');
  const selectedCompany  = watch('companyId');
  const selectedLocation = watch('locationId');

  useEffect(() => {
    api.get('/companies').then(r => setCompanies(r.data)).catch(console.error);
  }, []);

  // KEY FIX: populate form with the user's existing values on every open
  useEffect(() => {
    if (!isOpen || !user) return;
    reset({
      email:      user.email      ?? '',
      name:       user.name       ?? '',
      role:       user.role       ?? 'SHOP_EMPLOYEE',
      companyId:  user.companyId  ?? '',
      locationId: user.locationId ?? '',
      shopId:     user.shopId     ?? '',
    });
  }, [isOpen, user, reset]);

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
      await api.put(`/users/${user.id}`, data);
      toast.success('User updated');
      onSuccess();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
  };

  const isCompanyLocked = me.role !== 'SUPER_ADMIN' && !!me.companyId;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title="Edit User">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Field label="Full Name" name="name" register={register} errors={errors} required />
          <Field label="Email" name="email" type="email" register={register} errors={errors} required />
        </div>
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
            {isSubmitting ? 'Saving…' : 'Update User'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
