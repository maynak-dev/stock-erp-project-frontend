import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const userSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['SUPER_ADMIN', 'COMPANY_ADMIN', 'LOCATION_MANAGER', 'SHOP_OWNER', 'SHOP_EMPLOYEE']),
  companyId: z.string().optional(),
  locationId: z.string().optional(),
  shopId: z.string().optional(),
}).refine((data) => {
  // Password is required only for new users
  if (!data.id && !data.password) return false;
  return true;
}, {
  message: 'Password is required for new users',
  path: ['password'],
});

export default function UserModal({ isOpen, onClose, user, onSuccess }) {
  const { user: currentUser } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [locations, setLocations] = useState([]);
  const [shops, setShops] = useState([]);
  const { register, handleSubmit, watch, formState: { errors }, reset, setValue } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: user || { role: 'SHOP_EMPLOYEE' }
  });

  const selectedRole = watch('role');
  const selectedCompany = watch('companyId');

  useEffect(() => {
    const fetchCompanies = async () => {
      const res = await api.get('/companies');
      setCompanies(res.data);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      api.get(`/locations?companyId=${selectedCompany}`)
        .then(res => setLocations(res.data))
        .catch(console.error);
    } else {
      setLocations([]);
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (watch('locationId')) {
      api.get(`/shops?locationId=${watch('locationId')}`)
        .then(res => setShops(res.data))
        .catch(console.error);
    } else {
      setShops([]);
    }
  }, [watch('locationId')]);

  useEffect(() => {
    if (user) {
      reset(user);
    } else {
      reset({ role: 'SHOP_EMPLOYEE' });
      if (currentUser.role !== 'SUPER_ADMIN') {
        setValue('companyId', currentUser.companyId);
      }
    }
  }, [user, reset, currentUser]);

  const onSubmit = async (data) => {
    try {
      if (user) {
        await api.put(`/users/${user.id}`, data);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', data);
        toast.success('User created successfully');
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
                  {user ? 'Edit User' : 'Add User'}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      {...register('email')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                  </div>

                  {!user && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Password *</label>
                      <input
                        type="password"
                        {...register('password')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                      {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      {...register('name')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role *</label>
                    <select
                      {...register('role')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="SUPER_ADMIN">Super Admin</option>
                      <option value="COMPANY_ADMIN">Company Admin</option>
                      <option value="LOCATION_MANAGER">Location Manager</option>
                      <option value="SHOP_OWNER">Shop Owner</option>
                      <option value="SHOP_EMPLOYEE">Shop Employee</option>
                    </select>
                    {errors.role && <p className="text-red-500 text-xs">{errors.role.message}</p>}
                  </div>

                  {selectedRole !== 'SUPER_ADMIN' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Company</label>
                      <select
                        {...register('companyId')}
                        disabled={currentUser.role !== 'SUPER_ADMIN' && currentUser.companyId}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                      >
                        <option value="">Select company</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>{company.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {['LOCATION_MANAGER', 'SHOP_OWNER', 'SHOP_EMPLOYEE'].includes(selectedRole) && selectedCompany && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <select
                        {...register('locationId')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select location</option>
                        {locations.map(location => (
                          <option key={location.id} value={location.id}>{location.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {['SHOP_OWNER', 'SHOP_EMPLOYEE'].includes(selectedRole) && watch('locationId') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Shop</label>
                      <select
                        {...register('shopId')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      >
                        <option value="">Select shop</option>
                        {shops.map(shop => (
                          <option key={shop.id} value={shop.id}>{shop.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

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
                      {user ? 'Update' : 'Create'}
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