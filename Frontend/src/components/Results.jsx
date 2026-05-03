import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, AlertTriangle, LogOut, Sparkles, TrendingUp } from 'lucide-react';

function getClosingMessage(name, accuracy) {
  if (accuracy >= 90) return { text: `Exceptional performance, ${name}! You're in the top tier.`, color: '#4ade80' };
  if (accuracy >= 75) return { text: `Great work, ${name}! Strong results across the board.`, color: 'var(--color-sky-bright)' };
  if (accuracy >= 55) return { text: `Solid effort, ${name}. A little more practice and you'll excel.`, color: 'var(--color-gold)' };
  return { text: `Keep going, ${name}. Every attempt brings you closer to mastery.`, color: 'rgba(255,255,255,0.7)' };
}

export default function Results({ studentName, examReport, examTerminated, onLogout }) {
  const accuracy  = examReport?.overall_accuracy ?? 0;
  const score     = examReport?.total_score      ?? 0;
  const strong    = examReport?.strong_topics    ?? ['Logic', 'General IT'];
  const weak      = examReport?.weak_topics      ?? [];
  const suggestions = examReport?.suggestions    ?? [];

  const closing   = getClosingMessage(studentName, accuracy);

  // SVG ring math
  const radius      = 70;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (accuracy / 100) * circumference;

  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto pt-10 px-4 pb-20"
    >
      <div className="text-center mb-10">
        <Trophy size={64} style={{ color: 'var(--color-gold)', margin: '0 auto 16px', display: 'block' }} />
        <h1 className="text-4xl font-extrabold tracking-tight text-ivory-mist">Performance Analysis</h1>
      </div>

      <div className="glass-morphism p-10 fade-in">
        {/* Personalized Closing */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            textAlign: 'center', marginBottom: 32,
            padding: '18px 24px',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          <Sparkles size={20} style={{ color: closing.color, flexShrink: 0 }} />
          <p style={{ fontSize: '1.15rem', fontWeight: 600, color: closing.color, lineHeight: 1.4 }}>
            {closing.text}
          </p>
        </motion.div>

        {/* Score Ring */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <svg width="180" height="180" viewBox="0 0 180 180">
              <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
              <motion.circle
                cx="90" cy="90" r={radius}
                fill="none"
                stroke={accuracy >= 70 ? 'var(--color-sky-reflection)' : 'var(--color-cherry-rose)'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                transform="rotate(-90 90 90)"
              />
              <text x="90" y="84" textAnchor="middle" style={{ fill: 'white', fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit,sans-serif' }}>
                {score}
              </text>
              <text x="90" y="104" textAnchor="middle" style={{ fill: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'Outfit,sans-serif' }}>
                Score
              </text>
            </svg>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 12, delay: 0.8 }}
              style={{
                position: 'absolute', top: -8, right: -16,
                background: accuracy >= 70 ? 'rgba(34,197,94,0.2)' : 'rgba(166,28,60,0.2)',
                border: `1px solid ${accuracy >= 70 ? 'rgba(34,197,94,0.4)' : 'rgba(166,28,60,0.4)'}`,
                color: accuracy >= 70 ? '#4ade80' : 'var(--color-cherry-rose)',
                padding: '4px 12px', borderRadius: 999,
                fontSize: '0.8rem', fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {accuracy.toFixed(1)}% Accuracy
            </motion.div>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 16, padding: 24 }}>
            <h4 style={{ color: '#4ade80', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} /> Strong Topics
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {strong.length > 0
                ? strong.map(t => <span key={t} style={{ background: 'rgba(34,197,94,0.15)', color: '#86efac', padding: '4px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600 }}>{t}</span>)
                : <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>No strong topics identified yet.</span>}
            </div>
          </div>

          <div style={{ background: 'rgba(166,28,60,0.06)', border: '1px solid rgba(166,28,60,0.2)', borderRadius: 16, padding: 24 }}>
            <h4 style={{ color: 'var(--color-cherry-rose)', fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={16} /> Areas for Improvement
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {weak.length > 0
                ? weak.map(t => <span key={t} style={{ background: 'rgba(166,28,60,0.15)', color: 'var(--color-cherry-rose)', padding: '4px 12px', borderRadius: 8, fontSize: '0.82rem', fontWeight: 600 }}>{t}</span>)
                : <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>No weak areas detected!</span>}
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ background: 'rgba(123,178,217,0.06)', border: '1px solid rgba(123,178,217,0.18)', borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <h4 style={{ color: 'var(--color-sky-bright)', fontWeight: 700, marginBottom: 14 }}>🧠 AI Suggestions</h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {suggestions.map((s, i) => (
                <li key={i} style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', lineHeight: 1.6, paddingLeft: 16, borderLeft: '2px solid rgba(123,178,217,0.3)' }}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Security Violation Banner */}
        {examTerminated && (
          <div style={{
            background: 'rgba(166,28,60,0.12)', border: '1px solid rgba(166,28,60,0.3)',
            borderRadius: 12, padding: '14px 20px', marginBottom: 24,
            display: 'flex', alignItems: 'center', gap: 12,
            color: 'var(--color-cherry-rose)',
          }}>
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.88rem', fontWeight: 500, lineHeight: 1.5 }}>
              This exam was terminated prematurely due to a detected security violation. The incident has been logged and reported to the invigilator.
            </p>
          </div>
        )}

        {/* Logout */}
        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary mx-auto" onClick={onLogout}>
            Logout Portal <LogOut size={15} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
