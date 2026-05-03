import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, FileText, Check, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function CreateExam() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    exam_id: 1, // Defaulting to exam 1 for simplicity
    question_text: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    marks: 1
  });

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = localStorage.getItem('adminToken') || '';
      const res = await fetch(`${API_URL}/add_question`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setFormData({
          ...formData,
          question_text: '',
          options: ['', '', '', ''],
          correct_answer: ''
        });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.message || 'Failed to add question');
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-3xl mx-auto"
    >
      <div className="card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '32px' }}>
        <div style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-ivory-mist)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FileText size={24} color="var(--color-sky-bright)" /> Add New Question
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px' }}>Inject a new question directly into the live examination database.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-ivory-mist)', fontSize: '0.9rem' }}>Question Text</label>
            <textarea 
              required
              rows={3}
              value={formData.question_text}
              onChange={e => setFormData({...formData, question_text: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }}
              placeholder="e.g., What is the time complexity of QuickSort?"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-ivory-mist)', fontSize: '0.9rem' }}>Exam ID</label>
              <input 
                type="number" required min="1"
                value={formData.exam_id}
                onChange={e => setFormData({...formData, exam_id: parseInt(e.target.value) || 1})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-ivory-mist)', fontSize: '0.9rem' }}>Marks</label>
              <input 
                type="number" required min="1"
                value={formData.marks}
                onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 1})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-ivory-mist)', fontSize: '0.9rem' }}>Multiple Choice Options</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {formData.options.map((opt, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>{String.fromCharCode(65 + i)}</span>
                  <input 
                    required
                    type="text" 
                    value={opt}
                    onChange={e => handleOptionChange(i, e.target.value)}
                    style={{ width: '100%', padding: '10px 10px 10px 32px', borderRadius: '6px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    placeholder={`Option ${i+1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--color-ivory-mist)', fontSize: '0.9rem' }}>Correct Answer (Must match one option exactly)</label>
            <input 
              required
              type="text" 
              value={formData.correct_answer}
              onChange={e => setFormData({...formData, correct_answer: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-green-safe)', fontWeight: 500 }}
              placeholder="Paste the correct option text here"
            />
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(166,28,60,0.1)', border: '1px solid rgba(166,28,60,0.3)', borderRadius: '8px', color: 'var(--color-cherry-rose)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: 'var(--color-green-safe)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
              <Check size={16} /> Question successfully added to the database!
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '14px',
              background: 'var(--gradient-accent)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Committing...' : <><PlusCircle size={18} /> Append to Exam</>}
          </button>
        </form>
      </div>
    </motion.div>
  );
}