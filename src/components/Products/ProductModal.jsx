import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  defaultPrice: z.number().min(0, 'Price must be positive'),
  shelfLifeDays: z.number().int().positive().optional().nullable(),
  companyId: z.string().min(1, 'Company is required'),
});

export default function ProductModal({ isOpen, onClose, product, onSuccess }) {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: product || {}
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('/companies');
        setCompanies(res.data);
      } catch (error) {
        console.error('Failed to fetch companies', error);
      }
    };
    if (isOpen) {
      fetchCompanies();
      if (product) {
        reset(product);
      } else {
        reset({});
        if (user.role !== 'SUPER_ADMIN' && user.companyId) {
          setValue('companyId', user.companyId);
        }
      }
    }
  }, [isOpen, product, reset, setValue, user]);

  const onSubmit = async (data) => {
    try {
      if (product) {
        await api.put(`/products/${product.id}`, data);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', data);
        toast.success('Product created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {product ? 'Edit Product' : 'Add Product'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company *</label>
                    <select
                      {...register('companyId')}
                      disabled={user.role !== 'SUPER_ADMIN' && user.companyId}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    >
                      <option value="">Select company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>{company.name}</option>
                      ))}
                    </select>
                    {errors.companyId && <p className="text-red-500 text-xs">{errors.companyId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product Name *</label>
                    <input
                      {...register('name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">SKU *</label>
                    <input
                      {...register('sku')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.sku && <p className="text-red-500 text-xs">{errors.sku.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Default Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('defaultPrice', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.defaultPrice && <p className="text-red-500 text-xs">{errors.defaultPrice.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Shelf Life (days)</label>
                    <input
                      type="number"
                      {...register('shelfLifeDays', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      {product ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}