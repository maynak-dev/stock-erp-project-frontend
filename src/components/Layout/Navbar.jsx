import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      height: '64px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0,
    }}>
      {/* Left: hamburger (mobile) + welcome text (desktop) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Hamburger — shown only on mobile via CSS */}
        <button
          onClick={onMenuClick}
          className="hamburger-btn"
          style={{
            width: '36px', height: '36px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
            alignItems: 'center', justifyContent: 'center',
            color: 'var(--t2)', cursor: 'pointer',
          }}>
          <Bars3Icon style={{ width: 18, height: 18 }} />
        </button>

        <div className="nav-welcome" style={{ fontSize: '13px', color: 'var(--t3)' }}>
          Welcome back,{' '}
          <span style={{ color: 'var(--t1)', fontWeight: 500 }}>{user?.name || 'User'}</span>
        </div>
      </div>

      {/* Right: role badge + bell + user menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Role badge — hidden on small screens */}
        <div className="nav-role-badge" style={{
          padding: '4px 10px', borderRadius: '20px',
          border: '1px solid var(--border2)',
          fontSize: '11px', color: 'var(--accent-soft)',
          fontWeight: 600, letterSpacing: '.04em',
          textTransform: 'uppercase', background: 'var(--accent-d)',
        }}>
          {user?.role?.replace(/_/g, ' ') || 'User'}
        </div>

        {/* Bell */}
        <button style={{
          width: '36px', height: '36px', borderRadius: '8px',
          border: '1px solid var(--border)', background: 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--t2)',
        }}>
          <BellIcon style={{ width: '16px', height: '16px' }} />
        </button>

        {/* User menu */}
        <Menu as="div" style={{ position: 'relative' }}>
          <Menu.Button style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '6px 10px', borderRadius: '8px',
            border: '1px solid var(--border)', background: 'var(--bg-elevated)',
            cursor: 'pointer', color: 'var(--t1)',
            fontSize: '13px', fontWeight: 500, fontFamily: 'Sora, sans-serif',
          }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--accent), var(--teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {/* Hide name text on very small screens */}
            <span style={{ display: 'block' }}
              className="nav-welcome">
              {user?.name}
            </span>
          </Menu.Button>

          <Transition as={Fragment}
            enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"  leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
            <Menu.Items style={{
              position: 'absolute', right: 0, top: 'calc(100% + 8px)',
              width: '160px', background: 'var(--bg-card)',
              border: '1px solid var(--border2)', borderRadius: '10px',
              boxShadow: '0 16px 40px rgba(0,0,0,.5)',
              overflow: 'hidden', zIndex: 50, outline: 'none',
            }}>
              {/* Show user info on mobile inside dropdown */}
              <div style={{
                padding: '10px 14px', borderBottom: '1px solid var(--border)',
                fontSize: '12px',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--t1)', marginBottom: '2px' }}>{user?.name}</div>
                <div style={{ color: 'var(--t3)', fontSize: '11px' }}>{user?.role?.replace(/_/g, ' ')}</div>
              </div>
              <Menu.Item>
                {({ active }) => (
                  <button onClick={logout} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 14px', fontSize: '13px',
                    color: active ? 'var(--rose)' : 'var(--t2)',
                    background: active ? 'rgba(255,90,126,.08)' : 'transparent',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'Sora, sans-serif', transition: 'all .1s',
                  }}>
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </nav>
  );
}
