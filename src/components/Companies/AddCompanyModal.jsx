import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import ModalShell, { M, Field, TextArea } from '../ModalShell';

const schema = z.object({
  name: z.string().min(1, 'Company name is required'),
  gst: z.string().optional(),
  contact: z.string().optional(),
  address: z.string().optional(),
});

export default function AddCompanyModal({ isOpen, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', gst: '', contact: '', address: '' },
  });

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (data) => {
    try {
      await api.post('/companies', data);
      toast.success('Company created');
      reset();
      onSuccess();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create'); }
  };

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title="Add Company">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Field label="Company Name" name="name" register={register} errors={errors} required />
        <Field label="GST Number" name="gst" register={register} errors={errors} />
        <Field label="Contact" name="contact" register={register} errors={errors} />
        <TextArea label="Address" name="address" register={register} />
        <div style={M.footer}>
          <button type="button" onClick={handleClose} style={M.btnCancel}>Cancel</button>
          <button type="submit" disabled={isSubmitting} style={{ ...M.btnSubmit, opacity: isSubmitting ? .6 : 1 }}>
            {isSubmitting ? 'Creating…' : 'Create Company'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
