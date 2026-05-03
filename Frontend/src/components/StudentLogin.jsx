import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, ChevronLeft } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function StudentLogin({ onVerified, onBack }) {
  const [name, setName]     = useState('');
  const [roll, setRoll]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleVerify = async () => {
    if (!name.trim() || !roll.trim()) { setError('Both fields are required.'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), roll: roll.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        onVerified({ token: data.token, name: name.trim(), roll: roll.trim() });
      } else {
        setError(data.message || 'Verification failed. Check your credentials.');
      }
    } catch {
      setError('Cannot reach server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="student-login"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-md mx-auto pt-16 px-4"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 14, delay: 0.15 }}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(123,178,217,0.12)',
            border: '1px solid rgba(123,178,217,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <User size={36} style={{ color: 'var(--color-sky-reflection)' }} />
        </motion.div>
        <h1 className="text-4xl font-extrabold tracking-tight text-ivory-mist">Candidate Verification</h1>
        <p className="text-white\/50 mt-2 text-sm">Terminal unlocked · Enter your details to proceed</p>
      </div>

      <div className="glass-morphism-strong p-8 fade-in">
        <div className="space-y-5">
          <div>
            <label className="label">Full Name</label>
            <input
              id="student-name"
              type="text"
              className="input-field"
              placeholder="e.g. Harman Saini"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
            />
          </div>
          <div>
            <label className="label">Roll Number / Enrollment ID</label>
            <input
              id="student-roll"
              type="text"
              className="input-field"
              placeholder="e.g. CS-2024-001"
              value={roll}
              onChange={e => setRoll(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
            />
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
            id="verify-student-btn"
            className="btn-primary w-full"
            onClick={handleVerify}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Verifying...' : 'Verify & Proceed'}
            <ArrowRight size={15} />
          </button>

          <button
            className="btn-ghost w-full"
            onClick={onBack}
            style={{ marginTop: 4 }}
          >
            <ChevronLeft size={15} /> Back to Invigilator Unlock
          </button>
        </div>
      </div>
    </motion.div>
  );
}
