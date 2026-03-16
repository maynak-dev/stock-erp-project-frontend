import { CurrencyDollarIcon, CubeIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const stats = [
  { name: 'Total Stock Value', value: '$0', icon: CurrencyDollarIcon },
  { name: 'Total Items', value: '0', icon: CubeIcon },
  { name: 'Expiring Soon', value: '0', icon: ClockIcon },
  { name: 'Pending Returns', value: '0', icon: ArrowPathIcon },
];

export default function StatsCards({ stats: customStats }) {
  const displayStats = customStats || stats;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {displayStats.map((item) => (
        <div
          key={item.name}
          className="bg-white overflow-hidden shadow rounded-lg"
        >
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                  <dd className="text-lg font-medium text-gray-900">{item.value}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}