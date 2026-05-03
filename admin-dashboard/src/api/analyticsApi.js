const BASE = import.meta.env.VITE_API_BASE_URL

export const getLiveAnalytics  = () => fetch(`${BASE}/analytics/live`).then(r => r.json())
export const getExamAnalytics  = (id) => fetch(`${BASE}/analytics/exam/${id}`).then(r => r.json())