import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg-base)', color:'var(--t3)', fontSize:'13px', fontFamily:'Sora, sans-serif' }}>
      Loading…
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;


  if (allowedRoles.length > 0 && !allowedRoles.includes('*') && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};