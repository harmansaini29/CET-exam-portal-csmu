const BASE = import.meta.env.VITE_API_BASE_URL

export const getViolations        = () => fetch(`${BASE}/violations/live`).then(r => r.json())
export const getStudentViolations = (id) => fetch(`${BASE}/violations/student/${id}`).then(r => r.json())