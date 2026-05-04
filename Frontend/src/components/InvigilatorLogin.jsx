import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function InvigilatorLogin({ onUnlocked }) {
  const [id, setId]           = useState('');
  const [pass, setPass]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleUnlock = async () => {
    if (!id || !pass) { setError('Both fields are required.'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, pass }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        // Admin token is intentionally discarded — never stored in student session
        onUnlocked();
      } else {
        setError(data.message || 'Invalid credentials. Access denied.');
      }
    } catch {
      setError('Cannot reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="invigilator"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-md mx-auto pt-16 px-4"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14, delay: 0.15 }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(166,28,60,0.15)',
            border: '1px solid rgba(166,28,60,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <ShieldCheck size={36} style={{ color: 'var(--color-cherry-rose)' }} />
        </motion.div>
        <h1 className="text-4xl font-extrabold tracking-tight text-ivory-mist">Invigilator Terminal</h1>
        <p className="text-white\/50 mt-2 text-sm">Authenticate to unlock the exam portal for candidates</p>
        <div className="invigilator-badge" style={{ display: 'inline-flex', margin: '12px auto 0' }}>
          <Lock size={11} /> Secure Admin Channel
        </div>
      </div>

      {/* Card */}
      <div className="glass-morphism-strong p-8 fade-in">
        <div className="space-y-5">
          <div>
            <label className="label">Admin / Invigilator ID</label>
            <input
              id="invigilator-id"
              type="text"
              className="input-field"
              placeholder="e.g. admin1"
              value={id}
              onChange={e => setId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            />
          </div>
          <div>
            <label className="label">Access Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="invigilator-pass"
                type={showPass ? 'text' : 'password'}
                className="input-field"
                placeholder="••••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                style={{ paddingRight: '44px' }}
              />
              <button
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: 'var(--color-cherry-rose)', fontSize: '0.85rem', padding: '10px 14px', background: 'rgba(166,28,60,0.1)', borderRadius: 8, border: '1px solid rgba(166,28,60,0.25)' }}
            >
              {error}
            </motion.p>
          )}

          <button
            id="unlock-terminal-btn"
            className="btn-primary w-full"
            onClick={handleUnlock}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Authenticating...' : 'Unlock Terminal'}
            <Lock size={15} />
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
          Admin credentials are discarded immediately after unlock.<br />
          They are <strong style={{ color: 'rgba(255,255,255,0.5)' }}>never stored</strong> in the student session.
        </p>
      </div>
    </motion.div>
  );
}
