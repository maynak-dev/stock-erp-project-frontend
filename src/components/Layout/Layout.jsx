import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display:'flex', height:'100vh', background:'var(--bg-base)', overflow:'hidden' }}>

      {/* Mobile overlay — tap to close */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — fixed drawer on mobile, static on desktop */}
      <div className={`sidebar-drawer ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="main-content" style={{ flex:1, overflowY:'auto', padding:'28px 32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
