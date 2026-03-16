import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const stockSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  manufacturingDate: z.string().min(1, 'Manufacturing date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive').optional(),
});

export default function AddStockModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(stockSchema),
    defaultValues: { quantity: 1 }
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch products for the user's company
      api.get('/products')
        .then(res => setProducts(res.data))
        .catch(console.error);
    }
  }, [isOpen]);

  const onSubmit = async (data) => {
    try {
      await api.post('/stock', data);
      toast.success('Stock added successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add stock');
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
                  Add New Stock
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product *</label>
                    <select
                      {...register('productId')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                    {errors.productId && <p className="text-red-500 text-xs">{errors.productId.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Batch Number *</label>
                    <input
                      {...register('batchNumber')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.batchNumber && <p className="text-red-500 text-xs">{errors.batchNumber.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Manufacturing Date *</label>
                    <input
                      type="date"
                      {...register('manufacturingDate')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.manufacturingDate && <p className="text-red-500 text-xs">{errors.manufacturingDate.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date *</label>
                    <input
                      type="date"
                      {...register('expiryDate')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.expiryDate && <p className="text-red-500 text-xs">{errors.expiryDate.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity *</label>
                    <input
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.quantity && <p className="text-red-500 text-xs">{errors.quantity.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price (optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register('price', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
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
                      Add Stock
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