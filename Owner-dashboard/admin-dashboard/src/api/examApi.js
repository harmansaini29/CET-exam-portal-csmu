const BASE = import.meta.env.VITE_API_BASE_URL

export const getExams          = () => fetch(`${BASE}/exams/`).then(r => r.json())
export const getExamById       = (id) => fetch(`${BASE}/exams/${id}`).then(r => r.json())
export const getLiveExam       = () => fetch(`${BASE}/exams/live`).then(r => r.json())
export const getUpcomingExams  = () => fetch(`${BASE}/exams/upcoming`).then(r => r.json())
export const getCompletedExams = () => fetch(`${BASE}/exams/completed`).then(r => r.json())
export const createExam        = (data) => fetch(`${BASE}/exams/create`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
}).then(r => r.json())