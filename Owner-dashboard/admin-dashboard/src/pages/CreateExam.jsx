import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, FileText, Check, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000';

export default function CreateExam() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [uploadMode, setUploadMode] = useState('manual'); // 'manual' or 'pdf'
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [formData, setFormData] = useState({
    exam_id: 1, // For manual entry
    title: '',
    duration: 60,
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
      
      if (uploadMode === 'pdf') {
        if (!selectedFile) {
          setError('Please select a PDF file first.');
          setLoading(false);
          return;
        }
        
        if (!formData.title || !formData.duration) {
          setError('Please provide an exam title and duration.');
          setLoading(false);
          return;
        }

        const data = new FormData();
        data.append('file', selectedFile);
        data.append('title', formData.title);
        data.append('duration', formData.duration);
        
        const res = await fetch(`${API_URL}/upload_exam_pdf`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: data
        });
        
        const result = await res.json();
        if (res.ok) {
          setSuccess(`Successfully parsed ${result.count} questions!`);
          setSelectedFile(null);
          setTimeout(() => setSuccess(false), 3000);
        } else {
          setError(result.message || 'Failed to upload PDF');
        }
      } else {
        const res = await fetch(`${API_URL}/add_question`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(formData)
        });

        const result = await res.json();
        if (res.ok) {
          setSuccess('Question successfully added to the database!');
          setFormData({
            ...formData,
            question_text: '',
            options: ['', '', '', ''],
            correct_answer: ''
          });
          setTimeout(() => setSuccess(false), 3000);
        } else {
          setError(result.message || 'Failed to add question');
        }
      }
    } catch (err) {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="glass-morphism" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-ivory-mist)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <FileText size={24} color="var(--color-sky-bright)" /> Add New Question
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '6px' }}>Inject a new question directly into the live examination database.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button 
            type="button"
            onClick={() => setUploadMode('manual')}
            className={`btn ${uploadMode === 'manual' ? 'btn-primary' : ''}`}
            style={{ flex: 1 }}
          >
            Manual Entry
          </button>
          <button 
            type="button"
            onClick={() => setUploadMode('pdf')}
            className={`btn ${uploadMode === 'pdf' ? 'btn-primary' : ''}`}
            style={{ flex: 1 }}
          >
            Upload PDF
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {uploadMode === 'manual' ? (
            <>
              <div>
                <label className="form-label">Question Text</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.question_text}
                  onChange={e => setFormData({...formData, question_text: e.target.value})}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  placeholder="e.g., What is the time complexity of QuickSort?"
                />
              </div>

              <div className="form-row">
                <div>
                  <label className="form-label">Exam ID</label>
                  <input 
                    type="number" required min="1"
                    value={formData.exam_id}
                    onChange={e => setFormData({...formData, exam_id: parseInt(e.target.value) || 1})}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Marks</label>
                  <input 
                    type="number" required min="1"
                    value={formData.marks}
                    onChange={e => setFormData({...formData, marks: parseInt(e.target.value) || 1})}
                    className="form-input"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Multiple Choice Options</label>
                <div className="form-row">
                  {formData.options.map((opt, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', fontWeight: 600 }}>{String.fromCharCode(65 + i)}</span>
                      <input 
                        required
                        type="text" 
                        value={opt}
                        onChange={e => handleOptionChange(i, e.target.value)}
                        className="form-input"
                        style={{ paddingLeft: '32px' }}
                        placeholder={`Option ${i+1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Correct Answer (Must match one option exactly)</label>
                <input 
                  required
                  type="text" 
                  value={formData.correct_answer}
                  onChange={e => setFormData({...formData, correct_answer: e.target.value})}
                  className="form-input"
                  style={{ color: 'var(--color-green-safe)', fontWeight: 600 }}
                  placeholder="Paste the correct option text here"
                />
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="form-row">
                <div>
                  <label className="form-label">New Exam Title</label>
                  <input 
                    type="text" required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="form-input"
                    placeholder="e.g., Midterm CS101"
                  />
                </div>
                <div>
                  <label className="form-label">Exam Duration (Minutes)</label>
                  <input 
                    type="number" required min="1"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: parseInt(e.target.value) || 60})}
                    className="form-input"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Upload PDF File</label>
                <div className="upload-zone" onClick={() => document.getElementById('pdf-upload').click()} style={{ cursor: 'pointer', padding: '40px', border: '2px dashed var(--glass-border)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <input 
                    id="pdf-upload"
                    type="file" 
                    accept=".pdf" 
                    style={{ display: 'none' }} 
                    onChange={handleFileChange}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <AlertCircle size={32} color="var(--color-sky-reflection)" />
                    <span style={{ fontSize: '1rem', color: 'var(--color-ivory-mist)' }}>
                      {selectedFile ? selectedFile.name : 'Click to select a PDF file'}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                      Ensure PDF follows the standard format: "1. Question... A) Option B) Option... Answer: A"
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '12px', background: 'rgba(166,28,60,0.1)', border: '1px solid rgba(166,28,60,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--color-cherry-glow)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {success && (
            <div style={{ padding: '12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-sm)', color: 'var(--color-green-safe)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
              <Check size={18} /> {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
            style={{
              padding: '16px',
              fontSize: '1rem',
              marginTop: '10px',
              width: '100%',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : <><PlusCircle size={20} /> {uploadMode === 'pdf' ? 'Parse & Append PDF' : 'Append to Exam'}</>}
          </button>
        </form>
      </div>
    </motion.div>
  );
}