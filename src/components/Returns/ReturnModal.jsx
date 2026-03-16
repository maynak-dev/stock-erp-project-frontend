import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const returnItemSchema = z.object({
  stockId: z.string().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  reason: z.string().optional(),
});

const returnSchema = z.object({
  items: z.array(returnItemSchema).min(1, 'At least one item is required'),
});

export default function ReturnModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [stockItems, setStockItems] = useState([]);
  const { register, control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(returnSchema),
    defaultValues: { items: [{ stockId: '', quantity: 1, reason: '' }] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  useEffect(() => {
    if (isOpen && user?.shopId) {
      // Fetch stock items available in this shop
      api.get('/stock?shopId=' + user.shopId)
        .then(res => setStockItems(res.data))
        .catch(console.error);
    }
  }, [isOpen, user]);

  const onSubmit = async (data) => {
    try {
      await api.post('/returns', data);
      toast.success('Return request created');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create return');
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  New Return Request
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4">
                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex items-start space-x-2 border-b pb-4">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Product</label>
                            <select
                              {...register(`items.${index}.stockId`)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            >
                              <option value="">Select</option>
                              {stockItems.map(item => (
                                <option key={item.id} value={item.id}>
                                  {item.product.name} (Batch: {item.batchNumber}, Qty: {item.quantity})
                                </option>
                              ))}
                            </select>
                            {errors.items?.[index]?.stockId && (
                              <p className="text-red-500 text-xs">{errors.items[index].stockId.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Quantity</label>
                            <input
                              type="number"
                              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                            {errors.items?.[index]?.quantity && (
                              <p className="text-red-500 text-xs">{errors.items[index].quantity.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Reason</label>
                            <input
                              {...register(`items.${index}.reason`)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            />
                          </div>
                        </div>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="mt-6 text-red-600 hover:text-red-900"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => append({ stockId: '', quantity: 1, reason: '' })}
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add another item
                    </button>

                    {errors.items && !Array.isArray(errors.items) && (
                      <p className="text-red-500 text-sm">{errors.items.message}</p>
                    )}
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
                      Submit Request
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