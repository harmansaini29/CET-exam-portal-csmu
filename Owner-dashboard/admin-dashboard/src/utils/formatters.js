export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export const formatTime = (dateStr) =>
  new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })

export const formatDuration = (mins) => {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60), m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

export const getRiskColor = (score) => {
  if (score >= 70) return '#ef4444'
  if (score >= 40) return '#f59e0b'
  return '#22c55e'
}

export const getRiskLabel = (score) => {
  if (score >= 70) return { label: 'High', cls: 'pill-risk' }
  if (score >= 40) return { label: 'Med',  cls: 'pill-medium' }
  return { label: 'Low', cls: 'pill-idle' }
}