import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ShoppingBagIcon,
  CubeIcon,
  ClockIcon,
  ArrowPathIcon,
  ChartBarIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['*'] },
  { name: 'Companies', href: '/companies', icon: BuildingOfficeIcon, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN'] },
  { name: 'Locations', href: '/locations', icon: MapPinIcon, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'LOCATION_MANAGER'] },
  { name: 'Shops', href: '/shops', icon: ShoppingBagIcon, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'LOCATION_MANAGER', 'SHOP_OWNER'] },
  { name: 'Products', href: '/products', icon: CubeIcon, roles: ['*'] },
  { name: 'Stock', href: '/stock', icon: CubeIcon, roles: ['*'] },
  { name: 'Expiry Alerts', href: '/expiry', icon: ClockIcon, roles: ['*'] },
  { name: 'Returns', href: '/returns', icon: ArrowPathIcon, roles: ['SHOP_OWNER', 'COMPANY_ADMIN', 'SUPER_ADMIN'] },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon, roles: ['*'] },
  { name: 'Users', href: '/users', icon: UserGroupIcon, roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'LOCATION_MANAGER'] },
];

export default function Sidebar() {
  const { user } = useAuth();
  const filteredNav = navigation.filter(item =>
    item.roles.includes('*') || item.roles.includes(user?.role)
  );

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="flex items-center justify-center h-16 bg-indigo-600 text-white text-xl font-bold">
        ERP System
      </div>
      <nav className="flex-1 mt-5 overflow-y-auto">
        {filteredNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium ${
                isActive
                  ? 'bg-indigo-100 text-indigo-700 border-r-4 border-indigo-500'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}