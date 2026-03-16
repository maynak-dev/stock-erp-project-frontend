// import { useState } from 'react';
// import { Tab } from '@headlessui/react';
// import { useReports } from '../hooks/useReports';
// import { useAuth } from '../contexts/AuthContext';
// import { useEffect } from 'react';
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';

// function classNames(...classes) {
//   return classes.filter(Boolean).join(' ');
// }

// const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// export default function ReportsPage() {
//   const { user } = useAuth();
//   const { loading, error, fetchStockReport, fetchExpiryReport, fetchReturnReport, fetchSalesReport } = useReports();
//   const [stockData, setStockData] = useState([]);
//   const [expiryData, setExpiryData] = useState([]);
//   const [returnData, setReturnData] = useState([]);
//   const [salesData, setSalesData] = useState([]);
//   const [filters, setFilters] = useState({
//     companyId: user?.companyId || '',
//     locationId: '',
//     shopId: '',
//     startDate: '',
//     endDate: '',
//   });

//   // Fetch data when filters change
//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const stock = await fetchStockReport(filters);
//         setStockData(stock);
//         const expiry = await fetchExpiryReport(filters);
//         setExpiryData(expiry);
//         const returns = await fetchReturnReport(filters);
//         setReturnData(returns);
//         const sales = await fetchSalesReport(filters);
//         setSalesData(sales);
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     fetchAll();
//   }, [filters]);

//   const handleFilterChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   return (
//     <div>
//       <h1 className="text-2xl font-semibold text-gray-900 mb-6">Reports</h1>

//       {/* Filters */}
//       <div className="bg-white shadow rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Company</label>
//           <select
//             name="companyId"
//             value={filters.companyId}
//             onChange={handleFilterChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           >
//             <option value="">All Companies</option>
//             {/* This would ideally be populated from API, but for simplicity we'll keep as is */}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Location</label>
//           <select
//             name="locationId"
//             value={filters.locationId}
//             onChange={handleFilterChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           >
//             <option value="">All Locations</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Shop</label>
//           <select
//             name="shopId"
//             value={filters.shopId}
//             onChange={handleFilterChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           >
//             <option value="">All Shops</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Start Date</label>
//           <input
//             type="date"
//             name="startDate"
//             value={filters.startDate}
//             onChange={handleFilterChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">End Date</label>
//           <input
//             type="date"
//             name="endDate"
//             value={filters.endDate}
//             onChange={handleFilterChange}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//           />
//         </div>
//       </div>

//       {/* Tabs */}
//       <Tab.Group>
//         <Tab.List className="flex space-x-1 rounded-xl bg-indigo-900/20 p-1">
//           <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-indigo-700 shadow' : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600')}>
//             Stock Report
//           </Tab>
//           <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-indigo-700 shadow' : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600')}>
//             Expiry Report
//           </Tab>
//           <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-indigo-700 shadow' : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600')}>
//             Return Report
//           </Tab>
//           <Tab className={({ selected }) => classNames('w-full rounded-lg py-2.5 text-sm font-medium leading-5', 'ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2', selected ? 'bg-white text-indigo-700 shadow' : 'text-indigo-500 hover:bg-white/[0.12] hover:text-indigo-600')}>
//             Sales Report
//           </Tab>
//         </Tab.List>
//         <Tab.Panels className="mt-4">
//           <Tab.Panel className="bg-white rounded-lg p-6 shadow">
//             <h2 className="text-lg font-medium mb-4">Stock Summary</h2>
//             <ResponsiveContainer width="100%" height={400}>
//               <BarChart data={stockData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="value" fill="#4F46E5" />
//               </BarChart>
//             </ResponsiveContainer>
//           </Tab.Panel>
//           <Tab.Panel className="bg-white rounded-lg p-6 shadow">
//             <h2 className="text-lg font-medium mb-4">Expiring Items</h2>
//             <ResponsiveContainer width="100%" height={400}>
//               <PieChart>
//                 <Pie
//                   data={expiryData}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                   outerRadius={150}
//                   fill="#8884d8"
//                   dataKey="value"
//                 >
//                   {expiryData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </Tab.Panel>
//           <Tab.Panel className="bg-white rounded-lg p-6 shadow">
//             <h2 className="text-lg font-medium mb-4">Return Requests</h2>
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead>
//                 <tr>
//                   <th className="px-4 py-2 text-left">Request #</th>
//                   <th className="px-4 py-2 text-left">Shop</th>
//                   <th className="px-4 py-2 text-left">Date</th>
//                   <th className="px-4 py-2 text-left">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {returnData.map((item) => (
//                   <tr key={item.id}>
//                     <td className="px-4 py-2">{item.requestNumber}</td>
//                     <td className="px-4 py-2">{item.shop?.name}</td>
//                     <td className="px-4 py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
//                     <td className="px-4 py-2">{item.status}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </Tab.Panel>
//           <Tab.Panel className="bg-white rounded-lg p-6 shadow">
//             <h2 className="text-lg font-medium mb-4">Sales Report</h2>
//             <ResponsiveContainer width="100%" height={400}>
//               <BarChart data={salesData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <Tooltip />
//                 <Legend />
//                 <Bar dataKey="sales" fill="#10B981" />
//               </BarChart>
//             </ResponsiveContainer>
//           </Tab.Panel>
//         </Tab.Panels>
//       </Tab.Group>
//     </div>
//   );
// }

export default function ReportsPage() {
  return <div className="p-6">Reports Page</div>;
}