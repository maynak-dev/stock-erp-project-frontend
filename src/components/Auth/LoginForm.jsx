import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function LoginForm() {
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
      toast.success('Logged in successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const inputBase = {
    width:'100%', padding:'11px 14px',
    background:'var(--bg-elevated)', border:'1px solid var(--border2)',
    borderRadius:'10px', fontSize:'14px', color:'var(--t1)',
    fontFamily:'Sora,sans-serif', outline:'none',
    transition:'border-color .15s, box-shadow .15s', boxSizing:'border-box',
  };
  const onFocus = (e) => { e.target.style.borderColor='var(--accent)'; e.target.style.boxShadow='0 0 0 3px var(--accent-d)'; };
  const onBlur  = (e) => { e.target.style.borderColor='var(--border2)'; e.target.style.boxShadow='none'; };

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center', padding:'16px', position:'relative', overflow:'hidden' }}>
      {/* Background glows */}
      <div style={{ position:'absolute', top:'-120px', left:'-120px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(108,99,255,.12) 0%, transparent 70%)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-100px', right:'-100px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(15,207,176,.08) 0%, transparent 70%)', pointerEvents:'none' }}/>

      {/* Card */}
      <div style={{ width:'100%', maxWidth:'400px', background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'20px', padding:'32px 28px', boxShadow:'0 32px 80px rgba(0,0,0,.6)', position:'relative', zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ width:'48px', height:'48px', background:'linear-gradient(135deg, var(--accent), var(--teal))', borderRadius:'13px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', fontWeight:800, color:'#fff', margin:'0 auto 14px', boxShadow:'0 0 24px var(--accent-g)' }}>S</div>
          <h2 style={{ fontSize:'19px', fontWeight:700, color:'var(--t1)', margin:'0 0 5px', letterSpacing:'-.02em' }}>Sign in to StockERP</h2>
          <p style={{ fontSize:'12px', color:'var(--t3)', margin:0 }}>Enter your credentials to continue</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom:'14px' }}>
            <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:'var(--t3)', marginBottom:'6px', letterSpacing:'.04em', textTransform:'uppercase' }}>
              Email Address
            </label>
            <input
              type="email" required placeholder="you@company.com"
              value={email} onChange={e => setEmail(e.target.value)}
              style={inputBase} onFocus={onFocus} onBlur={onBlur}
            />
          </div>

          {/* Password with eye toggle */}
          <div style={{ marginBottom:'22px' }}>
            <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:'var(--t3)', marginBottom:'6px', letterSpacing:'.04em', textTransform:'uppercase' }}>
              Password
            </label>
            <div style={{ position:'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                required placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)}
                style={{ ...inputBase, paddingRight:'44px' }}
                onFocus={onFocus} onBlur={onBlur}
              />
              {/* Eye toggle button */}
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer',
                  color:'var(--t3)', display:'flex', alignItems:'center', justifyContent:'center',
                  padding:'4px', borderRadius:'5px', transition:'color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color='var(--accent-soft)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--t3)'}
                tabIndex={-1}
                title={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass
                  ? <EyeSlashIcon style={{ width:'17px', height:'17px' }}/>
                  : <EyeIcon      style={{ width:'17px', height:'17px' }}/>
                }
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            style={{
              width:'100%', padding:'12px',
              background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, var(--accent), #8b83ff)',
              border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:600,
              color: loading ? 'var(--t3)' : '#fff', fontFamily:'Sora,sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 4px 20px var(--accent-g)',
              transition:'opacity .15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
