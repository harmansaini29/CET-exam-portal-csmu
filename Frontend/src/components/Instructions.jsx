import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

const RULES = [
  'Questions are randomly shuffled for each candidate.',
  'Timer auto-submits when time expires. No extensions.',
  'No negative marking. Each correct answer scores 1 mark.',
  'Your AI performance report is generated instantly on submission.',
];

const VIOLATIONS = [
  { text: 'Switching tabs or minimizing the browser', fatal: true },
  { text: 'Pressing the Windows / Cmd / Meta key', fatal: true },
  { text: 'Exiting fullscreen mode (Esc key)', fatal: true },
  { text: 'Any browser focus loss (Alt+Tab, OS switch)', fatal: true },
];

export default function Instructions({ studentName, onProceed }) {
  return (
    <motion.div
      key="instructions"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto pt-10 px-4 pb-20"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <ClipboardList
          size={64}
          style={{ color: 'var(--color-cherry-rose)', margin: '0 auto 16px', display: 'block' }}
        />
        <h1 className="text-4xl font-extrabold tracking-tight text-ivory-mist">Exam Guidelines</h1>
      </div>

      {/* Personalized Welcome */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          background: 'linear-gradient(135deg, rgba(123,178,217,0.1), rgba(166,28,60,0.08))',
          border: '1px solid rgba(123,178,217,0.25)',
          borderRadius: 18,
          padding: '24px 32px',
          marginBottom: 28,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        <Sparkles size={28} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', lineHeight: 1.3 }}>
            Welcome, <span style={{ color: 'var(--color-sky-bright)' }}>{studentName}</span>!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4, fontSize: '0.92rem' }}>
            Your secured exam environment is ready and proctoring is active.
          </p>
        </div>
      </motion.div>

      {/* Rules Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Core Rules */}
        <div className="glass-morphism p-6">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-sky-reflection)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={18} /> Core Rules
          </h3>
          <ul className="space-y-3">
            {RULES.map((r, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}
              >
                <CheckCircle2 size={16} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                {r}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Zero Tolerance */}
        <div style={{ background: 'rgba(166,28,60,0.08)', border: '1px solid rgba(166,28,60,0.25)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-cherry-rose)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} /> Zero-Tolerance Policy
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
            The following actions result in <strong style={{ color: 'var(--color-cherry-rose)' }}>immediate exam termination + auto-submit</strong>. No warnings are given.
          </p>
          <ul className="space-y-3">
            {VIOLATIONS.map((v, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.87rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}
              >
                <span style={{ color: 'var(--color-cherry-rose)', fontWeight: 800, flexShrink: 0 }}>✕</span>
                {v.text}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button
          id="proceed-to-exams-btn"
          className="btn-primary px-12"
          style={{ fontSize: '1rem', padding: '16px 48px' }}
          onClick={onProceed}
        >
          I Understand — View Available Exams <ArrowRight size={18} />
        </button>
        <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)' }}>
          By proceeding you acknowledge the zero-tolerance policy above.
        </p>
      </div>
    </motion.div>
  );
}
