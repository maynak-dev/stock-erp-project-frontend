import { useState } from 'react';
import { CheckIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import ReturnModal from './ReturnModal';
import { useReturns } from '../../hooks/useReturns';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

export default function ReturnList() {
  const { returns, loading, error, approveReturn, rejectReturn, refetch } = useReturns();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canCreate = user?.role === 'SHOP_OWNER' || user?.role === 'SHOP_EMPLOYEE';
  const canApprove = user?.role === 'COMPANY_ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleApprove = async (id) => {
    if (window.confirm('Approve this return request?')) {
      try {
        await approveReturn(id);
        toast.success('Return approved');
      } catch (err) {
        toast.error('Failed to approve return');
      }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Reject this return request?')) {
      try {
        await rejectReturn(id);
        toast.success('Return rejected');
      } catch (err) {
        toast.error('Failed to reject return');
      }
    }
  };

  const handleSuccess = () => {
    refetch();
    setIsModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Return Requests</h1>
        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Return Request
          </button>
        )}
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shop</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              {canApprove && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {returns.map((ret) => (
              <tr key={ret.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ret.requestNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ret.shop?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(ret.createdAt), 'dd/MM/yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[ret.status]}`}>
                    {ret.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {ret.items?.length} item(s)
                </td>
                {canApprove && ret.status === 'PENDING' && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleApprove(ret.id)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="Approve"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleReject(ret.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Reject"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReturnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}