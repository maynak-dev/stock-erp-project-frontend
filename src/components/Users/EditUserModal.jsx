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

const PERMISSION_GROUPS = [
  { label: 'Products', keys: ['canViewProducts','canCreateProducts','canEditProducts','canDeleteProducts'] },
  { label: 'Stock',    keys: ['canViewStock','canAddStock','canTransferStock'] },
  { label: 'Returns',  keys: ['canViewReturns','canCreateReturns','canApproveReturns'] },
  { label: 'Reports',  keys: ['canViewReports'] },
  { label: 'Users',    keys: ['canViewUsers','canManageUsers'] },
];

const PERM_LABELS = {
  canViewProducts:'View', canCreateProducts:'Create', canEditProducts:'Edit', canDeleteProducts:'Delete',
  canViewStock:'View', canAddStock:'Add', canTransferStock:'Transfer',
  canViewReturns:'View', canCreateReturns:'Create', canApproveReturns:'Approve',
  canViewReports:'View Reports',
  canViewUsers:'View', canManageUsers:'Manage',
};

export default function EditUserModal({ isOpen, onClose, user, onSuccess }) {
  const { user: me } = useAuth();
  const isSuperAdmin = me?.role === 'SUPER_ADMIN';
  const [companies,   setCompanies]   = useState([]);
  const [locations,   setLocations]   = useState([]);
  const [shops,       setShops]       = useState([]);
  const [permissions, setPermissions] = useState({});

  const { register, handleSubmit, watch, formState:{ errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedRole     = watch('role');
  const selectedCompany  = watch('companyId');
  const selectedLocation = watch('locationId');

  useEffect(() => { api.get('/companies').then(r => setCompanies(r.data)).catch(console.error); }, []);

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
    // Load existing permissions or empty object
    setPermissions(user.permissions ?? {});
  }, [isOpen, user, reset]);

  useEffect(() => {
    if (selectedCompany) api.get(`/locations?companyId=${selectedCompany}`).then(r => setLocations(r.data)).catch(console.error);
    else setLocations([]);
  }, [selectedCompany]);

  useEffect(() => {
    if (selectedLocation) api.get(`/shops?locationId=${selectedLocation}`).then(r => setShops(r.data)).catch(console.error);
    else setShops([]);
  }, [selectedLocation]);

  const togglePerm = (key) => setPermissions(p => ({ ...p, [key]: !p[key] }));
  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (data) => {
    try {
      await api.put(`/users/${user.id}`, { ...data, permissions });
      toast.success('User updated');
      onSuccess();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
  };

  const isCompanyLocked = me.role !== 'SUPER_ADMIN' && !!me.companyId;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title="Edit User" wide>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Field label="Full Name" name="name" register={register} errors={errors} required/>
          <Field label="Email" name="email" type="email" register={register} errors={errors} required/>
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

        {/* Permissions panel */}
        <div style={{ marginTop:'18px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
            <label style={M.label}>Permissions</label>
            {!isSuperAdmin && (
              <span style={{ fontSize:'11px', color:'var(--t3)', fontStyle:'italic' }}>
                Only Super Admin can edit permissions
              </span>
            )}
          </div>
          <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:'10px', padding:'14px', display:'flex', flexDirection:'column', gap:'14px' }}>
            {PERMISSION_GROUPS.map(group => (
              <div key={group.label}>
                <div style={{ fontSize:'11px', fontWeight:600, color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase', marginBottom:'8px' }}>{group.label}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {group.keys.map(key => (
                    <label key={key} style={{ display:'inline-flex', alignItems:'center', gap:'6px', cursor: isSuperAdmin ? 'pointer' : 'default', opacity: isSuperAdmin ? 1 : .7 }}>
                      <input
                        type="checkbox"
                        checked={!!permissions[key]}
                        onChange={() => isSuperAdmin && togglePerm(key)}
                        disabled={!isSuperAdmin}
                        style={{ accentColor:'var(--accent)', width:'14px', height:'14px' }}
                      />
                      <span style={{ fontSize:'12px', color:'var(--t2)' }}>{PERM_LABELS[key]}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

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
