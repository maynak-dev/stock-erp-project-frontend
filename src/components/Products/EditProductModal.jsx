import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ModalShell, { M, Field, Select } from '../ModalShell';

const schema = z.object({
  companyId:    z.string().min(1, 'Company is required'),
  categoryId:   z.string().optional(),
  name:         z.string().min(1, 'Product name is required'),
  sku:          z.string().min(1, 'SKU is required'),
  defaultPrice: z.number({ invalid_type_error: 'Enter a valid price' }).min(0),
  shelfLifeDays: z.number().int().positive().optional().nullable(),
});

export default function EditProductModal({ isOpen, onClose, product, onSuccess }) {
  const { user } = useAuth();
  const [companies,  setCompanies]  = useState([]);
  const [categories, setCategories] = useState([]);

  const { register, handleSubmit, watch, formState:{ errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const selectedCompany = watch('companyId');

  useEffect(() => {
    if (!isOpen || !product) return;
    api.get('/companies').then(r => setCompanies(r.data)).catch(console.error);
    reset({
      companyId:    product.companyId    ?? '',
      categoryId:   product.categoryId   ?? '',
      name:         product.name         ?? '',
      sku:          product.sku          ?? '',
      defaultPrice: product.defaultPrice != null ? Number(product.defaultPrice) : '',
      shelfLifeDays: product.shelfLifeDays != null ? Number(product.shelfLifeDays) : '',
    });
  }, [isOpen, product, reset]);

  useEffect(() => {
    if (selectedCompany) {
      api.get('/categories').then(r => setCategories(r.data.filter(c => c.companyId === selectedCompany))).catch(console.error);
    } else { setCategories([]); }
  }, [selectedCompany]);

  const handleClose = () => { reset(); onClose(); };

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };
      if (!payload.categoryId) payload.categoryId = null;
      if (!payload.shelfLifeDays) delete payload.shelfLifeDays;
      await api.put(`/products/${product.id}`, payload);
      toast.success('Product updated');
      onSuccess();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update'); }
  };

  const isCompanyLocked = user.role !== 'SUPER_ADMIN';

  return (
    <ModalShell isOpen={isOpen} onClose={handleClose} title="Edit Product">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Select label="Company" name="companyId" register={register} errors={errors} required disabled={isCompanyLocked}>
          <option value="">Select company</option>
          {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Category (optional)" name="categoryId" register={register} errors={errors}>
          <option value="">No category</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Field label="Product Name" name="name" register={register} errors={errors} required/>
        <Field label="SKU" name="sku" register={register} errors={errors} required/>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          <Field label="Default Price" name="defaultPrice" type="number" step="0.01" register={register} errors={errors} required/>
          <Field label="Shelf Life (days)" name="shelfLifeDays" type="number" register={register} errors={errors}/>
        </div>
        <div style={M.footer}>
          <button type="button" onClick={handleClose} style={M.btnCancel}>Cancel</button>
          <button type="submit" disabled={isSubmitting} style={{ ...M.btnSubmit, opacity: isSubmitting ? .6 : 1 }}>
            {isSubmitting ? 'Saving…' : 'Update Product'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
