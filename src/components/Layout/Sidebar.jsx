import { NavLink } from 'react-router-dom';
import {
  HomeIcon, BuildingOfficeIcon, MapPinIcon, ShoppingBagIcon,
  CubeIcon, TagIcon, ClockIcon, ArrowPathIcon, ChartBarIcon,
  UserGroupIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name:'Dashboard',     href:'/dashboard',  icon:HomeIcon,           roles:['*'] },
  { name:'Companies',     href:'/companies',  icon:BuildingOfficeIcon, roles:['SUPER_ADMIN','COMPANY_ADMIN'] },
  { name:'Locations',     href:'/locations',  icon:MapPinIcon,         roles:['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER'] },
  { name:'Shops',         href:'/shops',      icon:ShoppingBagIcon,    roles:['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER','SHOP_OWNER'] },
  { name:'Products',      href:'/products',   icon:CubeIcon,           roles:['*'] },
  { name:'Categories',    href:'/categories', icon:TagIcon,            roles:['SUPER_ADMIN','COMPANY_ADMIN'] },
  { name:'Stock',         href:'/stock',      icon:CubeIcon,           roles:['*'] },
  { name:'Expiry Alerts', href:'/expiry',     icon:ClockIcon,          roles:['*'] },
  { name:'Returns',       href:'/returns',    icon:ArrowPathIcon,      roles:['SHOP_OWNER','COMPANY_ADMIN','SUPER_ADMIN'] },
  { name:'Reports',       href:'/reports',    icon:ChartBarIcon,       roles:['*'] },
  { name:'Users',         href:'/users',      icon:UserGroupIcon,      roles:['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER'] },
];

export default function Sidebar({ onClose }) {
  const { user } = useAuth();
  const filteredNav = navigation.filter(item =>
    item.roles.includes('*') || item.roles.includes(user?.role)
  );

  return (
    <div style={{ width:'240px', height:'100%', background:'var(--bg-surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
      <div style={{ height:'64px', display:'flex', alignItems:'center', padding:'0 16px 0 20px', borderBottom:'1px solid var(--border)', gap:'10px' }}>
        <div style={{ width:'32px', height:'32px', background:'linear-gradient(135deg, var(--accent), var(--teal))', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:700, color:'#fff', flexShrink:0, boxShadow:'0 0 16px var(--accent-g)' }}>S</div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'13px', fontWeight:700, color:'var(--t1)', letterSpacing:'.02em' }}>StockERP</div>
          <div style={{ fontSize:'10px', color:'var(--t3)', letterSpacing:'.06em', textTransform:'uppercase' }}>Management</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="hamburger-btn"
            style={{ width:'30px', height:'30px', borderRadius:'7px', background:'var(--bg-elevated)', border:'1px solid var(--border)', alignItems:'center', justifyContent:'center', color:'var(--t2)', cursor:'pointer', flexShrink:0 }}>
            <XMarkIcon style={{ width:15, height:15 }}/>
          </button>
        )}
      </div>

      <nav style={{ flex:1, overflowY:'auto', padding:'12px 10px' }}>
        <div style={{ fontSize:'10px', color:'var(--t3)', letterSpacing:'.1em', textTransform:'uppercase', padding:'8px 10px 6px', fontWeight:600 }}>Navigation</div>
        {filteredNav.map(item => (
          <NavLink key={item.name} to={item.href} onClick={onClose}
            style={({ isActive }) => ({
              display:'flex', alignItems:'center', gap:'10px',
              padding:'9px 10px', borderRadius:'8px', marginBottom:'2px',
              fontSize:'13px', fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent-soft)' : 'var(--t2)',
              background: isActive ? 'var(--accent-d)' : 'transparent',
              textDecoration:'none', transition:'all .15s',
            })}>
            <item.icon style={{ width:'16px', height:'16px', flexShrink:0 }}/>
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding:'12px 20px', borderTop:'1px solid var(--border)', fontSize:'11px', color:'var(--t3)', display:'flex', alignItems:'center', gap:'6px' }}>
        <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--teal)', boxShadow:'0 0 6px var(--teal)' }}/>
        v1.0.0 · Production
      </div>
    </div>
  );
}
