/**
 * ============================================================
 * <AdminDashboard /> — Invigilator Control Panel
 * ============================================================
 * TEAMMATE INTEGRATION HOOK:
 * This component renders the admin results table and question
 * upload form. It consumes data from /admin_results and
 * /add_question endpoints.
 *
 * ML TEAMMATE DROP-IN:
 * The backend ML engine lives at Backend/ml/analysis.py.
 * To swap in a new model, replace the analyze_performance()
 * function in that file — the Flask route at /submit_exam
 * calls it directly. No frontend changes required.
 * ============================================================
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle2, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function AdminDashboard({ token, adminData, availableExams, onLogout }) {
  const [selectedExamForUpload, setSelectedExamForUpload] = useState('');
  const [newQuestionText, setNewQuestionText]             = useState('');
  const [newOptions, setNewOptions]                       = useState(['', '', '', '']);
  const [newCorrectAnswer, setNewCorrectAnswer]           = useState('');
  const [newMarks, setNewMarks]                           = useState(1);
  const [saving, setSaving]                               = useState(false);

  const handleSaveQuestion = async () => {
    if (!selectedExamForUpload || !newQuestionText || !newCorrectAnswer || newOptions.some(o => !o)) {
      alert('Please fill in all fields.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/add_question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          exam_id: selectedExamForUpload,
          question_text: newQuestionText,
          options: newOptions,
          correct_answer: newCorrectAnswer,
          marks: newMarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Question saved successfully!');
        setNewQuestionText(''); setNewOptions(['', '', '', '']); setNewCorrectAnswer(''); setNewMarks(1);
      } else {
        alert(`Error: ${data.message || data.error}`);
      }
    } catch (err) {
      alert('Failed to save question.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto pt-10 px-4 pb-20"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <ShieldCheck className="mx-auto w-16 h-16 text-cherry-rose mb-4" />
        <h1 className="text-4xl font-extrabold tracking-tight text-ivory-mist">Admin Dashboard</h1>
        <p className="text-white\/50 mt-2 text-sm">Invigilator Control Panel · All submissions are read-only</p>
      </div>

      {/* Results Table */}
      <div className="glass-morphism p-8 mb-10 fade-in">
        <h2 className="text-2xl font-bold text-sky-reflection mb-6">Candidate Submissions</h2>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border-b border-white\/20">
                {['Student Name','Score','Accuracy','Security Flags','Weak Topics'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: h.includes('Security') ? 'var(--color-cherry-rose)' : 'var(--color-sky-reflection)', fontWeight: 700 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adminData.map((row, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.student_name}</td>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-sky-bright)' }}>{row.score}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: row.accuracy >= 70 ? 'rgba(34,197,94,0.15)' : 'rgba(166,28,60,0.15)', color: row.accuracy >= 70 ? '#4ade80' : 'var(--color-cherry-rose)', padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {row.accuracy.toFixed(1)}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    {row.tab_switches > 0
                      ? <span className="security-badge">⚠ {row.tab_switches} Violation{row.tab_switches > 1 ? 's' : ''}</span>
                      : <span style={{ color: '#4ade80', fontWeight: 600 }}>✓ Clean</span>}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div className="flex flex-wrap gap-1">
                      {row.weak_topics?.length > 0
                        ? row.weak_topics.map(t => <span key={t} style={{ background: 'rgba(166,28,60,0.18)', color: 'var(--color-cherry-rose)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.75rem' }}>{t}</span>)
                        : <span style={{ color: '#4ade80' }}>None</span>}
                    </div>
                  </td>
                </motion.tr>
              ))}
              {adminData.length === 0 && (
                <tr><td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>No submissions found yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Question Form */}
      <div className="glass-morphism p-8 fade-in mb-10">
        <h3 className="text-2xl font-bold text-sky-reflection mb-6">Add New Question</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Select Exam</label>
            <select className="input-field" value={selectedExamForUpload} onChange={e => setSelectedExamForUpload(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}>
              <option value="">-- Choose Exam --</option>
              {availableExams.map(ex => <option key={ex.id} value={ex.id} style={{ color: 'black' }}>{ex.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Question Text</label>
            <textarea className="input-field" rows="3" value={newQuestionText} onChange={e => setNewQuestionText(e.target.value)} placeholder="Enter question text..." style={{ resize: 'vertical' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {newOptions.map((opt, i) => (
              <div key={i}>
                <label className="label">Option {i + 1}</label>
                <input type="text" className="input-field" value={opt} onChange={e => { const u = [...newOptions]; u[i] = e.target.value; setNewOptions(u); }} placeholder={`Option ${i + 1}`} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Correct Answer</label>
              <select className="input-field" value={newCorrectAnswer} onChange={e => setNewCorrectAnswer(e.target.value)} style={{ background: 'rgba(0,0,0,0.3)', color: 'white' }}>
                <option value="">-- Select --</option>
                {newOptions.map((opt, i) => opt && <option key={i} value={opt} style={{ color: 'black' }}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Marks</label>
              <input type="number" className="input-field" value={newMarks} onChange={e => setNewMarks(e.target.value)} min="1" />
            </div>
          </div>
          <button className="btn-primary w-full mt-2" onClick={handleSaveQuestion} disabled={saving}>
            {saving ? 'Saving...' : 'Save Question'} <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="text-center">
        <button className="btn-primary mx-auto" onClick={onLogout}>
          Logout Portal <LogOut className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
