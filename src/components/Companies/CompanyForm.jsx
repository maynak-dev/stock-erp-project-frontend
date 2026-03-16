import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { modalStyles as M, onFocus, onBlur } from '../../styles';

const schema = z.object({
  name: z.string().min(1,'Company name is required'),
  gst: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
});

export default function CompanyForm({ initialData, onSubmit, onCancel }) {
  const { register, handleSubmit, formState:{errors,isSubmitting}, reset } = useForm({
    resolver: zodResolver(schema), defaultValues: initialData || {}
  });
  useEffect(() => { if (initialData) reset(initialData); }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {[['name','Company Name',true],['gst','GST Number'],['contact','Contact']].map(([name,label,req])=>(
        <div key={name} style={M.formGroup}>
          <label style={M.label}>{label}{req && ' *'}</label>
          <input {...register(name)} style={M.input} onFocus={onFocus} onBlur={onBlur}/>
          {errors[name] && <p style={M.error}>{errors[name].message}</p>}
        </div>
      ))}
      <div style={M.formGroup}>
        <label style={M.label}>Address</label>
        <textarea {...register('address')} rows={3} style={M.textarea} onFocus={onFocus} onBlur={onBlur}/>
      </div>
      <div style={M.footer}>
        <button type="button" onClick={onCancel} style={M.btnCancel}>Cancel</button>
        <button type="submit" disabled={isSubmitting} style={{...M.btnSubmit, opacity:isSubmitting?.5:1}}>
          {isSubmitting ? 'Saving…' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
