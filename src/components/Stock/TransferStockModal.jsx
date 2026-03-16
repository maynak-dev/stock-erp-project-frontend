import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const transferSchema = z.object({
  stockId: z.string().min(1, 'Stock item is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  toType: z.enum(['LOCATION', 'SHOP']),
  toId: z.string().min(1, 'Destination is required'),
});

export default function TransferStockModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [stockItems, setStockItems] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [destinationType, setDestinationType] = useState('LOCATION');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      quantity: 1,
      toType: 'LOCATION',
    },
  });

  const watchToType = watch('toType');

  useEffect(() => {
    if (isOpen) {
      fetchStockItems();
    }
  }, [isOpen]);

  useEffect(() => {
    if (watchToType) {
      setDestinationType(watchToType);
      fetchDestinations(watchToType);
    }
  }, [watchToType]);

  const fetchStockItems = async () => {
    try {
      // Fetch stock available at current user's level
      const res = await api.get('/stock');
      setStockItems(res.data);
    } catch (error) {
      console.error('Failed to fetch stock', error);
      toast.error('Failed to load stock items');
    }
  };

  const fetchDestinations = async (type) => {
    try {
      let endpoint = '';
      if (type === 'LOCATION') {
        endpoint = '/locations';
      } else {
        endpoint = '/shops';
      }
      const res = await api.get(endpoint);
      setDestinations(res.data);
    } catch (error) {
      console.error('Failed to fetch destinations', error);
      toast.error('Failed to load destinations');
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.post('/stock/transfer', data);
      toast.success('Stock transferred successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transfer failed');
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
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Transfer Stock
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  {/* Stock Item Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Stock Item *
                    </label>
                    <select
                      {...register('stockId')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select stock item</option>
                      {stockItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.product?.name} (Batch: {item.batchNumber}, Qty: {item.quantity})
                        </option>
                      ))}
                    </select>
                    {errors.stockId && (
                      <p className="mt-1 text-sm text-red-600">{errors.stockId.message}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      {...register('quantity', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                    )}
                  </div>

                  {/* Destination Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Transfer To *
                    </label>
                    <select
                      {...register('toType')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="LOCATION">Location</option>
                      <option value="SHOP">Shop</option>
                    </select>
                    {errors.toType && (
                      <p className="mt-1 text-sm text-red-600">{errors.toType.message}</p>
                    )}
                  </div>

                  {/* Destination (Location/Shop) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {destinationType === 'LOCATION' ? 'Location *' : 'Shop *'}
                    </label>
                    <select
                      {...register('toId')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">
                        Select {destinationType === 'LOCATION' ? 'location' : 'shop'}
                      </option>
                      {destinations.map((dest) => (
                        <option key={dest.id} value={dest.id}>
                          {dest.name}
                        </option>
                      ))}
                    </select>
                    {errors.toId && (
                      <p className="mt-1 text-sm text-red-600">{errors.toId.message}</p>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Transferring...' : 'Transfer'}
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