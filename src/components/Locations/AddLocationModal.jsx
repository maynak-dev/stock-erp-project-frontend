import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ModalShell, { M, Field, TextArea, Select } from '../ModalShell';

const schema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  name: z.string().min(1, 'Location name is required'),
  address: z.string().optional(),
});

export default function AddLocationModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setValue } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { companyId: '', name: '', address: '' },
  });

  useEffect(() => {
    if (!isOpen) return;
    api.get('/companies').then(r => setCompanies(r.data)).catch(console.error);
    // Reset to blank and pre-fill companyId for non-super-admins
    reset({ companyId: '', name: '', address: '' });
    if (user.role !== 'SUPER_ADMIN' && user.companyId) {
      setValue('companyId', user.companyId);
    }
  }, [isOpen, reset, setValue, user]);

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (data) => {
    try {
      await api.post('/locations', data);
      toast.success('Location created');
      reset();
      onSuccess();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create'); }
  };

  const isCompanyLocked = user.role !== 'SUPER_ADMIN' && !!user.companyId;

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title="Add Location">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Select label="Company" name="companyId" register={register} errors={errors} required disabled={isCompanyLocked}>
          <option value="">Select company</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Field label="Location Name" name="name" register={register} errors={errors} required />
        <TextArea label="Address" name="address" register={register} />
        <div style={M.footer}>
          <button type="button" onClick={handleClose} style={M.btnCancel}>Cancel</button>
          <button type="submit" disabled={isSubmitting} style={{ ...M.btnSubmit, opacity: isSubmitting ? .6 : 1 }}>
            {isSubmitting ? 'Creating…' : 'Create Location'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
