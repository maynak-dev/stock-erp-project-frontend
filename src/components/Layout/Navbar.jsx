import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav style={{
      height: '64px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      {/* Left: breadcrumb hint */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        Welcome back, <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user?.name || 'User'}</span>
      </div>

      {/* Right: actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Role badge */}
        <div style={{
          padding: '4px 10px',
          borderRadius: '20px',
          border: '1px solid var(--border-bright)',
          fontSize: '11px',
          color: 'var(--accent-soft)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          background: 'var(--accent-dim)',
        }}>
          {user?.role?.replace(/_/g, ' ') || 'User'}
        </div>

        {/* Bell */}
        <button style={{
          width: '36px', height: '36px',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          background: 'var(--bg-elevated)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
        }}>
          <BellIcon style={{ width: '16px', height: '16px' }} />
        </button>

        {/* User menu */}
        <Menu as="div" style={{ position: 'relative' }}>
          <Menu.Button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 10px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg-elevated)',
            cursor: 'pointer',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 500,
            fontFamily: 'Sora, sans-serif',
          }}>
            <div style={{
              width: '26px', height: '26px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, var(--accent), var(--teal))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#fff',
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {user?.name}
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '160px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-bright)',
              borderRadius: '10px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              zIndex: 50,
              outline: 'none',
            }}>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 14px',
                      fontSize: '13px',
                      color: active ? 'var(--rose)' : 'var(--text-secondary)',
                      background: active ? 'rgba(255,90,126,0.08)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'Sora, sans-serif',
                      transition: 'all 0.1s',
                    }}
                  >
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