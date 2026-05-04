import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: username, pass: password })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        if (data.role !== 'admin') {
          setError('Unauthorized. Admin access required.');
          setLoading(false);
          return;
        }
        localStorage.setItem('adminToken', data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection to backend failed');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--gradient-bg)', color: 'white', padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(20px)',
          padding: '40px', borderRadius: '16px',
          width: '100%', maxWidth: '400px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            background: 'rgba(123,178,217,0.1)', width: '60px', height: '60px',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', border: '1px solid rgba(123,178,217,0.3)'
          }}>
            <ShieldCheck size={32} style={{ color: 'var(--color-sky-bright)' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 8px' }}>Command Center</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', margin: 0 }}>Secure Admin Access</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(166,28,60,0.2)', border: '1px solid rgba(166,28,60,0.4)', color: '#ffb3c6', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Admin ID</label>
            <input 
              type="text" required value={username} onChange={e => setUsername(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', outline: 'none'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>Secure Key</label>
            <input 
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px', borderRadius: '8px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
                color: 'white', outline: 'none'
              }}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              marginTop: '10px', background: 'var(--color-sky-bright)', color: 'black',
              border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Lock size={16} /> {loading ? 'Authenticating...' : 'Authorize Access'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
