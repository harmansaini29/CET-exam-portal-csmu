import React from 'react';
import { motion } from 'framer-motion';
import { User, Timer, CheckCircle2, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

export default function ExamEngine({
  questions, answers, setAnswers,
  currentQuestion, setCurrentQuestion,
  timeLeft, studentName, examTerminated,
  onSubmit,
}) {
  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const urgent = timeLeft < 300;

  const selectAnswer = (idx) => {
    const next = [...answers];
    next[currentQuestion] = idx;
    setAnswers(next);
  };

  return (
    <div className="exam-lockdown exam-inner-container">
      {/* Top Bar */}
      <div className="max-w-6xl mx-auto mb-6 glass-morphism" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(123,178,217,0.15)', borderRadius: 10, padding: 8 }}>
            <User size={20} style={{ color: 'var(--color-sky-reflection)' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-sky-reflection)', fontWeight: 700 }}>Candidate</p>
            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{studentName || 'Student'}</p>
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 20px', borderRadius: 999,
          border: `2px solid ${urgent ? 'var(--color-cherry-rose)' : 'var(--color-sky-reflection)'}`,
          animation: urgent ? 'pulse 1.5s infinite' : 'none',
        }}>
          <Timer size={18} style={{ color: urgent ? 'var(--color-cherry-rose)' : 'var(--color-sky-reflection)' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800, color: urgent ? 'var(--color-cherry-rose)' : 'white' }}>
            {formatTime(timeLeft)}
          </span>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div className="security-badge">🔒 Zero-Tolerance Active</div>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>Any violation = instant submit</p>
        </div>
      </div>

      {/* Exam Window */}
      <div className="exam-window glass-morphism max-w-6xl mb-6" style={{ position: 'relative' }}>
        {/* Q Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <span style={{ background: 'rgba(255,255,255,0.08)', padding: '4px 16px', borderRadius: 999, fontSize: '0.82rem', fontWeight: 600 }}>
            Question {currentQuestion + 1} <span style={{ color: 'rgba(255,255,255,0.4)' }}>of {questions.length}</span>
          </span>
          <span style={{ color: 'var(--color-sky-reflection)', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {questions[currentQuestion]?.topic}
          </span>
        </div>

        {/* Question Text */}
        <h2 style={{ fontSize: '1.3rem', fontWeight: 500, lineHeight: 1.6, marginBottom: 32, color: 'white' }}>
          {questions[currentQuestion]?.question}
        </h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions[currentQuestion]?.options.map((opt, idx) => {
            const selected = answers[currentQuestion] === idx;
            return (
              <motion.button
                key={`${currentQuestion}-${idx}`}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.07, duration: 0.3 }}
                onClick={() => selectAnswer(idx)}
                className={`option-btn ${selected ? 'shadow-glow' : ''}`}
                style={{
                  width: '100%', textAlign: 'left', padding: '18px 22px',
                  borderRadius: 14, display: 'flex', alignItems: 'center', gap: 14,
                  border: `2px solid ${selected ? 'var(--color-sky-reflection)' : 'rgba(255,255,255,0.07)'}`,
                  background: selected ? 'rgba(123,178,217,0.10)' : 'rgba(255,255,255,0.04)',
                  cursor: 'pointer', transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}}
                onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}}
              >
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                  border: `2px solid ${selected ? 'var(--color-sky-reflection)' : 'rgba(255,255,255,0.25)'}`,
                  background: selected ? 'var(--color-sky-reflection)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.18s ease',
                }}>
                  {selected && <div style={{ width: 8, height: 8, background: 'white', borderRadius: '50%' }} />}
                </div>
                <span style={{ fontSize: '1rem', color: selected ? 'white' : 'rgba(255,255,255,0.85)' }}>{opt}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 40, paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            className="nav-btn btn-ghost"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(p => p - 1)}
            style={{ opacity: currentQuestion === 0 ? 0 : 1 }}
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button className="nav-btn btn-primary px-10" onClick={() => onSubmit()}>
              Submit Final <CheckCircle2 size={16} />
            </button>
          ) : (
            <button className="nav-btn btn-primary px-10" onClick={() => setCurrentQuestion(p => p + 1)}>
              Next Question <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Termination Overlay */}
        {examTerminated && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 14 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 70,
              background: 'rgba(166,28,60,0.97)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'inherit',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 12,
            }}
          >
            <ShieldCheck size={80} style={{ color: 'white' }} />
            <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-0.03em' }}>EXAM TERMINATED</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem' }}>Security violation detected. Auto-submitting your answers…</p>
          </motion.div>
        )}
      </div>

      {/* Question Palette */}
      <div className="max-w-6xl mx-auto pb-10" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(38px, 1fr))', gap: 6 }}>
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQuestion(i)}
            className="palette-btn"
            style={{
              aspectRatio: '1', borderRadius: 8,
              fontSize: '0.75rem', fontWeight: 700,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: currentQuestion === i
                ? 'var(--color-sky-reflection)'
                : answers[i] !== null
                  ? 'rgba(34,197,94,0.4)'
                  : 'rgba(255,255,255,0.08)',
              color: currentQuestion === i ? 'white' : answers[i] !== null ? '#86efac' : 'rgba(255,255,255,0.5)',
              outline: currentQuestion === i ? '2px solid rgba(255,255,255,0.4)' : 'none',
              outlineOffset: 2,
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
