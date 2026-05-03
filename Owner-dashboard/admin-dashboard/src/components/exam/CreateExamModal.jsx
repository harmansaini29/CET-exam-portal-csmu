import { useState } from 'react'
import { createExam } from '../../api/examApi'

export default function CreateExamForm({ onSuccess }) {
  const [form, setForm] = useState({
    title: '', subject: 'Physics', duration: 60,
    start_time: '', exam_type: 'MCQ', instructions: '', total_marks: 100
  })
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [drag, setDrag]       = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title || !form.start_time) {
      alert('Please fill in title and start time')
      return
    }
    setLoading(true)
    try {
      await createExam(form)
      setSuccess(true)
      if (onSuccess) onSuccess()
    } catch (e) {
      alert('Failed to create exam')
    }
    setLoading(false)
  }

  if (success) return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
      <h3 style={{ marginBottom: 8 }}>Exam Created!</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
        The exam has been scheduled successfully.
      </p>
      <button className="btn btn-primary" onClick={() => setSuccess(false)}>
        Create Another
      </button>
    </div>
  )

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Exam Title *</label>
        <input
          className="form-input"
          placeholder="e.g. Physics Unit 4 Test"
          value={form.title}
          onChange={e => set('title', e.target.value)}
        />
      </div>

      <div className="form-row form-group">
        <div>
          <label className="form-label">Subject</label>
          <select className="form-input" value={form.subject} onChange={e => set('subject', e.target.value)}>
            {['Physics','Mathematics','Chemistry','Computer Science','English','Biology'].map(s =>
              <option key={s}>{s}</option>
            )}
          </select>
        </div>
        <div>
          <label className="form-label">Question Type</label>
          <select className="form-input" value={form.exam_type} onChange={e => set('exam_type', e.target.value)}>
            {['MCQ','Descriptive','MCQ + Short Answer'].map(t =>
              <option key={t}>{t}</option>
            )}
          </select>
        </div>
      </div>

      <div className="form-row form-group">
        <div>
          <label className="form-label">Start Date & Time *</label>
          <input
            className="form-input"
            type="datetime-local"
            value={form.start_time}
            onChange={e => set('start_time', e.target.value)}
          />
        </div>
        <div>
          <label className="form-label">Duration (minutes)</label>
          <select className="form-input" value={form.duration} onChange={e => set('duration', Number(e.target.value))}>
            {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
      </div>

      <div className="form-row form-group">
        <div>
          <label className="form-label">Total Marks</label>
          <input
            className="form-input"
            type="number"
            value={form.total_marks}
            onChange={e => set('total_marks', Number(e.target.value))}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Instructions</label>
        <textarea
          className="form-input"
          rows={3}
          placeholder="Enter exam instructions for students..."
          value={form.instructions}
          onChange={e => set('instructions', e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Upload Questions File</label>
        <div
          className={`upload-zone ${drag ? 'dragover' : ''}`}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => {
            e.preventDefault()
            setDrag(false)
            setFile(e.dataTransfer.files[0])
          }}
          onClick={() => document.getElementById('file-input').click()}
        >
          <div className="upload-icon">📄</div>
          {file ? (
            <div>
              <p style={{ fontWeight: 600, color: 'var(--blue-text)' }}>{file.name}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Click to change file
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 600 }}>Drag & drop or click to upload</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                Supports .pdf, .docx, .xlsx, .csv
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                AI will parse questions automatically (coming soon)
              </p>
            </div>
          )}
        </div>
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx,.xlsx,.csv"
          style={{ display: 'none' }}
          onChange={e => setFile(e.target.files[0])}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
        <button className="btn" onClick={() => setForm({ title:'',subject:'Physics',duration:60,start_time:'',exam_type:'MCQ',instructions:'',total_marks:100 })}>
          Clear
        </button>
        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Creating...' : '✓ Create Exam'}
        </button>
      </div>
    </div>
  )
}