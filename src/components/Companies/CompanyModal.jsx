import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { modalStyles as M, onFocus, onBlur } from '../../styles';

const schema = z.object({
  name: z.string().min(1, 'Company name is required'),
  gst: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
});

export default function CompanyModal({ isOpen, onClose, company, onSuccess }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
    defaultValues: company || {},
  });

  const onSubmit = async (data) => {
    try {
      company
        ? await api.put(`/companies/${company.id}`, data)
        : await api.post('/companies', data);
      toast.success(company ? 'Company updated' : 'Company created');
      onSuccess();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Operation failed');
    }
  };

  // FIX: Use 'tag' instead of 'as' (reserved word issue), and use a plain string default
  const Field = ({ label, name, type = 'text', tag = 'input', rows, required }) => (
    <div style={M.formGroup}>
      <label style={M.label}>{label}{required && ' *'}</label>
      {tag === 'textarea'
        ? <textarea {...register(name)} rows={rows || 3} style={M.textarea} onFocus={onFocus} onBlur={onBlur} />
        : <input type={type} {...register(name)} style={M.input} onFocus={onFocus} onBlur={onBlur} />}
      {errors[name] && <p style={M.error}>{errors[name].message}</p>}
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" style={{ position: 'fixed', inset: 0, zIndex: 50 }} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)' }} />
        </Transition.Child>

        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 51 }}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel style={M.panel}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Dialog.Title style={{ ...M.title, margin: 0 }}>
                  {company ? 'Edit Company' : 'Add Company'}
                </Dialog.Title>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', padding: '4px' }}>
                  <XMarkIcon style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Field label="Company Name" name="name" required />
                <Field label="GST Number" name="gst" />
                <Field label="Contact" name="contact" />
                <Field label="Address" name="address" tag="textarea" />
                <div style={M.footer}>
                  <button type="button" onClick={onClose} style={M.btnCancel}>Cancel</button>
                  <button type="submit" style={M.btnSubmit}>{company ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}