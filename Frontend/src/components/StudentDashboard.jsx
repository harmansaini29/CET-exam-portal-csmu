import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Timer, ArrowRight } from 'lucide-react';

export default function StudentDashboard({ availableExams, token, onStartExam }) {
  const API_URL = import.meta.env.VITE_API_BASE_URL;

  const handleStart = async (exam) => {
    try {
      const res  = await fetch(`${API_URL}/start_exam?exam_id=${exam.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        try { await document.documentElement.requestFullscreen(); } catch (_) {}
        onStartExam({ questions: data, examId: exam.id, durationSeconds: exam.duration_minutes * 60 || 1500 });
      } else {
        alert('Failed to load exam questions. Please try again.');
      }
    } catch {
      alert('Server connection error.');
    }
  };

  return (
    <motion.div
      key="student-dashboard"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-4xl mx-auto pt-10 px-4 pb-20"
    >
      <div className="text-center mb-10">
        <ClipboardList size={64} style={{ color: 'var(--color-cherry-rose)', margin: '0 auto 16px', display: 'block' }} />
        <h1 className="text-4xl font-extrabold tracking-tight text-ivory-mist">Available Exams</h1>
        <p className="text-white\/50 mt-2 text-sm">Select an exam below to enter fullscreen lockdown and begin</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {availableExams.map((exam, i) => (
          <motion.div
            key={exam.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-morphism p-6"
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-sky-bright)', marginBottom: 8 }}>{exam.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 16, fontSize: '0.9rem', lineHeight: 1.6 }}>{exam.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 20 }}>
                <Timer size={15} />
                <span>{exam.duration_minutes} minutes · AI-proctored</span>
              </div>
            </div>
            <button
              id={`start-exam-${exam.id}-btn`}
              className="btn-primary w-full"
              onClick={() => handleStart(exam)}
            >
              Start Exam <ArrowRight size={15} />
            </button>
          </motion.div>
        ))}

        {availableExams.length === 0 && (
          <div
            className="glass-morphism p-10 text-center"
            style={{ gridColumn: 'span 2', color: 'rgba(255,255,255,0.35)' }}
          >
            No exams are available at this time. Please contact your invigilator.
          </div>
        )}
      </div>
    </motion.div>
  );
}
